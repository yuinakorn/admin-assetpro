import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { EquipmentCategoryService } from "@/services/equipmentCategoryService"
import { useToast } from "@/hooks/use-toast"
import { usePermissions } from "@/hooks/usePermissions"

export default function CategoryList() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const navigate = useNavigate()
  const permissions = usePermissions()

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await EquipmentCategoryService.getCategoriesWithStats()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลประเภทครุภัณฑ์ได้",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await EquipmentCategoryService.deleteCategory(id)
      toast({
        title: "ลบประเภทครุภัณฑ์สำเร็จ",
        description: "ประเภทครุภัณฑ์ถูกลบออกจากระบบแล้ว",
      })
      loadCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบประเภทครุภัณฑ์ได้",
        variant: "destructive"
      })
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">กำลังโหลดข้อมูล...</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">ประเภทครุภัณฑ์</h1>
            <p className="text-muted-foreground">
              จัดการประเภทครุภัณฑ์ในระบบ
            </p>
          </div>
          {permissions.canAddCategories && (
            <Button onClick={() => navigate("/categories/add")}>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มประเภท
            </Button>
          )}
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>ค้นหาประเภทครุภัณฑ์</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="ค้นหาชื่อหรือรหัสประเภทครุภัณฑ์..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายการประเภทครุภัณฑ์ ({filteredCategories.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัส</TableHead>
                  <TableHead>ชื่อประเภท</TableHead>
                  <TableHead>คำอธิบาย</TableHead>
                  <TableHead>จำนวนครุภัณฑ์</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.code}</TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{category.description || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{category.equipment_count || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={category.is_active ? "default" : "secondary"}>
                        {category.is_active ? "ใช้งาน" : "ไม่ใช้งาน"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/categories/${category.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {permissions.canEditCategories && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/categories/${category.id}/edit`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {permissions.canDeleteCategories && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                                <AlertDialogDescription>
                                  คุณต้องการลบประเภทครุภัณฑ์ "{category.name}" ใช่หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(category.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  ลบ
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredCategories.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                ไม่พบประเภทครุภัณฑ์ที่ตรงกับเงื่อนไขการค้นหา
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}