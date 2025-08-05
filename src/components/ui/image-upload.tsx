import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Upload, Camera, Image as ImageIcon, Trash2, Star, Zap, Loader2 } from 'lucide-react'
import { ImageService, ImageUploadResult } from '@/services/imageService'
import { ImageCompression, CompressedImageResult } from '@/lib/imageCompression'
import { useToast } from '@/hooks/use-toast'

interface ImageUploadProps {
  equipmentId?: string
  onImagesUploaded?: (images: ImageUploadResult[]) => void
  maxImages?: number
  className?: string
  compressionOptions?: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    maxFileSize?: number
  }
}

interface ImagePreview {
  id: string
  file: File
  previewUrl: string
  isPrimary: boolean
  isUploading: boolean
  uploadProgress?: number
  compressionInfo?: {
    originalSize: number
    compressedSize: number
    compressionRatio: number
    width: number
    height: number
  }
}

export function ImageUpload({ 
  equipmentId, 
  onImagesUploaded, 
  maxImages = 10,
  className = '',
  compressionOptions = {}
}: ImageUploadProps) {
  const [images, setImages] = useState<ImagePreview[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return

    const newImages: ImagePreview[] = []
    const currentCount = images.length
    const filesArray = Array.from(files)

    // ตรวจสอบจำนวนไฟล์
    if (currentCount + filesArray.length > maxImages) {
      toast({
        title: "เกินจำนวนรูปภาพที่อนุญาต",
        description: `สามารถอัพโหลดได้สูงสุด ${maxImages} รูป`,
        variant: "destructive"
      })
      return
    }

    // ตรวจสอบไฟล์
    for (const file of filesArray) {
      if (!ImageService.isValidImageFile(file)) {
        toast({
          title: "ไฟล์ไม่ถูกต้อง",
          description: "กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, GIF, WebP) ขนาดไม่เกิน 10MB",
          variant: "destructive"
        })
        return
      }
    }

    setIsCompressing(true)

    try {
      // บีบอัดรูปภาพ
      const compressionResults = await ImageCompression.compressImages(filesArray, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
        maxFileSize: 2 * 1024 * 1024, // 2MB
        ...compressionOptions
      })

      // สร้าง preview สำหรับรูปภาพที่บีบอัดแล้ว
      compressionResults.forEach((result, index) => {
        const previewUrl = ImageService.createPreviewUrl(result.file)
        newImages.push({
          id: `preview-${Date.now()}-${index}`,
          file: result.file,
          previewUrl,
          isPrimary: currentCount + index === 0, // รูปแรกเป็นรูปหลัก
          isUploading: false,
          compressionInfo: {
            originalSize: result.originalSize,
            compressedSize: result.compressedSize,
            compressionRatio: result.compressionRatio,
            width: result.width,
            height: result.height
          }
        })
      })

      setImages(prev => [...prev, ...newImages])

      // แสดงผลการบีบอัด
      const totalOriginalSize = compressionResults.reduce((sum, result) => sum + result.originalSize, 0)
      const totalCompressedSize = compressionResults.reduce((sum, result) => sum + result.compressedSize, 0)
      const totalCompressionRatio = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100

      if (totalCompressionRatio > 0) {
        toast({
          title: "บีบอัดรูปภาพสำเร็จ",
          description: `ลดขนาดไฟล์ลง ${totalCompressionRatio.toFixed(1)}% (${ImageCompression.formatFileSize(totalOriginalSize)} → ${ImageCompression.formatFileSize(totalCompressedSize)})`,
        })
      }
    } catch (error) {
      console.error('Error compressing images:', error)
      toast({
        title: "เกิดข้อผิดพลาดในการบีบอัด",
        description: "ไม่สามารถบีบอัดรูปภาพได้ ใช้ไฟล์ต้นฉบับแทน",
        variant: "destructive"
      })
    } finally {
      setIsCompressing(false)
    }
  }, [images, maxImages, toast, compressionOptions])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    await handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleFileInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleFileSelect(e.target.files)
    if (e.target) {
      e.target.value = '' // Reset input
    }
  }, [handleFileSelect])

  const handleCameraInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleFileSelect(e.target.files)
    if (e.target) {
      e.target.value = '' // Reset input
    }
  }, [handleFileSelect])

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id)
      if (imageToRemove) {
        ImageService.revokePreviewUrl(imageToRemove.previewUrl)
      }
      
      const newImages = prev.filter(img => img.id !== id)
      
      // ถ้าลบรูปหลัก ให้ตั้งค่ารูปแรกเป็นรูปหลัก
      if (imageToRemove?.isPrimary && newImages.length > 0) {
        newImages[0].isPrimary = true
      }
      
      return newImages
    })
  }, [])

  const setPrimaryImage = useCallback((id: string) => {
    setImages(prev => 
      prev.map(img => ({
        ...img,
        isPrimary: img.id === id
      }))
    )
  }, [])

  const uploadImages = useCallback(async () => {
    if (!equipmentId || images.length === 0) return

    const uploadPromises = images.map(async (image) => {
      try {
        setImages(prev => 
          prev.map(img => 
            img.id === image.id 
              ? { ...img, isUploading: true, uploadProgress: 0 }
              : img
          )
        )

        const result = await ImageService.uploadImage(
          image.file, 
          equipmentId, 
          image.isPrimary
        )

        setImages(prev => 
          prev.map(img => 
            img.id === image.id 
              ? { ...img, isUploading: false, uploadProgress: 100 }
              : img
          )
        )

        return result
      } catch (error) {
        console.error('Error uploading image:', error)
        setImages(prev => 
          prev.map(img => 
            img.id === image.id 
              ? { ...img, isUploading: false }
              : img
          )
        )
        
        toast({
          title: "อัพโหลดรูปภาพล้มเหลว",
          description: error instanceof Error ? error.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
          variant: "destructive"
        })
        
        return null
      }
    })

    const results = await Promise.all(uploadPromises)
    const successfulUploads = results.filter(result => result !== null)

    if (successfulUploads.length > 0) {
      toast({
        title: "อัพโหลดสำเร็จ",
        description: `อัพโหลดรูปภาพ ${successfulUploads.length} รูปเรียบร้อยแล้ว`,
      })

      // Clear uploaded images
      setImages([])
      
      // Notify parent component
      if (onImagesUploaded) {
        onImagesUploaded(successfulUploads)
      }
    }
  }, [equipmentId, images, onImagesUploaded, toast])

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const openCamera = () => {
    cameraInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card className={`border-2 border-dashed transition-colors ${
        isDragging 
          ? 'border-primary bg-primary/5' 
          : 'border-muted-foreground/25 hover:border-primary/50'
      }`}>
        <CardContent className="p-6">
          <div
            className="flex flex-col items-center justify-center space-y-4 text-center"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                ลากและวางรูปภาพที่นี่ หรือ
              </h3>
              <p className="text-sm text-muted-foreground">
                รองรับ JPG, PNG, GIF, WebP ขนาดไม่เกิน 10MB
              </p>
              <p className="text-xs text-muted-foreground">
                รูปภาพจะถูกบีบอัดอัตโนมัติเพื่อประหยัดพื้นที่จัดเก็บ
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={openFileDialog}
                className="flex items-center gap-2"
                disabled={isCompressing}
              >
                <Upload className="w-4 h-4" />
                เลือกไฟล์
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={openCamera}
                className="flex items-center gap-2"
                disabled={isCompressing}
              >
                <Camera className="w-4 h-4" />
                กล้อง
              </Button>
            </div>

            {isCompressing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                กำลังบีบอัดรูปภาพ...
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              สามารถอัพโหลดได้สูงสุด {maxImages} รูป
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Hidden Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraInputChange}
        className="hidden"
      />

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">รูปภาพที่เลือก ({images.length}/{maxImages})</h4>
              {images.length > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  {(() => {
                    const totalOriginalSize = images.reduce((sum, img) => 
                      sum + (img.compressionInfo?.originalSize || img.file.size), 0)
                    const totalCompressedSize = images.reduce((sum, img) => 
                      sum + img.file.size, 0)
                    const totalCompressionRatio = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100
                    
                    return (
                      <div className="flex items-center gap-2">
                        <span>ขนาดรวม: {ImageCompression.formatFileSize(totalCompressedSize)}</span>
                        {totalCompressionRatio > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-green-600">
                              ประหยัด {totalCompressionRatio.toFixed(1)}%
                            </span>
                          </>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
            <Button 
              type="button" 
              size="sm"
              onClick={uploadImages}
              disabled={!equipmentId || images.some(img => img.isUploading)}
            >
              อัพโหลดรูปภาพ
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="relative group">
                <CardContent className="p-2">
                  <div className="relative aspect-square">
                    <img
                      src={image.previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                      <div className="absolute inset-0 flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setPrimaryImage(image.id)}
                          disabled={image.isPrimary}
                          className="h-8 px-2"
                        >
                          <Star className="w-3 h-3" />
                        </Button>
                        
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeImage(image.id)}
                          className="h-8 px-2"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {image.isPrimary && (
                        <Badge variant="default" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          หลัก
                        </Badge>
                      )}
                      
                      {image.isUploading && (
                        <Badge variant="secondary" className="text-xs">
                          อัพโหลด...
                        </Badge>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {image.isUploading && image.uploadProgress !== undefined && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted rounded-b-md overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${image.uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground truncate">
                      {image.file.name}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {image.compressionInfo ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-green-500" />
                            <span>
                              {ImageCompression.formatFileSize(image.compressionInfo.compressedSize)}
                            </span>
                            {image.compressionInfo.compressionRatio > 0 && (
                              <Badge variant="secondary" className="text-xs px-1 py-0">
                                -{image.compressionInfo.compressionRatio.toFixed(0)}%
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground/70">
                            จาก {ImageCompression.formatFileSize(image.compressionInfo.originalSize)}
                          </div>
                          <div className="text-xs text-muted-foreground/70">
                            {image.compressionInfo.width} × {image.compressionInfo.height}
                          </div>
                        </div>
                      ) : (
                        <div>
                          {ImageCompression.formatFileSize(image.file.size)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 