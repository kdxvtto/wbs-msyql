import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button, Input, Label } from '@/components/atoms'
import { Card, CardContent } from '@/components/molecules'
import { Eye, EyeOff, ArrowLeft, ShieldX } from 'lucide-react'

export default function AdminRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registrationClosed, setRegistrationClosed] = useState(false)
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter')
      setLoading(false)
      return
    }

    try {
      const { confirmPassword, ...registerData } = formData
      await register({ ...registerData, role: 'Admin' }, 'admin')
      navigate('/hanomanbpr/login', { state: { message: 'Registrasi berhasil! Silakan login.' } })
    } catch (err) {
      // Jika backend return 403, artinya admin sudah ada
      if (err.response?.status === 403) {
        setRegistrationClosed(true)
      } else {
        setError(err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Admin sudah ada - tampilkan pesan tertutup
  if (registrationClosed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-rose-50 p-4">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-100/50 rounded-full blur-3xl" />
        
        <div className="relative w-full max-w-md">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>

          <Card className="shadow-2xl border-0">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                  <ShieldX className="w-8 h-8 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Registrasi Ditutup</h1>
                <p className="text-muted-foreground text-sm">
                  Registrasi admin sudah ditutup karena admin sudah terdaftar.
                </p>
                <Link
                  to="/hanomanbpr/login"
                  className="inline-block mt-6 text-primary font-medium hover:underline text-sm"
                >
                  Masuk sebagai Admin →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-rose-50 p-4 py-12">
      {/* Decorative */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-red-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-100/50 rounded-full blur-3xl" />
      
      <div className="relative w-full max-w-md">
        {/* Back to home */}
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Beranda
        </Link>

        <Card className="shadow-2xl border-0">
          <CardContent className="p-8">
            {/* Logo */}
            <div className="text-center mb-6">
              <Link to="/">
                <img src="/logo.png" alt="Logo" className="h-14 mx-auto mb-3" />
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Daftar Admin</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Buat akun administrator
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Masukkan username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="h-11 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Ulangi password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>

              <Button type="submit" className="w-full h-11 text-base mt-2" disabled={loading}>
                {loading ? 'Memproses...' : 'Daftar'}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Sudah punya akun?{' '}
                <Link to="/hanomanbpr/login" className="text-primary font-medium hover:underline">
                  Masuk
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
