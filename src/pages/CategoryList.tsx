import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { EquipmentCategoryService, EquipmentCategoryWithStats } from "@/services/equipmentCategoryService"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function CategoryList() {
  const [categories, setCategories] = useState<EquipmentCategoryWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await EquipmentCategoryService.getCategoriesWithStats()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลประเภทครุภัณฑ์ได้",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setDeleteLoading(id)
      await EquipmentCategoryService.deleteCategory(id)
      toast({
        title: "ลบสำเร็จ",
        description: "ลบประเภทครุภัณฑ์เรียบร้อยแล้ว",
      })
      fetchCategories() // Refresh the list
    } catch (error) {
      console.error('Error deleting category:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบประเภทครุภัณฑ์ได้",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(null)
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      'Monitor': Package,
      'Laptop': Package,
      'Printer': Package,
      'Zap': Package,
      'Network': Package,
      'Desktop': Package,
      'Tablet': Package,
      'Server': Package,
      'Router': Package,
      'Switch': Package
    }
    return iconMap[iconName] || Package
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">จัดการประเภทครุภัณฑ์</h1>
              <p className="text-muted-foreground">
                จัดการประเภทและหมวดหมู่ของครุภัณฑ์คอมพิวเตอร์
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">กำลังโหลด...</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">จัดการประเภทครุภัณฑ์</h1>
            <p className="text-muted-foreground">
              จัดการประเภทและหมวดหมู่ของครุภัณฑ์คอมพิวเตอร์
            </p>
          </div>
          <Button onClick={() => navigate("/categories/add")}>
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มประเภทใหม่
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ค้นหาและกรอง</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="ค้นหาประเภทครุภัณฑ์..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">รายการประเภทครุภัณฑ์</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  ไม่พบประเภทครุภัณฑ์
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "ลองเปลี่ยนคำค้นหา" : "ยังไม่มีประเภทครุภัณฑ์ในระบบ"}
                </p>
                {!searchTerm && (
                  <Button onClick={() => navigate("/categories/add")}>
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มประเภทแรก
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ประเภท</TableHead>
                    <TableHead>รหัส</TableHead>
                    <TableHead>คำอธิบาย</TableHead>
                    <TableHead>จำนวนครุภัณฑ์</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="text-right">การดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => {
                    const IconComponent = getIconComponent(category.icon || 'Package')
                    return (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: category.color || '#6B7280' }}
                            >
                              <IconComponent className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium">{category.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{category.code}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {category.description || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {category.equipment_count} เครื่อง
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={category.is_active ? "default" : "secondary"}>
                            {category.is_active ? "ใช้งาน" : "ไม่ใช้งาน"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/categories/edit/${category.id}`)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={category.equipment_count > 0}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    คุณต้องการลบประเภท "{category.name}" หรือไม่?
                                    {category.equipment_count > 0 && (
                                      <span className="block mt-2 text-destructive">
                                        ไม่สามารถลบได้เนื่องจากมีครุภัณฑ์ในประเภทนี้ {category.equipment_count} เครื่อง
                                      </span>
                                    )}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(category.id)}
                                    disabled={category.equipment_count > 0 || deleteLoading === category.id}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {deleteLoading === category.id ? "กำลังลบ..." : "ลบ"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}