import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน')
      return
    }
    
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
      return
    }

    setLoading(true)
    
    try {
      // Correctly pass all user data to the signUp function
      const { error: signUpError } = await signUp(email, password, {
        username,
        first_name: firstName,
        last_name: lastName,
        role: 'user', // Default role for new sign-ups
      })

      if (signUpError) {
        throw signUpError
      }

      setRegistrationSuccess(true)
      toast({
        title: "สมัครสมาชิกสำเร็จ",
        description: "กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันบัญชี",
      })
    } catch (err: any) {
      console.error(err)
      const errorMessage = err.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก'
      setError(errorMessage)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (registrationSuccess) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-muted">
        <Card className="w-full max-w-2xl mx-auto shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">การลงทะเบียนเกือบเสร็จสมบูรณ์!</CardTitle>
            <CardDescription>
              เราได้ส่งลิงก์ยืนยันไปยังอีเมลของคุณแล้ว <br />
              กรุณาคลิกลิงก์ดังกล่าวเพื่อเปิดใช้งานบัญชีของคุณ
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
             <p className="text-center text-muted-foreground">
              หลังจากยืนยันแล้ว คุณจะสามารถเข้าสู่ระบบได้
            </p>
            <Button onClick={() => navigate('/login')}>
              กลับไปที่หน้าเข้าสู่ระบบ
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-muted">
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">สร้างบัญชีใหม่</CardTitle>
          <CardDescription>กรอกข้อมูลด้านล่างเพื่อสร้างบัญชีของคุณ</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first-name">ชื่อจริง</Label>
                  <Input 
                    id="first-name" 
                    placeholder="สมชาย" 
                    required 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last-name">นามสกุล</Label>
                  <Input 
                    id="last-name" 
                    placeholder="ใจดี" 
                    required 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">ชื่อผู้ใช้ (Username)</Label>
                <Input
                  id="username"
                  placeholder="เช่น somchai"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="confirm-password">ยืนยันรหัสผ่าน</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                 {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                สร้างบัญชี
              </Button>
              <div className="mt-4 text-center text-sm">
                มีบัญชีอยู่แล้ว?{' '}
                <Link to="/login" className="underline">
                  เข้าสู่ระบบ
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
