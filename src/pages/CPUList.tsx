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
import { cpuService, CPU } from '@/services/cpuService'
import { useToast } from '@/hooks/use-toast'

export default function CPUList() {
  const [cpus, setCpus] = useState<CPU[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCpu, setSelectedCpu] = useState<CPU | null>(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    fetchCPUs()
  }, [])

  const fetchCPUs = async () => {
    try {
      setLoading(true)
      const data = await cpuService.getAllCPUs()
      setCpus(data)
    } catch (error) {
      console.error('Error fetching CPUs:', error)
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูล CPU ได้',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedCpu) return
    try {
      await cpuService.deleteCPU(selectedCpu.id!)
      toast({ title: 'ลบ CPU สำเร็จ' })
      fetchCPUs() // Refresh data
    } catch (error) {
      console.error('Error deleting CPU:', error)
      toast({ title: 'เกิดข้อผิดพลาดในการลบ CPU', variant: 'destructive' })
    } finally {
      setDialogOpen(false)
      setSelectedCpu(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">จัดการ CPU</h1>
        <Button onClick={() => navigate('/properties/cpu/add')}>
          <PlusCircle className="mr-2 h-4 w-4" /> เพิ่ม CPU
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการ CPU ทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>กำลังโหลดข้อมูล...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อ CPU</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cpus.map((cpu) => (
                  <TableRow key={cpu.id}>
                    <TableCell className="font-medium">{cpu.cpu_name}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => navigate(`/properties/cpu/edit/${cpu.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>แก้ไข</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedCpu(cpu)
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
              คุณแน่ใจหรือไม่ว่าต้องการลบ "{selectedCpu?.cpu_name}"? การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedCpu(null)}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>ลบ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
