import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, Building2, User, Monitor, Shield, Users, CheckCircle, Database, BarChart3, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!username || !password) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน')
      setLoading(false)
      return
    }

    try {
      const { error } = await signIn(username, password)
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
        } else if (error.message.includes('Email not confirmed')) {
          setError('กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ')
        } else {
          setError(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
        }
      } else {
        toast({
          title: "เข้าสู่ระบบสำเร็จ",
          description: "ยินดีต้อนรับเข้าสู่ระบบจัดการครุภัณฑ์",
        })
        navigate('/dashboard')
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Left Panel - Login Form (50% on desktop, full on mobile) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white min-h-screen">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ระบบจัดการครุภัณฑ์
            </h1>
            <p className="text-gray-600">
              เข้าสู่ระบบเพื่อจัดการครุภัณฑ์คอมพิวเตอร์
            </p>
          </div>

          {/* Login Card */}
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl text-center">เข้าสู่ระบบ</CardTitle>
              <CardDescription className="text-center">
                กรอกข้อมูลเพื่อเข้าสู่ระบบ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Username Field */}
                <div className="space-y-2">
                  <Label htmlFor="username">ชื่อผู้ใช้</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="ชื่อผู้ใช้"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 h-11"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">รหัสผ่าน</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="รหัสผ่าน"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11"
                      required
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังเข้าสู่ระบบ...
                    </>
                  ) : (
                    'เข้าสู่ระบบ'
                  )}
                </Button>

                {/* Links */}
                <div className="text-center space-y-2 pt-2">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    ลืมรหัสผ่าน?
                  </Link>
                  <div className="text-sm text-gray-600">
                    ยังไม่มีบัญชี?{' '}
                    <Link
                      to="/register"
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      สมัครสมาชิก
                    </Link>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>© 2024 ระบบจัดการครุภัณฑ์. สงวนลิขสิทธิ์.</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Visual Content (50% on desktop, hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center p-12 min-h-screen">
        <div className="text-center text-white max-w-lg">
          {/* Main Illustration */}
          <div className="mb-8">
            <div className="relative mx-auto w-64 h-64 mb-6">
              {/* Central Dashboard Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <BarChart3 className="w-16 h-16 text-white" />
                </div>
              </div>
              
              {/* Floating Icons Around */}
              <div className="absolute top-4 left-4 w-16 h-16 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <div className="absolute top-4 right-4 w-16 h-16 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Database className="w-8 h-8 text-white" />
              </div>
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="absolute bottom-4 right-4 w-16 h-16 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-8 h-8 text-white" />
              </div>
              
              {/* Connection Lines (CSS-based) */}
              <div className="absolute inset-0">
                <svg className="w-full h-full" viewBox="0 0 256 256">
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
                    </linearGradient>
                  </defs>
                  <path d="M64 64 L128 128 L192 64" stroke="url(#lineGradient)" strokeWidth="2" fill="none" opacity="0.6" />
                  <path d="M64 192 L128 128 L192 192" stroke="url(#lineGradient)" strokeWidth="2" fill="none" opacity="0.6" />
                  <path d="M64 64 L128 128 L64 192" stroke="url(#lineGradient)" strokeWidth="2" fill="none" opacity="0.6" />
                  <path d="M192 64 L128 128 L192 192" stroke="url(#lineGradient)" strokeWidth="2" fill="none" opacity="0.6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-4xl font-bold mb-4">
            จัดการครุภัณฑ์
            <br />
            <span className="text-blue-200">อย่างมีประสิทธิภาพ</span>
          </h2>

          {/* Brief Description */}
          <p className="text-xl text-blue-100 leading-relaxed mb-8">
            ระบบจัดการครุภัณฑ์คอมพิวเตอร์ที่ครบครัน
            <br />
            ใช้งานง่ายและปลอดภัย
          </p>

          {/* Visual Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold mb-1">100+</div>
              <div className="text-blue-100 text-sm">ครุภัณฑ์</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold mb-1">40+</div>
              <div className="text-blue-100 text-sm">ผู้ใช้งาน</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold mb-1">100%</div>
              <div className="text-blue-100 text-sm">ความแม่นยำ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}