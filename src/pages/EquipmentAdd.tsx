import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Upload, QrCode } from "lucide-react"
import { useState } from "react"

export default function EquipmentAdd() {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    brand: "",
    model: "",
    serialNumber: "",
    assetNumber: "",
    purchaseDate: "",
    warrantyDate: "",
    status: "ใช้งานปกติ",
    department: "",
    location: "",
    user: "",
    cpu: "",
    ram: "",
    storage: "",
    gpu: "",
    os: "",
    productKey: "",
    ipAddress: "",
    macAddress: "",
    hostname: "",
    notes: ""
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">เพิ่มครุภัณฑ์ใหม่</h1>
            <p className="text-muted-foreground">
              บันทึกข้อมูลครุภัณฑ์คอมพิวเตอร์เข้าสู่ระบบ
            </p>
          </div>
          <Button className="gap-2">
            <QrCode className="w-4 h-4" />
            สร้าง QR Code
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* ข้อมูลทั่วไป */}
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลทั่วไป</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">ชื่อครุภัณฑ์ *</Label>
                    <Input id="name" placeholder="เช่น Desktop PC, Laptop" />
                  </div>
                  <div>
                    <Label htmlFor="type">ประเภทครุภัณฑ์ *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภท" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="computer">คอมพิวเตอร์</SelectItem>
                        <SelectItem value="laptop">โน้ตบุ๊ค</SelectItem>
                        <SelectItem value="monitor">จอภาพ</SelectItem>
                        <SelectItem value="printer">เครื่องพิมพ์</SelectItem>
                        <SelectItem value="ups">UPS</SelectItem>
                        <SelectItem value="network">Network Device</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="brand">ยี่ห้อ *</Label>
                    <Input id="brand" placeholder="เช่น Dell, HP, Lenovo" />
                  </div>
                  <div>
                    <Label htmlFor="model">รุ่น/โมเดล *</Label>
                    <Input id="model" placeholder="เช่น OptiPlex 7090" />
                  </div>
                  <div>
                    <Label htmlFor="serialNumber">Serial Number *</Label>
                    <Input id="serialNumber" placeholder="S/N ของครุภัณฑ์" />
                  </div>
                  <div>
                    <Label htmlFor="assetNumber">เลขครุภัณฑ์ *</Label>
                    <Input id="assetNumber" placeholder="เลขสินทรัพย์" />
                  </div>
                  <div>
                    <Label htmlFor="purchaseDate">วันที่ได้มา</Label>
                    <Input id="purchaseDate" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="warrantyDate">วันที่หมดประกัน</Label>
                    <Input id="warrantyDate" type="date" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ข้อมูลเฉพาะคอมพิวเตอร์ */}
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลเฉพาะคอมพิวเตอร์</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cpu">CPU</Label>
                    <Input id="cpu" placeholder="เช่น Intel Core i5-11500" />
                  </div>
                  <div>
                    <Label htmlFor="ram">RAM</Label>
                    <Input id="ram" placeholder="เช่น 8GB DDR4" />
                  </div>
                  <div>
                    <Label htmlFor="storage">Storage</Label>
                    <Input id="storage" placeholder="เช่น 256GB SSD" />
                  </div>
                  <div>
                    <Label htmlFor="gpu">Graphic Card</Label>
                    <Input id="gpu" placeholder="เช่น Intel UHD Graphics 750" />
                  </div>
                  <div>
                    <Label htmlFor="os">Operating System</Label>
                    <Input id="os" placeholder="เช่น Windows 11 Pro" />
                  </div>
                  <div>
                    <Label htmlFor="productKey">Product Key</Label>
                    <Input id="productKey" placeholder="License key (ถ้ามี)" />
                  </div>
                  <div>
                    <Label htmlFor="ipAddress">IP Address</Label>
                    <Input id="ipAddress" placeholder="เช่น 192.168.1.100" />
                  </div>
                  <div>
                    <Label htmlFor="macAddress">MAC Address</Label>
                    <Input id="macAddress" placeholder="เช่น 00:1B:44:11:3A:B7" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="hostname">Hostname</Label>
                  <Input id="hostname" placeholder="ชื่อเครื่องคอมพิวเตอร์" />
                </div>
              </CardContent>
            </Card>

            {/* ข้อมูลการใช้งาน */}
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลการใช้งาน/จัดเก็บ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">หน่วยงานที่รับผิดชอบ *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกหน่วยงาน" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="it">แผนกคอมพิวเตอร์</SelectItem>
                        <SelectItem value="accounting">แผนกบัญชี</SelectItem>
                        <SelectItem value="hr">แผนกบุคคล</SelectItem>
                        <SelectItem value="admin">แผนกธุรการ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">สถานที่ติดตั้ง</Label>
                    <Input id="location" placeholder="เช่น ห้อง 201 อาคาร A" />
                  </div>
                  <div>
                    <Label htmlFor="user">ผู้ใช้งานปัจจุบัน</Label>
                    <Input id="user" placeholder="ชื่อผู้ใช้งาน" />
                  </div>
                  <div>
                    <Label htmlFor="status">สถานะ</Label>
                    <Select defaultValue="ใช้งานปกติ">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ใช้งานปกติ">ใช้งานปกติ</SelectItem>
                        <SelectItem value="ชำรุด">ชำรุด</SelectItem>
                        <SelectItem value="ซ่อมบำรุง">ซ่อมบำรุง</SelectItem>
                        <SelectItem value="จำหน่ายแล้ว">จำหน่ายแล้ว</SelectItem>
                        <SelectItem value="เบิกแล้ว">เบิกแล้ว</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">หมายเหตุ</Label>
                  <Textarea id="notes" placeholder="รายละเอียดเพิ่มเติม..." rows={3} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* รูปภาพครุภัณฑ์ */}
            <Card>
              <CardHeader>
                <CardTitle>รูปภาพครุภัณฑ์</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">อัปโหลดรูปภาพครุภัณฑ์</p>
                  <Button variant="outline" size="sm">
                    เลือกไฟล์
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ปุ่มดำเนินการ */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    บันทึกครุภัณฑ์
                  </Button>
                  <Button variant="outline" className="w-full">
                    ยกเลิก
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}