import { Bell, Search, User, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"

export function AppNavbar() {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut()
      toast({
        title: "ออกจากระบบสำเร็จ",
        description: "ขอบคุณที่ใช้งานระบบจัดการครุภัณฑ์",
      })
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถออกจากระบบได้",
        variant: "destructive"
      })
    }
  }

  const getUserDisplayName = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
    }
    return user?.email || 'ผู้ใช้งาน'
  }

  const getUserRole = () => {
    const role = user?.user_metadata?.role || 'user'
    const roleLabels = {
      'admin': 'ผู้ดูแลระบบ',
      'manager': 'ผู้จัดการ',
      'user': 'ผู้ใช้งาน'
    }
    return roleLabels[role as keyof typeof roleLabels] || 'ผู้ใช้งาน'
  }

  const getInitials = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name.charAt(0)}${user.user_metadata.last_name.charAt(0)}`
    }
    return user?.email?.charAt(0).toUpperCase() || 'U'
  }

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4 shadow-sm">
      {/* Left side - Sidebar trigger */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        
        {/* Search bar */}
        <div className="relative w-96 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="ค้นหาครุภัณฑ์, รหัส, หรือผู้ใช้งาน..." 
            className="pl-10 bg-muted/50 border-none focus:bg-background"
          />
        </div>
      </div>

      {/* Right side - Notifications and User menu */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
          >
            3
          </Badge>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-10 px-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium">{getUserDisplayName()}</p>
                <p className="text-xs text-muted-foreground">{getUserRole()}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>บัญชีผู้ใช้</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              โปรไฟล์
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              ตั้งค่า
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              ออกจากระบบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}