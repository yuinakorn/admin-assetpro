import { supabase } from '@/integrations/supabase/client'

export interface ImageUploadResult {
  url: string
  path: string
  name: string
  size: number
  mimeType: string
}

interface EquipmentImageInsert {
  equipment_id: string
  image_url: string
  image_name?: string
  file_size?: number
  mime_type?: string
  is_primary?: boolean
  uploaded_by?: string
}

export class ImageService {
  /**
   * อัพโหลดรูปภาพไปยัง Supabase Storage
   */
  static async uploadImage(
    file: File, 
    equipmentId: string,
    isPrimary: boolean = false
  ): Promise<ImageUploadResult> {
    try {
      // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop()
      const fileName = `${equipmentId}/${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`
      
      // อัพโหลดไฟล์ไปยัง Supabase Storage
      const { data, error } = await supabase.storage
        .from('equipment-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw new Error(`Failed to upload image: ${error.message}`)
      }

      // สร้าง URL สำหรับเข้าถึงรูปภาพ
      const { data: urlData } = supabase.storage
        .from('equipment-images')
        .getPublicUrl(fileName)

      const result: ImageUploadResult = {
        url: urlData.publicUrl,
        path: fileName,
        name: file.name,
        size: file.size,
        mimeType: file.type
      }

      // บันทึกข้อมูลรูปภาพลงฐานข้อมูล
      await this.saveImageToDatabase(equipmentId, result, isPrimary)

      return result
    } catch (error) {
      console.error('Error uploading image:', error)
      throw new Error(`ไม่สามารถอัพโหลดรูปภาพได้: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * บันทึกข้อมูลรูปภาพลงฐานข้อมูล
   */
  private static async saveImageToDatabase(
    equipmentId: string,
    imageData: ImageUploadResult,
    isPrimary: boolean
  ): Promise<void> {
    try {
      // ถ้าเป็นรูปหลัก ให้ยกเลิกรูปหลักอื่นๆ ก่อน
      if (isPrimary) {
        await supabase
          .from('equipment_images')
          .update({ is_primary: false })
          .eq('equipment_id', equipmentId)
          .eq('is_primary', true)
      }

      // บันทึกรูปภาพใหม่
      const imageDataToInsert: EquipmentImageInsert = {
        equipment_id: equipmentId,
        image_url: imageData.url,
        image_name: imageData.name,
        file_size: imageData.size,
        mime_type: imageData.mimeType,
        is_primary: isPrimary,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id
      }
      
      const { error } = await supabase
        .from('equipment_images')
        .insert(imageDataToInsert)

      if (error) {
        throw new Error(`Failed to save image to database: ${error.message}`)
      }
    } catch (error) {
      console.error('Error saving image to database:', error)
      throw error
    }
  }

  /**
   * ดึงรูปภาพทั้งหมดของครุภัณฑ์
   */
  static async getEquipmentImages(equipmentId: string) {
    try {
      const { data, error } = await supabase
        .from('equipment_images')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch images: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error fetching equipment images:', error)
      throw new Error(`ไม่สามารถดึงรูปภาพได้: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * ลบรูปภาพ
   */
  static async deleteImage(imageId: string): Promise<void> {
    try {
      // ดึงข้อมูลรูปภาพก่อนลบ
      const { data: imageData, error: fetchError } = await supabase
        .from('equipment_images')
        .select('image_url')
        .eq('id', imageId)
        .single()

      if (fetchError) {
        throw new Error(`Failed to fetch image data: ${fetchError.message}`)
      }

      // ลบจาก Supabase Storage
      const path = imageData.image_url.split('/').pop()
      if (path) {
        const { error: storageError } = await supabase.storage
          .from('equipment-images')
          .remove([path])

        if (storageError) {
          console.warn('Failed to delete from storage:', storageError)
        }
      }

      // ลบจากฐานข้อมูล
      const { error: dbError } = await supabase
        .from('equipment_images')
        .delete()
        .eq('id', imageId)

      if (dbError) {
        throw new Error(`Failed to delete image from database: ${dbError.message}`)
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      throw new Error(`ไม่สามารถลบรูปภาพได้: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * ตั้งค่ารูปภาพเป็นรูปหลัก
   */
  static async setPrimaryImage(imageId: string, equipmentId: string): Promise<void> {
    try {
      // ยกเลิกรูปหลักอื่นๆ
      await supabase
        .from('equipment_images')
        .update({ is_primary: false })
        .eq('equipment_id', equipmentId)
        .eq('is_primary', true)

      // ตั้งค่ารูปภาพใหม่เป็นรูปหลัก
      const { error } = await supabase
        .from('equipment_images')
        .update({ is_primary: true })
        .eq('id', imageId)

      if (error) {
        throw new Error(`Failed to set primary image: ${error.message}`)
      }
    } catch (error) {
      console.error('Error setting primary image:', error)
      throw new Error(`ไม่สามารถตั้งค่ารูปภาพหลักได้: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * ตรวจสอบว่าไฟล์เป็นรูปภาพหรือไม่
   */
  static isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB

    return validTypes.includes(file.type) && file.size <= maxSize
  }

  /**
   * สร้าง preview URL สำหรับรูปภาพ
   */
  static createPreviewUrl(file: File): string {
    return URL.createObjectURL(file)
  }

  /**
   * ลบ preview URL
   */
  static revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url)
  }
} 