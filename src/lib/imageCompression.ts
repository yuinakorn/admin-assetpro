export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxFileSize?: number // in bytes
}

export interface CompressedImageResult {
  file: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
  width: number
  height: number
}

export class ImageCompression {
  private static defaultOptions: CompressionOptions = {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    maxFileSize: 2 * 1024 * 1024 // 2MB
  }

  /**
   * บีบอัดรูปภาพตามขนาดและคุณภาพที่กำหนด
   */
  static async compressImage(
    file: File, 
    options: CompressionOptions = {}
  ): Promise<CompressedImageResult> {
    const opts = { ...this.defaultOptions, ...options }
    
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        try {
          // คำนวณขนาดใหม่
          const { width, height } = this.calculateDimensions(
            img.width, 
            img.height, 
            opts.maxWidth!, 
            opts.maxHeight!
          )
          
          // ตั้งค่าขนาด canvas
          canvas.width = width
          canvas.height = height
          
          // วาดรูปภาพลงบน canvas
          ctx!.drawImage(img, 0, 0, width, height)
          
          // แปลงเป็น Blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('ไม่สามารถบีบอัดรูปภาพได้'))
                return
              }
              
              // สร้างไฟล์ใหม่
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              
              const result: CompressedImageResult = {
                file: compressedFile,
                originalSize: file.size,
                compressedSize: compressedFile.size,
                compressionRatio: (1 - compressedFile.size / file.size) * 100,
                width,
                height
              }
              
              resolve(result)
            },
            file.type,
            opts.quality
          )
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => {
        reject(new Error('ไม่สามารถโหลดรูปภาพได้'))
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * บีบอัดรูปภาพหลายไฟล์พร้อมกัน
   */
  static async compressImages(
    files: File[], 
    options: CompressionOptions = {}
  ): Promise<CompressedImageResult[]> {
    const results: CompressedImageResult[] = []
    
    for (const file of files) {
      try {
        const result = await this.compressImage(file, options)
        results.push(result)
      } catch (error) {
        console.error(`Error compressing ${file.name}:`, error)
        // ถ้าบีบอัดไม่ได้ ให้ใช้ไฟล์เดิม
        results.push({
          file,
          originalSize: file.size,
          compressedSize: file.size,
          compressionRatio: 0,
          width: 0,
          height: 0
        })
      }
    }
    
    return results
  }

  /**
   * คำนวณขนาดใหม่ของรูปภาพ
   */
  private static calculateDimensions(
    originalWidth: number, 
    originalHeight: number, 
    maxWidth: number, 
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight }
    
    // ถ้ารูปภาพใหญ่กว่าขนาดสูงสุด ให้ย่อขนาดลง
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)
    }
    
    return { width, height }
  }

  /**
   * ตรวจสอบว่าต้องบีบอัดรูปภาพหรือไม่
   */
  static shouldCompress(file: File, options: CompressionOptions = {}): boolean {
    const opts = { ...this.defaultOptions, ...options }
    
    // ถ้าไฟล์เล็กกว่าขนาดสูงสุดที่กำหนด ไม่ต้องบีบอัด
    if (file.size <= opts.maxFileSize!) {
      return false
    }
    
    return true
  }

  /**
   * แสดงขนาดไฟล์ในรูปแบบที่อ่านง่าย
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * ดึงข้อมูลขนาดของรูปภาพ
   */
  static getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      
      img.onerror = () => {
        reject(new Error('ไม่สามารถอ่านขนาดรูปภาพได้'))
      }
      
      img.src = URL.createObjectURL(file)
    })
  }
} 