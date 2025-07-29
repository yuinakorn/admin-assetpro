import { useState } from "react"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { EquipmentCategoryService } from "@/services/equipmentCategoryService"
import { useNavigate } from "react-router-dom"
import { EquipmentCategoryInsert } from "@/types/database"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function CategoryAdd() {
  const [formData, setFormData] = useState<EquipmentCategoryInsert>({
    name: "",
    code: "",
    description: "",
    icon: "Package",
    color: "#3B82F6",
    is_active: true,
    sort_order: 0
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.code.trim()) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกชื่อและรหัสประเภทครุภัณฑ์",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      
      // Check if code already exists
      const codeExists = await EquipmentCategoryService.checkCodeExists(formData.code)
      if (codeExists) {
        toast({
          title: "รหัสซ้ำ",
          description: "รหัสประเภทครุภัณฑ์นี้มีอยู่ในระบบแล้ว",
          variant: "destructive",
        })
        return
      }

      await EquipmentCategoryService.createCategory(formData)
      
      toast({
        title: "เพิ่มสำเร็จ",
        description: "เพิ่มประเภทครุภัณฑ์เรียบร้อยแล้ว",
      })
      
      navigate("/categories")
    } catch (error) {
      console.error('Error creating category:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มประเภทครุภัณฑ์ได้",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof EquipmentCategoryInsert, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateRandomColor = () => {
    const colors = [
      '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444',
      '#6B7280', '#EC4899', '#14B8A6', '#F97316', '#84CC16'
    ]
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    handleInputChange('color', randomColor)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/categories")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับ
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">เพิ่มประเภทครุภัณฑ์</h1>
            <p className="text-muted-foreground">
              เพิ่มประเภทครุภัณฑ์ใหม่เข้าสู่ระบบ
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลประเภทครุภัณฑ์</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">ชื่อประเภท *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="เช่น คอมพิวเตอร์, โน้ตบุ๊ค, จอภาพ"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="code">รหัสประเภท *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                    placeholder="เช่น COMPUTER, LAPTOP, MONITOR"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">คำอธิบาย</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="อธิบายรายละเอียดของประเภทครุภัณฑ์นี้"
                  rows={3}
                />
              </div>

              {/* Icon and Color */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="icon">ไอคอน</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => handleInputChange('icon', e.target.value)}
                    placeholder="เช่น Monitor, Laptop, Printer"
                  />
                  <p className="text-xs text-muted-foreground">
                    ชื่อไอคอนที่ใช้แสดงในระบบ
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="color">สี</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      placeholder="#3B82F6"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateRandomColor}
                    >
                      สุ่มสี
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <Label htmlFor="sort_order">ลำดับการแสดงผล</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs text-muted-foreground">
                  ลำดับการแสดงผลในรายการ (ตัวเลขน้อยแสดงก่อน)
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <Label htmlFor="is_active">ใช้งาน</Label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/categories")}
                >
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}