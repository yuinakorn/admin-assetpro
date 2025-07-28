import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  QrCode, 
  Trash2, 
  Eye,
  Download
} from "lucide-react"

const equipmentData = [
  {
    id: "EQ001",
    name: "คอมพิวเตอร์ตั้งโต๊ะ Dell OptiPlex 7090",
    type: "คอมพิวเตอร์",
    brand: "Dell",
    model: "OptiPlex 7090",
    serialNumber: "7XKWN3J",
    department: "แผนกคอมพิวเตอร์",
    user: "นายสมชาย ใจดี",
    status: "ใช้งานปกติ",
    warranty: "2025-12-31"
  },
  {
    id: "EQ002",
    name: "โน้ตบุ๊ค Lenovo ThinkPad E14",
    type: "โน้ตบุ๊ค",
    brand: "Lenovo",
    model: "ThinkPad E14",
    serialNumber: "PC1A2B3C",
    department: "แผนกบุคคล",
    user: "นางสาวมานี สบายดี",
    status: "ใช้งานปกติ",
    warranty: "2024-08-15"
  },
  {
    id: "EQ003",
    name: "เครื่องพิมพ์ HP LaserJet Pro 404dn",
    type: "เครื่องพิมพ์",
    brand: "HP",
    model: "LaserJet Pro 404dn",
    serialNumber: "VNC8K12345",
    department: "แผนกบัญชี",
    user: "นายประยุทธ์ มั่นคง",
    status: "ซ่อมบำรุง",
    warranty: "2024-03-20"
  },
  {
    id: "EQ004",
    name: "จอภาพ Samsung 24นิ้ว",
    type: "จอภาพ",
    brand: "Samsung",
    model: "S24F350FH",
    serialNumber: "SM24F350",
    department: "แผนกธุรการ",
    user: "นางสุธิดา เรียบร้อย",
    status: "ชำรุด",
    warranty: "2023-11-10"
  },
  {
    id: "EQ005",
    name: "คอมพิวเตอร์ตั้งโต๊ะ HP EliteDesk 800 G8",
    type: "คอมพิวเตอร์",
    brand: "HP",
    model: "EliteDesk 800 G8",
    serialNumber: "HP800G8001",
    department: "แผนกคอมพิวเตอร์",
    user: "นายวิชัย เก่งคอม",
    status: "ใช้งานปกติ",
    warranty: "2026-01-15"
  }
]

const statusColors = {
  "ใช้งานปกติ": "bg-success/10 text-success border-success/20",
  "ซ่อมบำรุง": "bg-warning/10 text-warning border-warning/20",
  "ชำรุด": "bg-destructive/10 text-destructive border-destructive/20",
  "จำหน่ายแล้ว": "bg-muted text-muted-foreground border-muted-foreground/20",
  "เบิกแล้ว": "bg-info/10 text-info border-info/20"
}

export default function EquipmentList() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">รายการครุภัณฑ์</h1>
            <p className="text-muted-foreground">
              จัดการและดูรายละเอียดครุภัณฑ์ทั้งหมด
            </p>
          </div>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            ส่งออกข้อมูล
          </Button>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="ค้นหาครุภัณฑ์, รหัส, หรือผู้ใช้งาน..." 
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                ตัวกรอง
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Equipment Table */}
        <Card>
          <CardHeader>
            <CardTitle>ครุภัณฑ์ทั้งหมด ({equipmentData.length} รายการ)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>รหัส</TableHead>
                    <TableHead>ชื่อครุภัณฑ์</TableHead>
                    <TableHead>ประเภท</TableHead>
                    <TableHead>ยี่ห้อ/รุ่น</TableHead>
                    <TableHead>หน่วยงาน</TableHead>
                    <TableHead>ผู้ใช้งาน</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>หมดประกัน</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipmentData.map((equipment) => (
                    <TableRow key={equipment.id}>
                      <TableCell className="font-medium">{equipment.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{equipment.name}</p>
                          <p className="text-xs text-muted-foreground">S/N: {equipment.serialNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>{equipment.type}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{equipment.brand}</p>
                          <p className="text-xs text-muted-foreground">{equipment.model}</p>
                        </div>
                      </TableCell>
                      <TableCell>{equipment.department}</TableCell>
                      <TableCell>{equipment.user}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={statusColors[equipment.status as keyof typeof statusColors]}
                        >
                          {equipment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={
                          new Date(equipment.warranty) < new Date() 
                            ? "text-destructive font-medium" 
                            : new Date(equipment.warranty) < new Date(Date.now() + 90*24*60*60*1000)
                            ? "text-warning font-medium"
                            : "text-muted-foreground"
                        }>
                          {new Date(equipment.warranty).toLocaleDateString('th-TH')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" />
                              ดูรายละเอียด
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" />
                              แก้ไข
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <QrCode className="mr-2 h-4 w-4" />
                              QR Code
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              ลบ
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}