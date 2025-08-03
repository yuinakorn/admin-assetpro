import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Monitor, Users, Shield, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Index() {
  const { user, userProfile, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user && userProfile) {
      navigate('/dashboard')
    }
  }, [user, userProfile, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (user && userProfile) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ระบบจัดการครุภัณฑ์</h1>
                <p className="text-sm text-gray-600">Asset Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                เข้าสู่ระบบ
              </Button>
              <Button onClick={() => navigate('/register')}>
                สมัครสมาชิก
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            จัดการครุภัณฑ์
            <span className="text-blue-600"> อย่างมีประสิทธิภาพ</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            ระบบจัดการครุภัณฑ์คอมพิวเตอร์ที่ครบครัน ใช้งานง่าย 
            ช่วยให้คุณติดตาม บำรุงรักษา และจัดการครุภัณฑ์ได้อย่างมีประสิทธิภาพ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/login')}>
              เริ่มต้นใช้งาน
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" size="lg">
              เรียนรู้เพิ่มเติม
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              คุณสมบัติหลัก
            </h3>
            <p className="text-lg text-gray-600">
              ระบบที่ออกแบบมาเพื่อตอบโจทย์การจัดการครุภัณฑ์ในองค์กร
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Monitor className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>จัดการครุภัณฑ์</CardTitle>
                <CardDescription>
                  ลงทะเบียน ติดตาม และจัดการครุภัณฑ์คอมพิวเตอร์ทุกประเภท
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>จัดการผู้ใช้งาน</CardTitle>
                <CardDescription>
                  จัดการสิทธิ์และบทบาทของผู้ใช้งานในระบบ
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>ความปลอดภัย</CardTitle>
                <CardDescription>
                  ระบบความปลอดภัยที่แข็งแกร่ง พร้อมการยืนยันตัวตน
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            พร้อมเริ่มต้นใช้งานแล้วหรือยัง?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            เข้าร่วมกับเราเพื่อจัดการครุภัณฑ์อย่างมีประสิทธิภาพ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/register')}>
              สมัครสมาชิกฟรี
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
              เข้าสู่ระบบ
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">ระบบจัดการครุภัณฑ์</span>
            </div>
            <p className="text-gray-400">
              © 2024 ระบบจัดการครุภัณฑ์. สงวนลิขสิทธิ์.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
