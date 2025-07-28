import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { DepartmentService } from "@/services/departmentService"
import { useToast } from "@/hooks/use-toast"
import type { Department } from "@/types/database"

export default function DepartmentEdit() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    manager_id: "",
    is_active: true
  })

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [users, setUsers] = useState<Array<{ id: string; name: string; role: string }>>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [department, setDepartment] = useState<Department | null>(null)

  // Load department data and users
  useEffect(() => {
    if (id) {
      loadDepartment()
      loadUsers()
    }
  }, [id])

  const loadDepartment = async () => {
    if (!id) return
    
    try {
      setLoading(true)
      const data = await DepartmentService.getDepartment(id)
      if (data) {
        setDepartment(data)
        setFormData({
          name: data.name,
          code: data.code,
          description: data.description || "",
          manager_id: data.manager_id || "",
          is_active: data.is_active
        })
      } else {
        toast({
          title: "ไม่พบข้อมูล",
          description: "ไม่พบแผนกที่ต้องการแก้ไข",
          variant: "destructive"
        })
        navigate("/departments")
      }
    } catch (error) {
      console.error('Error loading department:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลแผนกได้",
        variant: "destructive"
      })
      navigate("/departments")
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      setUsersLoading(true)
      const data = await DepartmentService.getUsersForManager()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดรายชื่อผู้จัดการได้",
        variant: "destructive"
      })
    } finally {
      setUsersLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    
    setSaving(true)
    
    try {
      // Validate required fields
      if (!formData.name.trim() || !formData.code.trim()) {
        toast({
          title: "ข้อมูลไม่ครบถ้วน",
          description: "กรุณากรอกชื่อแผนกและรหัสแผนก",
          variant: "destructive"
        })
        return
      }

      // Update department
      await DepartmentService.updateDepartment(id, {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        manager_id: formData.manager_id || null,
        is_active: formData.is_active
      })
      
      toast({
        title: "สำเร็จ",
        description: "อัปเดตข้อมูลแผนกเรียบร้อยแล้ว"
      })
      
      // Navigate back to department list
      navigate("/departments")
    } catch (error) {
      console.error("Error updating department:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตแผนกได้",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>กำลังโหลดข้อมูลแผนก...</span>
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
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/departments")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">แก้ไขแผนก</h1>
              <p className="text-muted-foreground">
                แก้ไขข้อมูลแผนก: {department?.name}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">ชื่อแผนก *</Label>
                      <Input 
                        id="name" 
                        placeholder="เช่น แผนกคอมพิวเตอร์"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="code">รหัสแผนก *</Label>
                      <Input 
                        id="code" 
                        placeholder="เช่น IT"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">คำอธิบาย</Label>
                    <Textarea 
                      id="description" 
                      placeholder="อธิบายหน้าที่และความรับผิดชอบของแผนก..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Manager Assignment */}
              <Card>
                <CardHeader>
                  <CardTitle>ผู้จัดการแผนก</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="manager">ผู้จัดการ</Label>
                    {usersLoading ? (
                      <div className="flex items-center gap-2 py-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">กำลังโหลดรายชื่อ...</span>
                      </div>
                    ) : (
                      <Select 
                        value={formData.manager_id} 
                        onValueChange={(value) => setFormData({ ...formData, manager_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกผู้จัดการ (ไม่บังคับ)" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      สามารถเปลี่ยนผู้จัดการได้ตลอดเวลา
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>สถานะ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active">แผนกใช้งาน</Label>
                    <Switch 
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formData.is_active 
                      ? "แผนกนี้สามารถใช้งานได้" 
                      : "แผนกนี้ถูกปิดใช้งานชั่วคราว"
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Button 
                      type="submit" 
                      className="w-full gap-2" 
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      บันทึกการเปลี่ยนแปลง
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      type="button"
                      onClick={() => navigate("/departments")}
                    >
                      ยกเลิก
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
} 