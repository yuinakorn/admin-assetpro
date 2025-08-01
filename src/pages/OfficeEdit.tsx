import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save } from 'lucide-react'
import { officeService } from '@/services/officeService'
import { useToast } from '@/hooks/use-toast'

export default function OfficeEdit() {
  const [officeName, setOfficeName] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()

  useEffect(() => {
    if (id) {
      setLoading(true)
      officeService.getOfficeById(id)
        .then(data => setOfficeName(data.office_name))
        .catch(error => {
          console.error('Error fetching Office:', error)
          toast({ title: 'ไม่พบ Office ที่ต้องการแก้ไข', variant: 'destructive' })
          navigate('/properties/office')
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
    if (!officeName.trim()) {
      toast({ title: 'กรุณากรอกชื่อ Office', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      await officeService.updateOffice(id, { office_name: officeName })
      toast({ title: 'แก้ไข Office สำเร็จ' })
      navigate('/properties/office')
    } catch (error) {
      console.error('Error updating Office:', error)
      toast({ title: 'เกิดข้อผิดพลาดในการแก้ไข Office', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/properties/office')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">แก้ไข Office</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>รายละเอียด Office</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !officeName ? (
            <p>กำลังโหลด...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="office_name">ชื่อ Office</Label>
                <Input
                  id="office_name"
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  placeholder="เช่น Microsoft 365"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => navigate('/properties/office')}>
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
