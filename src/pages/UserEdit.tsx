import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Loader2, Eye, EyeOff } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { UserService } from "@/services/userService"
import { useToast } from "@/hooks/use-toast"

export default function UserEdit() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "user" as "admin" | "manager" | "user",
    department_id: "",
    is_active: true
  })

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [departments, setDepartments] = useState<Array<{ id: string; name: string; code: string }>>([])
  const [departmentsLoading, setDepartmentsLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isPasswordChanged, setIsPasswordChanged] = useState(false)

  // Load user data and departments on component mount
  useEffect(() => {
    if (id) {
      loadUserData(id)
      loadDepartments()
    }
  }, [id])

  // Check password strength
  useEffect(() => {
    if (isPasswordChanged) {
      const strength = calculatePasswordStrength(formData.password)
      setPasswordStrength(strength)
    }
  }, [formData.password, isPasswordChanged])

  const loadUserData = async (userId: string) => {
    try {
      setInitialLoading(true)
      const userData = await UserService.getUser(userId)
      
      if (!userData) {
        toast({
          title: "ไม่พบข้อมูล",
          description: "ไม่พบข้อมูลผู้ใช้งานนี้",
          variant: "destructive"
        })
        navigate("/users")
        return
      }

      setFormData({
        username: userData.username,
        email: userData.email,
        password: "", // Don't load password
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone || "",
        role: userData.role,
        department_id: userData.department_id || "",
        is_active: userData.is_active
      })
    } catch (error) {
      console.error('Error loading user data:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้",
        variant: "destructive"
      })
    } finally {
      setInitialLoading(false)
    }
  }

  const loadDepartments = async () => {
    try {
      setDepartmentsLoading(true)
      const data = await UserService.getDepartmentsForUser()
      setDepartments(data)
    } catch (error) {
      console.error('Error loading departments:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดรายชื่อแผนกได้",
        variant: "destructive"
      })
    } finally {
      setDepartmentsLoading(false)
    }
  }

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    return strength
  }

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 2) return "text-red-500"
    if (strength <= 3) return "text-yellow-500"
    if (strength <= 4) return "text-blue-500"
    return "text-green-500"
  }

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 2) return "อ่อน"
    if (strength <= 3) return "ปานกลาง"
    if (strength <= 4) return "ดี"
    return "แข็งแกร่ง"
  }

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password })
    setIsPasswordChanged(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Validate required fields
      if (!formData.username.trim() || !formData.email.trim() || 
          !formData.first_name.trim() || !formData.last_name.trim()) {
        toast({
          title: "ข้อมูลไม่ครบถ้วน",
          description: "กรุณากรอกข้อมูลที่จำเป็นให้ครบ",
          variant: "destructive"
        })
        return
      }

      // Validate password if changed
      if (isPasswordChanged && formData.password.trim()) {
        if (passwordStrength < 3) {
          toast({
            title: "รหัสผ่านไม่ปลอดภัย",
            description: "กรุณาตั้งรหัสผ่านให้มีความปลอดภัยมากขึ้น",
            variant: "destructive"
          })
          return
        }
      }

      // Check if username exists (excluding current user)
      const usernameExists = await UserService.checkUsernameExists(formData.username, id)
      if (usernameExists) {
        toast({
          title: "Username ซ้ำ",
          description: "Username นี้มีผู้ใช้งานแล้ว กรุณาเลือก Username อื่น",
          variant: "destructive"
        })
        return
      }

      // Check if email exists (excluding current user)
      const emailExists = await UserService.checkEmailExists(formData.email, id)
      if (emailExists) {
        toast({
          title: "Email ซ้ำ",
          description: "Email นี้มีผู้ใช้งานแล้ว กรุณาใช้ Email อื่น",
          variant: "destructive"
        })
        return
      }

      // Prepare update data
      const updateData: any = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim() || null,
        role: formData.role,
        department_id: formData.department_id || null,
        is_active: formData.is_active
      }

      // Only include password if changed
      if (isPasswordChanged && formData.password.trim()) {
        updateData.password_hash = formData.password
      }

      // Update user
      await UserService.updateUser(id!, updateData)
      
      toast({
        title: "สำเร็จ",
        description: "อัปเดตข้อมูลผู้ใช้งานเรียบร้อยแล้ว"
      })
      
      // Navigate back to user detail
      navigate(`/users/detail/${id}`)
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตข้อมูลผู้ใช้งานได้",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">กำลังโหลดข้อมูล...</span>
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
              onClick={() => navigate(`/users/detail/${id}`)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">แก้ไขข้อมูลผู้ใช้งาน</h1>
              <p className="text-muted-foreground">
                แก้ไขข้อมูลผู้ใช้งานในระบบ
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
                      <Label htmlFor="first_name">ชื่อ *</Label>
                      <Input 
                        id="first_name" 
                        placeholder="ชื่อจริง"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">นามสกุล *</Label>
                      <Input 
                        id="last_name" 
                        placeholder="นามสกุล"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">Username *</Label>
                      <Input 
                        id="username" 
                        placeholder="ชื่อผู้ใช้"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input 
                        id="email" 
                        type="email"
                        placeholder="อีเมล"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                      <Input 
                        id="phone" 
                        placeholder="081-234-5678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">รหัสผ่านใหม่ (ไม่บังคับ)</Label>
                      <div className="relative">
                        <Input 
                          id="password" 
                          type={showPassword ? "text" : "password"}
                          placeholder="เว้นว่างหากไม่ต้องการเปลี่ยน"
                          value={formData.password}
                          onChange={(e) => handlePasswordChange(e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {isPasswordChanged && formData.password && (
                        <div className="mt-1">
                          <p className={`text-xs ${getPasswordStrengthColor(passwordStrength)}`}>
                            ความปลอดภัย: {getPasswordStrengthText(passwordStrength)} ({passwordStrength}/5)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Role and Department */}
              <Card>
                <CardHeader>
                  <CardTitle>บทบาทและแผนก</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="role">บทบาท *</Label>
                      <Select 
                        value={formData.role} 
                        onValueChange={(value: "admin" | "manager" | "user") => setFormData({ ...formData, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกบทบาท" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">ผู้ใช้งาน</SelectItem>
                          <SelectItem value="manager">ผู้จัดการ</SelectItem>
                          <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="department">แผนก</Label>
                      {departmentsLoading ? (
                        <div className="flex items-center gap-2 py-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">กำลังโหลดแผนก...</span>
                        </div>
                      ) : (
                        <Select 
                          value={formData.department_id} 
                          onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกแผนก (ไม่บังคับ)" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name} ({dept.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
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
                    <Label htmlFor="is_active">ผู้ใช้งานใช้งาน</Label>
                    <Switch 
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formData.is_active 
                      ? "ผู้ใช้งานนี้จะสามารถเข้าสู่ระบบได้" 
                      : "ผู้ใช้งานนี้จะถูกปิดใช้งานชั่วคราว"
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
                      disabled={loading}
                    >
                      {loading ? (
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
                      onClick={() => navigate(`/users/detail/${id}`)}
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