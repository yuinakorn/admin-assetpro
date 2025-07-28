import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Filter, 
  Package, 
  Edit, 
  AlertTriangle, 
  UserCheck, 
  Trash2, 
  Clock, 
  Eye,
  Calendar,
  User,
  Building
} from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { EquipmentService } from "@/services/equipmentService"
import { useToast } from "@/hooks/use-toast"

interface HistoryItem {
  id: string
  equipment_id: string
  equipment_name: string
  equipment_code: string
  action_type: string
  field_name?: string
  old_value?: string
  new_value?: string
  change_reason?: string
  created_at: string
  changed_by_name?: string
  changed_by_role?: string
}

export default function History() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const historyData = await EquipmentService.getAllEquipmentHistory()
      setHistory(historyData)
    } catch (error) {
      console.error('Error loading history:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดประวัติการแก้ไขได้",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case 'create':
        return <Package className="w-4 h-4 text-green-600" />
      case 'update':
        return <Edit className="w-4 h-4 text-blue-600" />
      case 'status_change':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'assignment_change':
        return <UserCheck className="w-4 h-4 text-purple-600" />
      case 'delete':
        return <Trash2 className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getActionTypeBadge = (actionType: string) => {
    const config = {
      create: { variant: "default" as const, text: "สร้างครุภัณฑ์", color: "bg-green-50 text-green-700 border-green-200" },
      update: { variant: "outline" as const, text: "แก้ไขข้อมูล", color: "bg-blue-50 text-blue-700 border-blue-200" },
      status_change: { variant: "outline" as const, text: "เปลี่ยนสถานะ", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      assignment_change: { variant: "outline" as const, text: "เปลี่ยนการมอบหมาย", color: "bg-purple-50 text-purple-700 border-purple-200" },
      delete: { variant: "destructive" as const, text: "ลบครุภัณฑ์", color: "bg-red-50 text-red-700 border-red-200" }
    }

    const actionConfig = config[actionType as keyof typeof config] || config.update

    return (
      <Badge variant={actionConfig.variant} className={actionConfig.color}>
        {actionConfig.text}
      </Badge>
    )
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Filter history based on search and filters
  const filteredHistory = history.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.equipment_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.changed_by_name && item.changed_by_name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesActionType = actionTypeFilter === "all" || item.action_type === actionTypeFilter

    const matchesDate = dateFilter === "all" || (() => {
      const itemDate = new Date(item.created_at)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const lastWeek = new Date(today)
      lastWeek.setDate(lastWeek.getDate() - 7)
      const lastMonth = new Date(today)
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      switch (dateFilter) {
        case "today":
          return itemDate.toDateString() === today.toDateString()
        case "yesterday":
          return itemDate.toDateString() === yesterday.toDateString()
        case "last_week":
          return itemDate >= lastWeek
        case "last_month":
          return itemDate >= lastMonth
        default:
          return true
      }
    })()

    return matchesSearch && matchesActionType && matchesDate
  })

  const getChangeDescription = (item: HistoryItem) => {
    if (item.field_name && item.field_name !== 'general') {
      const fieldName = EquipmentService.getFieldDisplayName(item.field_name)
      const oldValue = EquipmentService.formatValueForDisplay(item.field_name, item.old_value || '')
      const newValue = EquipmentService.formatValueForDisplay(item.field_name, item.new_value || '')
      
      return `เปลี่ยน ${fieldName} จาก "${oldValue}" เป็น "${newValue}"`
    }
    
    switch (item.action_type) {
      case 'create':
        return 'สร้างครุภัณฑ์ใหม่'
      case 'delete':
        return 'ลบครุภัณฑ์'
      default:
        return 'แก้ไขข้อมูล'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">ประวัติการแก้ไข</h1>
            <p className="text-muted-foreground">
              ดูประวัติการเปลี่ยนแปลงครุภัณฑ์ทั้งหมดในระบบ
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              ตัวกรอง
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">ค้นหา</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="ค้นหาตามชื่อครุภัณฑ์, รหัส, หรือผู้แก้ไข..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">ประเภทการกระทำ</label>
                <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภท" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="create">สร้างครุภัณฑ์</SelectItem>
                    <SelectItem value="update">แก้ไขข้อมูล</SelectItem>
                    <SelectItem value="status_change">เปลี่ยนสถานะ</SelectItem>
                    <SelectItem value="assignment_change">เปลี่ยนการมอบหมาย</SelectItem>
                    <SelectItem value="delete">ลบครุภัณฑ์</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">ช่วงเวลา</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกช่วงเวลา" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="today">วันนี้</SelectItem>
                    <SelectItem value="yesterday">เมื่อวาน</SelectItem>
                    <SelectItem value="last_week">7 วันล่าสุด</SelectItem>
                    <SelectItem value="last_month">30 วันล่าสุด</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("")
                    setActionTypeFilter("all")
                    setDateFilter("all")
                  }}
                  className="w-full"
                >
                  ล้างตัวกรอง
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>ประวัติการแก้ไข ({filteredHistory.length} รายการ)</span>
              <Button variant="outline" size="sm" onClick={loadHistory}>
                รีเฟรช
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">กำลังโหลดประวัติ...</span>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>ไม่พบประวัติการแก้ไข</p>
                <p className="text-sm">ลองเปลี่ยนตัวกรองหรือค้นหาด้วยคำอื่น</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHistory.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg border">
                    <div className="flex-shrink-0 mt-1">
                      {getActionTypeIcon(item.action_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getActionTypeBadge(item.action_type)}
                        <span className="text-sm font-medium text-foreground">
                          {item.equipment_name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({item.equipment_code})
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/equipment/detail/${item.equipment_id}`)}
                          className="ml-auto"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          ดูรายละเอียด
                        </Button>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        {getChangeDescription(item)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>โดย {item.changed_by_name || 'ระบบ'}</span>
                          {item.changed_by_role && (
                            <span>({item.changed_by_role})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDateTime(item.created_at)}</span>
                        </div>
                      </div>
                      
                      {item.change_reason && (
                        <div className="text-sm text-muted-foreground mt-2 p-2 bg-background rounded border">
                          <span className="font-medium">เหตุผล:</span> {item.change_reason}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 