import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save } from 'lucide-react'
import { cpuService } from '@/services/cpuService'
import { useToast } from '@/hooks/use-toast'

export default function CPUAdd() {
  const [cpuName, setCpuName] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cpuName.trim()) {
      toast({ title: 'กรุณากรอกชื่อ CPU', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      await cpuService.createCPU({ cpu_name: cpuName })
      toast({ title: 'เพิ่ม CPU สำเร็จ' })
      navigate('/properties/cpu')
    } catch (error) {
      console.error('Error creating CPU:', error)
      toast({ title: 'เกิดข้อผิดพลาดในการเพิ่ม CPU', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/properties/cpu')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">เพิ่ม CPU ใหม่</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>รายละเอียด CPU</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="cpu_name">ชื่อ CPU</Label>
              <Input
                id="cpu_name"
                value={cpuName}
                onChange={(e) => setCpuName(e.target.value)}
                placeholder="เช่น Intel Core i9"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/properties/cpu')}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
