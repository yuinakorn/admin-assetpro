import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, Building2, User, Monitor, Shield, Users, CheckCircle, Database, BarChart3, Settings, Sparkles, Zap, Star } from 'lucide-react'
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
    <div className="min-h-screen w-full flex overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-10 left-10 text-4xl animate-bounce">🚀</div>
      <div className="absolute bottom-10 right-10 text-4xl animate-bounce animation-delay-1000">💫</div>
      <div className="absolute top-1/3 left-10 text-3xl animate-spin animation-delay-2000">⚡</div>
      <div className="absolute top-1/3 right-10 text-3xl animate-spin animation-delay-3000">🌟</div>

      {/* Main content container */}
      <div className="relative z-10 w-full flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-center">
          
          {/* Left Panel - Login Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center">
            <div className="w-full max-w-md">
              {/* Logo and Title with glassmorphism */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl mb-6 shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                  ระบบจัดการครุภัณฑ์
                </h1>
                <p className="text-lg text-gray-600 font-medium">
                  เข้าสู่ระบบเพื่อจัดการครุภัณฑ์คอมพิวเตอร์
                </p>
              </div>

              {/* Login Card with glassmorphism */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">เข้าสู่ระบบ</h2>
                  <p className="text-gray-600">
                    กรอกข้อมูลเพื่อเข้าสู่ระบบ
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Alert */}
                  {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50/80 backdrop-blur-sm">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Username Field */}
                  <div className="space-y-3">
                    <Label htmlFor="username" className="text-gray-700 font-medium">ชื่อผู้ใช้</Label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                      </div>
                      <Input
                        id="username"
                        type="text"
                        placeholder="ชื่อผู้ใช้"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10 h-12 bg-white/60 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-gray-700 font-medium">รหัสผ่าน</Label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="รหัสผ่าน"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-12 h-12 bg-white/60 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
                        required
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl rounded-xl"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        กำลังเข้าสู่ระบบ...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        เข้าสู่ระบบ
                      </>
                    )}
                  </Button>

                  {/* Links */}
                  <div className="text-center space-y-3 pt-4">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors duration-200"
                    >
                      ลืมรหัสผ่าน?
                    </Link>
                    <div className="text-sm text-gray-600">
                      ยังไม่มีบัญชี?{' '}
                      <Link
                        to="/register"
                        className="text-blue-600 hover:text-blue-800 hover:underline font-semibold transition-colors duration-200"
                      >
                        สมัครสมาชิก
                      </Link>
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="text-center mt-8 text-sm text-gray-500">
                <p>© 2025 ระบบจัดการครุภัณฑ์. สงวนลิขสิทธิ์.</p>
              </div>
            </div>
          </div>

          {/* Right Panel - Visual Content */}
          <div className="w-full lg:w-1/2 flex items-center justify-center">
            <div className="text-center max-w-lg">
              {/* Main Illustration with glassmorphism */}
              <div className="mb-8">
                <div className="relative mx-auto w-72 h-72 mb-8">
                  {/* Central Dashboard Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-40 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-2xl animate-pulse">
                      <BarChart3 className="w-20 h-20 text-blue-600" />
                    </div>
                  </div>
                  
                  {/* Floating Icons Around with animations */}
                  <div className="absolute top-6 left-6 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg animate-bounce">
                    <Monitor className="w-10 h-10 text-blue-600" />
                  </div>
                  <div className="absolute top-6 right-6 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg animate-bounce animation-delay-1000">
                    <Database className="w-10 h-10 text-purple-600" />
                  </div>
                  <div className="absolute bottom-6 left-6 w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg animate-bounce animation-delay-2000">
                    <Users className="w-10 h-10 text-green-600" />
                  </div>
                  <div className="absolute bottom-6 right-6 w-20 h-20 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg animate-bounce animation-delay-3000">
                    <Shield className="w-10 h-10 text-orange-600" />
                  </div>
                  
                  {/* Animated connection lines */}
                  <div className="absolute inset-0">
                    <svg className="w-full h-full" viewBox="0 0 288 288">
                      <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="rgba(59,130,246,0.4)" />
                          <stop offset="100%" stopColor="rgba(147,51,234,0.4)" />
                        </linearGradient>
                      </defs>
                      <path d="M72 72 L144 144 L216 72" stroke="url(#lineGradient)" strokeWidth="3" fill="none" opacity="0.6" className="animate-pulse" />
                      <path d="M72 216 L144 144 L216 216" stroke="url(#lineGradient)" strokeWidth="3" fill="none" opacity="0.6" className="animate-pulse animation-delay-1000" />
                      <path d="M72 72 L144 144 L72 216" stroke="url(#lineGradient)" strokeWidth="3" fill="none" opacity="0.6" className="animate-pulse animation-delay-2000" />
                      <path d="M216 72 L144 144 L216 216" stroke="url(#lineGradient)" strokeWidth="3" fill="none" opacity="0.6" className="animate-pulse animation-delay-3000" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Title with gradient */}
              <h2 className="text-5xl font-black mb-6">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  จัดการครุภัณฑ์
                </span>
                <br />
                <span className="text-gray-700">อย่างมีประสิทธิภาพ</span>
              </h2>

              {/* Description */}
              <p className="text-xl text-gray-600 leading-relaxed mb-10 font-medium">
                ระบบจัดการครุภัณฑ์คอมพิวเตอร์ที่ครบครัน
                <br />
                ใช้งานง่ายและปลอดภัย
              </p>

              {/* Visual Stats with glassmorphism */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/20 shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <Monitor className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-1">100+</div>
                  <div className="text-gray-600 text-sm font-medium">ครุภัณฑ์</div>
                </div>
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/20 shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-1">10+</div>
                  <div className="text-gray-600 text-sm font-medium">ผู้ใช้งาน</div>
                </div>
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/20 shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-1">100%</div>
                  <div className="text-gray-600 text-sm font-medium">ความแม่นยำ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}