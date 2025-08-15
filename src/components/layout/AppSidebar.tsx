import {
  Monitor,
  Users,
  Building2,
  Package,
  Settings,
  BarChart3,
  FileText,
  Tags,
  LogOut,
  User,
  ChevronDown,
  ChevronRight,
  QrCode
} from "lucide-react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { usePermissions } from "@/hooks/usePermissions"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const location = useLocation()
  const { user, userProfile, signOut } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const permissions = usePermissions()
  const { state } = useSidebar()

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
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`
    }
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
    }
    return user?.email || 'ผู้ใช้งาน'
  }

  const getUserRole = () => {
    const role = userProfile?.role || user?.user_metadata?.role || 'user'
    const roleLabels = {
      'admin': 'ผู้ดูแลระบบ',
      'manager': 'ผู้จัดการ',
      'user': 'ผู้ใช้งาน'
    }
    return roleLabels[role as keyof typeof roleLabels] || 'ผู้ใช้งาน'
  }

  const isActive = (url: string) => {
    return location.pathname === url
  }

  const isParentActive = (items: Array<{ url: string }>) => {
    return items.some(item => location.pathname.startsWith(item.url))
  }

  const menuItems = [
    {
      label: "แดชบอร์ด",
      icon: BarChart3,
      url: "/dashboard",
      show: true // All users can see dashboard
    },
    {
      label: "ครุภัณฑ์",
      icon: Monitor,
      url: "/equipment",
      show: permissions.canViewEquipment,
      children: [
        { label: "รายการครุภัณฑ์", url: "/equipment/list" },
        { label: "เพิ่มครุภัณฑ์", url: "/equipment/add", show: permissions.canAddEquipment }
      ]
    },
    {
      label: "ผู้ใช้งาน",
      icon: Users,
      url: "/users",
      show: permissions.canViewUsers,
      children: [
        { label: "รายการผู้ใช้", url: "/users" },
        { label: "เพิ่มผู้ใช้", url: "/users/add", show: permissions.canAddUsers }
      ]
    },
    {
      label: "แผนก",
      icon: Building2,
      url: "/departments",
      show: permissions.canViewDepartments,
      children: [
        { label: "รายการแผนก", url: "/departments" },
        { label: "เพิ่มแผนก", url: "/departments/add", show: permissions.canAddDepartments }
      ]
    },
    {
      label: "ประเภทครุภัณฑ์",
      icon: Tags,
      url: "/categories",
      show: permissions.canViewCategories,
      children: [
        { label: "รายการประเภท", url: "/categories" },
        { label: "เพิ่มประเภท", url: "/categories/add", show: permissions.canAddCategories }
      ]
    },
    {
      label: "คุณสมบัติเฉพาะ",
      icon: Settings,
      url: "/properties",
      show: true, // Assuming all users can see this for now
      children: [
        { label: "CPU", url: "/properties/cpu" },
        { label: "Harddisk", url: "/properties/harddisk" },
        { label: "OS", url: "/properties/os" },
        { label: "Office", url: "/properties/office" }
      ]
    },
    {
      label: "ประวัติ",
      icon: FileText,
      url: "/history",
      show: permissions.canViewActivities
    },
    {
      label: "สแกน QR",
      icon: QrCode,
      url: "/qr-scanner",
      show: true // Assuming all users can see this for now
    }
  ]

  const renderMenuItem = (item: {
    label: string
    icon: React.ComponentType<{ className?: string }>
    url: string
    show: boolean
    children?: Array<{ label: string; url: string; show?: boolean }>
  }) => {
    const Icon = item.icon
    const isItemActive = isActive(item.url)
    const isParent = item.children && isParentActive(item.children)

    // If item has children, render as collapsible menu
    if (item.children && item.children.length > 0) {
      return (
        <Collapsible key={item.url} defaultOpen={isParent} className="group/collapsible">
          <SidebarMenuItem>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isItemActive || isParent}>
                      <Icon className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                      <ChevronDown className="h-4 w-4 ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180 group-data-[collapsible=icon]:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </TooltipTrigger>
                <TooltipContent side="right" className="group-data-[collapsible=expanded]:hidden">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
              <SidebarMenuSub>
                {item.children.filter(child => child.show !== false).map((child) => (
                  <SidebarMenuSubItem key={child.url}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={isActive(child.url)}
                    >
                      <NavLink to={child.url}>
                        <span>{child.label}</span>
                      </NavLink>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      )
    }

    // If item has no children, render as simple menu item
    return (
      <SidebarMenuItem key={item.url}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuButton asChild isActive={isItemActive}>
                <NavLink to={item.url}>
                  <Icon className="h-4 w-4" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </NavLink>
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right" className="group-data-[collapsible=expanded]:hidden">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SidebarMenuItem>
    )
  }

  return (
    <Sidebar className="h-screen" collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="text-lg font-semibold">AssetPro</h2>
            <p className="text-xs text-muted-foreground">ระบบจัดการครุภัณฑ์</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">เมนูหลัก</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.filter(item => item.show).map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium text-foreground truncate">
              {getUserDisplayName()}
            </p>
            <p className="text-xs text-muted-foreground">
              {getUserRole()}
            </p>
          </div>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:px-0"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2 group-data-[collapsible=icon]:mr-0" />
                <span className="group-data-[collapsible=icon]:hidden">ออกจากระบบ</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="group-data-[collapsible=expanded]:hidden">
              <p>ออกจากระบบ</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SidebarFooter>
    </Sidebar>
  )
}