import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save } from 'lucide-react'
import { harddiskService } from '@/services/harddiskService'
import { useToast } from '@/hooks/use-toast'

export default function HarddiskEdit() {
  const [hddType, setHddType] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()

  useEffect(() => {
    if (id) {
      setLoading(true)
      harddiskService.getHarddiskById(id)
        .then(data => setHddType(data.hdd_type))
        .catch(error => {
          console.error('Error fetching harddisk type:', error)
          toast({ title: 'ไม่พบชนิดฮาร์ดดิสก์ที่ต้องการแก้ไข', variant: 'destructive' })
          navigate('/properties/harddisk')
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
    if (!hddType.trim()) {
      toast({ title: 'กรุณากรอกชนิดของฮาร์ดดิสก์', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      await harddiskService.updateHarddisk(id, { hdd_type: hddType })
      toast({ title: 'แก้ไขชนิดฮาร์ดดิสก์สำเร็จ' })
      navigate('/properties/harddisk')
    } catch (error) {
      console.error('Error updating harddisk type:', error)
      toast({ title: 'เกิดข้อผิดพลาดในการแก้ไขชนิดฮาร์ดดิสก์', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/properties/harddisk')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">แก้ไขชนิดฮาร์ดดิสก์</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>รายละเอียดชนิดฮาร์ดดิสก์</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !hddType ? (
            <p>กำลังโหลด...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="hdd_type">ชนิดของฮาร์ดดิสก์</Label>
                <Input
                  id="hdd_type"
                  value={hddType}
                  onChange={(e) => setHddType(e.target.value)}
                  placeholder="เช่น SSD, NVMe, HDD"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => navigate('/properties/harddisk')}>
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
