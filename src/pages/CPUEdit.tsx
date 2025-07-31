import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save } from 'lucide-react'
import { cpuService } from '@/services/cpuService'
import { useToast } from '@/hooks/use-toast'

export default function CPUEdit() {
  const [cpuName, setCpuName] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()

  useEffect(() => {
    if (id) {
      setLoading(true)
      cpuService.getCPUById(id)
        .then(data => setCpuName(data.cpu_name))
        .catch(error => {
          console.error('Error fetching CPU:', error)
          toast({ title: 'ไม่พบ CPU ที่ต้องการแก้ไข', variant: 'destructive' })
          navigate('/properties/cpu')
        })
        .finally(() => setLoading(false))
    }
  }, [id, navigate, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) {
      toast({ title: 'เกิดข้อผิดพลาด: ไม่พบ ID CPU', variant: 'destructive' })
      return
    }
    if (!cpuName.trim()) {
      toast({ title: 'กรุณากรอกชื่อ CPU', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      await cpuService.updateCPU(id, { cpu_name: cpuName })
      toast({ title: 'แก้ไข CPU สำเร็จ' })
      navigate('/properties/cpu')
    } catch (error) {
      console.error('Error updating CPU:', error)
      toast({ title: 'เกิดข้อผิดพลาดในการแก้ไข CPU', variant: 'destructive' })
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
        <h1 className="text-2xl font-bold ml-2">แก้ไข CPU</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>รายละเอียด CPU</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !cpuName ? (
            <p>กำลังโหลด...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="cpu_name">ชื่อ CPU</Label>
                <Input
                  id="cpu_name"
                  value={cpuName}
                  onChange={(e) => setCpuName(e.target.value)}
                  placeholder="เช่น Intel Core i9-13900K"
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
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
