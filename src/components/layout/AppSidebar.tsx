import { useState } from "react"
import { 
  LayoutDashboard, 
  Monitor, 
  Plus, 
  List, 
  FileText, 
  ArrowRightLeft, 
  History, 
  Users, 
  Settings,
  ChevronRight,
  Package,
  Building,
  Tags,
  LogOut,
  User
} from "lucide-react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "จัดการครุภัณฑ์",
    icon: Monitor,
    items: [
      {
        title: "เพิ่มครุภัณฑ์ใหม่",
        url: "/equipment/add",
        icon: Plus,
      },
      {
        title: "รายการครุภัณฑ์",
        url: "/equipment/list",
        icon: List,
      },
    ],
  },
  {
    title: "จัดการประเภทครุภัณฑ์",
    icon: Tags,
    items: [
      {
        title: "เพิ่มประเภทใหม่",
        url: "/categories/add",
        icon: Plus,
      },
      {
        title: "รายการประเภท",
        url: "/categories",
        icon: List,
      },
    ],
  },
  {
    title: "จัดการแผนก",
    icon: Building,
    items: [
      {
        title: "เพิ่มแผนกใหม่",
        url: "/departments/add",
        icon: Plus,
      },
      {
        title: "รายการแผนก",
        url: "/departments",
        icon: List,
      },
    ],
  },
  {
    title: "รายงาน",
    url: "/reports",
    icon: FileText,
  },
  {
    title: "การยืม-คืน",
    url: "/borrow-return",
    icon: ArrowRightLeft,
  },
  {
    title: "ประวัติการแก้ไข",
    url: "/history",
    icon: History,
  },
  {
    title: "จัดการผู้ใช้งาน",
    icon: Users,
    items: [
      {
        title: "เพิ่มผู้ใช้งานใหม่",
        url: "/users/add",
        icon: Plus,
      },
      {
        title: "รายการผู้ใช้งาน",
        url: "/users",
        icon: List,
      },
    ],
  },
  {
    title: "ตั้งค่าระบบ",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const isActive = (path: string) => currentPath === path
  const isParentActive = (items: Array<{ url: string }>) => items?.some(item => isActive(item.url))

  const getNavClass = (active: boolean) =>
    active 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-muted/50 text-foreground"

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

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-card border-r flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-semibold text-sm text-foreground">ระบบครุภัณฑ์</h2>
                <p className="text-xs text-muted-foreground">สำนักงานสาธารณสุขจังหวัด</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-4 py-2">
              เมนูหลัก
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {item.items ? (
                      <Collapsible defaultOpen={isParentActive(item.items)}>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="w-full justify-between hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                              <item.icon className="w-4 h-4" />
                              {!collapsed && <span>{item.title}</span>}
                            </div>
                            {!collapsed && <ChevronRight className="w-4 h-4" />}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        {!collapsed && (
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton asChild>
                                    <NavLink 
                                      to={subItem.url} 
                                      className={getNavClass(isActive(subItem.url))}
                                    >
                                      <subItem.icon className="w-4 h-4" />
                                      <span>{subItem.title}</span>
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        )}
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          className={getNavClass(isActive(item.url))}
                        >
                          <item.icon className="w-4 h-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* User Profile Section */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getUserRole()}
                </p>
              </div>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {!collapsed && "ออกจากระบบ"}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}