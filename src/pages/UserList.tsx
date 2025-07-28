import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Plus,
  Users,
  UserCheck,
  UserX,
  Loader2
} from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { UserService, UserWithDepartment } from "@/services/userService"
import { useToast } from "@/hooks/use-toast"

export default function UserList() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [users, setUsers] = useState<UserWithDepartment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)

  // Load users on component mount
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await UserService.getUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Search users
  const handleSearch = async (query: string) => {
    setSearchTerm(query)
    
    if (!query.trim()) {
      loadUsers()
      return
    }

    try {
      setSearchLoading(true)
      const results = await UserService.searchUsers(query)
      setUsers(results)
    } catch (error) {
      console.error('Error searching users:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถค้นหาผู้ใช้งานได้",
        variant: "destructive"
      })
    } finally {
      setSearchLoading(false)
    }
  }

  // Delete user
  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้งานนี้?')) return

    try {
      await UserService.deleteUser(id)
      toast({
        title: "สำเร็จ",
        description: "ลบผู้ใช้งานเรียบร้อยแล้ว"
      })
      loadUsers() // Reload the list
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบผู้ใช้งานได้",
        variant: "destructive"
      })
    }
  }

  // Filter users based on search term (client-side fallback)
  const filteredUsers = users.filter(user =>
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.department_name && user.department_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default'
      case 'manager':
        return 'secondary'
      case 'user':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'manager':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'user':
        return 'bg-green-50 text-green-700 border-green-200'
      default:
        return ''
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">จัดการผู้ใช้งาน</h1>
            <p className="text-muted-foreground">
              จัดการข้อมูลผู้ใช้งานและสิทธิ์การเข้าถึงระบบ
            </p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/users/add")}>
            <Plus className="w-4 h-4" />
            เพิ่มผู้ใช้งานใหม่
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">ผู้ใช้งานทั้งหมด</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <UserCheck className="w-8 h-8 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">ผู้ใช้งานที่ใช้งาน</p>
                  <p className="text-2xl font-bold">
                    {users.filter(user => user.is_active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <UserX className="w-8 h-8 text-destructive" />
                <div>
                  <p className="text-sm text-muted-foreground">ผู้ใช้งานที่ถูกปิด</p>
                  <p className="text-2xl font-bold">
                    {users.filter(user => !user.is_active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="w-8 h-8 text-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">ผู้ดูแลระบบ</p>
                  <p className="text-2xl font-bold">
                    {users.filter(user => user.role === 'admin').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="ค้นหาชื่อ, username, email, หรือแผนก..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {searchLoading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 animate-spin" />
                )}
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                ตัวกรอง
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>ผู้ใช้งานทั้งหมด ({filteredUsers.length} คน)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">กำลังโหลดข้อมูล...</span>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ชื่อ-นามสกุล</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>แผนก</TableHead>
                      <TableHead>บทบาท</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {searchTerm ? "ไม่พบผู้ใช้งานที่ค้นหา" : "ไม่มีข้อมูลผู้ใช้งาน"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.first_name} {user.last_name}</p>
                              <p className="text-xs text-muted-foreground">{user.phone || 'ไม่มีเบอร์โทร'}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {user.department_name ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {user.department_name}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={getRoleBadgeVariant(user.role)}
                              className={getRoleBadgeColor(user.role)}
                            >
                              {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 
                               user.role === 'manager' ? 'ผู้จัดการ' : 'ผู้ใช้งาน'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.is_active ? "default" : "secondary"}
                              className={user.is_active ? "bg-success/10 text-success border-success/20" : ""}
                            >
                              {user.is_active ? "ใช้งาน" : "ไม่ใช้งาน"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                                                             <DropdownMenuContent align="end">
                                 <DropdownMenuItem 
                                   className="cursor-pointer"
                                   onClick={() => navigate(`/users/detail/${user.id}`)}
                                 >
                                   <Eye className="mr-2 h-4 w-4" />
                                   ดูรายละเอียด
                                 </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer"
                                  onClick={() => navigate(`/users/edit/${user.id}`)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  แก้ไข
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer text-destructive"
                                  onClick={() => handleDelete(user.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  ลบ
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 