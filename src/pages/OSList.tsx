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
import { osService, OS } from '@/services/osService'
import { useToast } from '@/hooks/use-toast'

export default function OSList() {
  const [operatingSystems, setOperatingSystems] = useState<OS[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedOS, setSelectedOS] = useState<OS | null>(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    fetchOS()
  }, [])

  const fetchOS = async () => {
    try {
      setLoading(true)
      const data = await osService.getAllOS()
      setOperatingSystems(data)
    } catch (error) {
      console.error('Error fetching OS list:', error)
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลระบบปฏิบัติการได้',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedOS) return
    try {
      await osService.deleteOS(selectedOS.id!)
      toast({ title: 'ลบระบบปฏิบัติการสำเร็จ' })
      fetchOS() // Refresh data
    } catch (error) {
      console.error('Error deleting OS:', error)
      toast({ title: 'เกิดข้อผิดพลาดในการลบระบบปฏิบัติการ', variant: 'destructive' })
    } finally {
      setDialogOpen(false)
      setSelectedOS(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">จัดการระบบปฏิบัติการ</h1>
        <Button onClick={() => navigate('/properties/os/add')}>
          <PlusCircle className="mr-2 h-4 w-4" /> เพิ่มระบบปฏิบัติการ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการระบบปฏิบัติการทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>กำลังโหลดข้อมูล...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อระบบปฏิบัติการ</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operatingSystems.map((os) => (
                  <TableRow key={os.id}>
                    <TableCell className="font-medium">{os.os_name}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => navigate(`/properties/os/edit/${os.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>แก้ไข</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedOS(os)
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
              คุณแน่ใจหรือไม่ว่าต้องการลบ "{selectedOS?.os_name}"? การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedOS(null)}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>ลบ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
