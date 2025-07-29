import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, Building2, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    username: '',
    role: 'user' as 'admin' | 'manager' | 'user'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const { signUp } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || 
        !formData.firstName || !formData.lastName || !formData.username) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน')
      return false
    }

    if (formData.password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const userData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        username: formData.username,
        role: formData.role
      }

      const { error } = await signUp(formData.email, formData.password, userData)
      
      if (error) {
        if (error.message.includes('User already registered')) {
          setError('อีเมลนี้มีอยู่ในระบบแล้ว')
        } else if (error.message.includes('Password should be at least')) {
          setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
        } else {
          setError('เกิดข้อผิดพลาดในการสมัครสมาชิก')
        }
      } else {
        setSuccess(true)
        toast({
          title: "สมัครสมาชิกสำเร็จ",
          description: "กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี",
        })
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการสมัครสมาชิก')
      console.error('Register error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">สมัครสมาชิกสำเร็จ!</h2>
                <p className="text-gray-600">
                  กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันบัญชีก่อนเข้าสู่ระบบ
                </p>
                <Button onClick={() => navigate('/login')} className="w-full">
                  ไปหน้าเข้าสู่ระบบ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            สมัครสมาชิก
          </h1>
          <p className="text-gray-600">
            สร้างบัญชีใหม่เพื่อเข้าสู่ระบบจัดการครุภัณฑ์
          </p>
        </div>

        {/* Register Card */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">สร้างบัญชีใหม่</CardTitle>
            <CardDescription className="text-center">
              กรอกข้อมูลเพื่อสร้างบัญชีใหม่
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

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">ชื่อ *</Label>
                  <Input
                    id="firstName"
                    placeholder="ชื่อ"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">นามสกุล *</Label>
                  <Input
                    id="lastName"
                    placeholder="นามสกุล"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username">ชื่อผู้ใช้ *</Label>
                <Input
                  id="username"
                  placeholder="ชื่อผู้ใช้"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Password Fields */}
              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="ยืนยันรหัสผ่าน"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
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
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังสมัครสมาชิก...
                  </>
                ) : (
                  'สมัครสมาชิก'
                )}
              </Button>

              {/* Links */}
              <div className="text-center">
                <div className="text-sm text-gray-600">
                  มีบัญชีอยู่แล้ว?{' '}
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    เข้าสู่ระบบ
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
  )
}