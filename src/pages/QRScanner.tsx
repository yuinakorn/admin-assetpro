import { useState, useRef, useEffect } from 'react'
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Camera, QrCode, Search, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { EquipmentService } from "@/services/equipmentService"
import { useToast } from "@/hooks/use-toast"
import type { Equipment } from "@/types/database"

interface EquipmentWithDetails extends Equipment {
  department_name?: string
  current_user_name?: string
}

export default function QRScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [equipment, setEquipment] = useState<EquipmentWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<HTMLDivElement>(null)
  const html5QrCodeRef = useRef<{ stop: () => Promise<void> } | null>(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(console.error)
      }
    }
  }, [])

  // Initialize HTML5 QR Scanner
  useEffect(() => {
    if (isScanning && scannerRef.current) {
      const initScanner = async () => {
        try {
          const { Html5Qrcode } = await import('html5-qrcode')
          const html5QrCode = new Html5Qrcode("qr-reader")
          html5QrCodeRef.current = html5QrCode
          
          const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          }

          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText: string) => {
              handleQRCodeScanned(decodedText)
              html5QrCode.stop()
            },
            (errorMessage: string) => {
              // Ignore errors during scanning
            }
          )
        } catch (error) {
          console.error('Error initializing scanner:', error)
          setError('ไม่สามารถเปิดกล้องได้ กรุณาตรวจสอบสิทธิ์การเข้าถึงกล้อง')
          setIsScanning(false)
        }
      }

      initScanner()
    }
  }, [isScanning])

  const handleQRCodeScanned = async (code: string) => {
    setScannedCode(code)
    setIsScanning(false)
    setIsLoading(true)
    setError(null)

    try {
      const equipmentData = await EquipmentService.getEquipmentByCode(code)
      if (equipmentData) {
        setEquipment(equipmentData as EquipmentWithDetails)
        toast({
          title: "สแกนสำเร็จ",
          description: `พบครุภัณฑ์: ${equipmentData.name}`,
        })
      } else {
        setError('ไม่พบครุภัณฑ์ที่ตรงกับรหัสนี้')
        toast({
          title: "ไม่พบครุภัณฑ์",
          description: "รหัส QR ที่สแกนไม่ตรงกับครุภัณฑ์ในระบบ",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching equipment:', error)
      setError('เกิดข้อผิดพลาดในการดึงข้อมูลครุภัณฑ์')
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลครุภัณฑ์ได้",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startScanning = async () => {
    setIsScanning(true)
    setScannedCode(null)
    setEquipment(null)
    setError(null)
  }

  const stopScanning = async () => {
    setIsScanning(false)
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop()
      } catch (error) {
        console.error('Error stopping scanner:', error)
      }
    }
  }

  const handleManualInput = () => {
    const code = prompt('กรุณาใส่รหัสครุภัณฑ์:')
    if (code) {
      handleQRCodeScanned(code.trim())
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", text: string }> = {
      normal: { variant: "default", text: "ใช้งานปกติ" },
      maintenance: { variant: "secondary", text: "อยู่ระหว่างบำรุงรักษา" },
      damaged: { variant: "destructive", text: "ชำรุด" },
      disposed: { variant: "outline", text: "จำหน่ายแล้ว" },
      borrowed: { variant: "secondary", text: "เบิกแล้ว" }
    }
    
    const statusInfo = statusMap[status] || { variant: "outline" as const, text: status }
    return <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">สแกน QR Code</h1>
              <p className="text-muted-foreground">
                สแกนรหัส QR เพื่อดูข้อมูลครุภัณฑ์
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                สแกน QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isScanning ? (
                <div className="space-y-4">
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <QrCode className="w-16 h-16 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        กดปุ่มด้านล่างเพื่อเริ่มสแกน
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={startScanning}
                      className="flex-1"
                      disabled={isLoading}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      เปิดกล้องสแกน
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleManualInput}
                      disabled={isLoading}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      ใส่รหัส
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div 
                    ref={scannerRef}
                    id="qr-reader"
                    className="aspect-square bg-black rounded-lg overflow-hidden"
                  />
                  <Button 
                    onClick={stopScanning}
                    variant="outline"
                    className="w-full"
                  >
                    หยุดสแกน
                  </Button>
                </div>
              )}

              {scannedCode && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="font-mono text-sm">{scannedCode}</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <span className="text-sm text-destructive">{error}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Equipment Details Section */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลครุภัณฑ์</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>กำลังดึงข้อมูล...</span>
                </div>
              ) : equipment ? (
                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{equipment.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {equipment.equipment_code}
                      </Badge>
                      {getStatusBadge(equipment.status)}
                    </div>
                  </div>

                  <Separator />

                  {/* Equipment Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">ยี่ห้อ:</span>
                      <p className="font-medium">{equipment.brand}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">รุ่น:</span>
                      <p className="font-medium">{equipment.model}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">เลขประจำเครื่อง:</span>
                      <p className="font-medium font-mono">{equipment.serial_number}</p>
                    </div>
                    {equipment.asset_number && (
                      <div>
                        <span className="text-muted-foreground">เลขครุภัณฑ์:</span>
                        <p className="font-medium">{equipment.asset_number}</p>
                      </div>
                    )}
                  </div>

                  {/* Department and User */}
                  {(equipment.department_name || equipment.current_user_name) && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        {equipment.department_name && (
                          <div>
                            <span className="text-muted-foreground text-sm">แผนก:</span>
                            <p className="font-medium">{equipment.department_name}</p>
                          </div>
                        )}
                        {equipment.current_user_name && (
                          <div>
                            <span className="text-muted-foreground text-sm">ผู้ใช้งาน:</span>
                            <p className="font-medium">{equipment.current_user_name}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Location */}
                  {equipment.location && (
                    <>
                      <Separator />
                      <div>
                        <span className="text-muted-foreground text-sm">สถานที่:</span>
                        <p className="font-medium">{equipment.location}</p>
                      </div>
                    </>
                  )}

                  {/* Actions */}
                  <Separator />
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => navigate(`/equipment/${equipment.id}`)}
                      className="flex-1"
                    >
                      ดูรายละเอียดเพิ่มเติม
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setEquipment(null)
                        setScannedCode(null)
                        setError(null)
                      }}
                    >
                      สแกนใหม่
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <QrCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>สแกน QR Code เพื่อดูข้อมูลครุภัณฑ์</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
