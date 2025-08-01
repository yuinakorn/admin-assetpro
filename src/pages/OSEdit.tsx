import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save } from 'lucide-react'
import { osService } from '@/services/osService'
import { useToast } from '@/hooks/use-toast'

export default function OSEdit() {
  const [osName, setOsName] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()

  useEffect(() => {
    if (id) {
      setLoading(true)
      osService.getOSById(id)
        .then(data => setOsName(data.os_name))
        .catch(error => {
          console.error('Error fetching OS:', error)
          toast({ title: 'ไม่พบระบบปฏิบัติการที่ต้องการแก้ไข', variant: 'destructive' })
          navigate('/properties/os')
        })
        .finally(() => setLoading(false))
    }
  }, [id, navigate, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) {
      toast({ title: 'เกิดข้อผิดพลาด: ไม่พบ ID', variant: 'destructive' })
      return
    }
    if (!osName.trim()) {
      toast({ title: 'กรุณากรอกชื่อระบบปฏิบัติการ', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      await osService.updateOS(id, { os_name: osName })
      toast({ title: 'แก้ไขระบบปฏิบัติการสำเร็จ' })
      navigate('/properties/os')
    } catch (error) {
      console.error('Error updating OS:', error)
      toast({ title: 'เกิดข้อผิดพลาดในการแก้ไขระบบปฏิบัติการ', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/properties/os')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">แก้ไขระบบปฏิบัติการ</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>รายละเอียดระบบปฏิบัติการ</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !osName ? (
            <p>กำลังโหลด...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="os_name">ชื่อระบบปฏิบัติการ</Label>
                <Input
                  id="os_name"
                  value={osName}
                  onChange={(e) => setOsName(e.target.value)}
                  placeholder="เช่น Windows 11 Pro"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => navigate('/properties/os')}>
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
