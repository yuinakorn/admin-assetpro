import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, MoreHorizontal, Trash2, Edit } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { harddiskService, Harddisk } from '@/services/harddiskService'
import { useToast } from '@/hooks/use-toast'

export default function HarddiskList() {
  const [harddisks, setHarddisks] = useState<Harddisk[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedHarddisk, setSelectedHarddisk] = useState<Harddisk | null>(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    fetchHarddisks()
  }, [])

  const fetchHarddisks = async () => {
    try {
      setLoading(true)
      const data = await harddiskService.getAllHarddisks()
      setHarddisks(data)
    } catch (error) {
      console.error('Error fetching harddisks:', error)
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลชนิดฮาร์ดดิสก์ได้',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedHarddisk) return
    try {
      await harddiskService.deleteHarddisk(selectedHarddisk.id!)
      toast({ title: 'ลบชนิดฮาร์ดดิสก์สำเร็จ' })
      fetchHarddisks() // Refresh data
    } catch (error) {
      console.error('Error deleting harddisk:', error)
      toast({ title: 'เกิดข้อผิดพลาดในการลบชนิดฮาร์ดดิสก์', variant: 'destructive' })
    } finally {
      setDialogOpen(false)
      setSelectedHarddisk(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">จัดการชนิดฮาร์ดดิสก์</h1>
        <Button onClick={() => navigate('/properties/harddisk/add')}>
          <PlusCircle className="mr-2 h-4 w-4" /> เพิ่มชนิดฮาร์ดดิสก์
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการชนิดฮาร์ดดิสก์ทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>กำลังโหลดข้อมูล...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชนิดฮาร์ดดิสก์</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {harddisks.map((harddisk) => (
                  <TableRow key={harddisk.id}>
                    <TableCell className="font-medium">{harddisk.hdd_type}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => navigate(`/properties/harddisk/edit/${harddisk.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>แก้ไข</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedHarddisk(harddisk)
                            setDialogOpen(true)
                          }}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>ลบ</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบ "{selectedHarddisk?.hdd_type}"? การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedHarddisk(null)}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>ลบ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
