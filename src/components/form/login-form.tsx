'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useState } from 'react';
import { Eye, EyeOff, Lock, User, LogIn, Home, UserPlus } from 'lucide-react';
import { secureFetch } from '@/lib/api-security';

interface LoginFormData {
  ten: string; // Tên đăng nhập
  mk: string; // Mật khẩu
}

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [formData, setFormData] = useState<LoginFormData>({
    ten: '',
    mk: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await secureFetch('/api/v1/auth/dangnhap', {
        method: 'POST',
        body: JSON.stringify({
          username: formData.ten,
          password: formData.mk,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Đăng nhập thành công!' });
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Tên đăng nhập hoặc mật khẩu không đúng!',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra, vui lòng thử lại!' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('w-full max-w-md mx-auto p-4 sm:p-6', className)} {...props}>
      {/* Glassmorphism Container */}
      <div className="relative">
        {/* Background blur effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl"></div>

        {/* Content */}
        <div className="relative z-10 p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400/30 to-yellow-500/30 backdrop-blur-sm rounded-2xl border border-amber-300/30 mb-4">
              <LogIn className="w-8 h-8 text-amber-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 drop-shadow-lg">
              Thiên Long Thiên Hà
            </h1>
            <p className="text-white/80 text-sm sm:text-base">Đăng nhập vào tài khoản của bạn</p>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-2xl text-center font-medium backdrop-blur-sm border transition-all duration-300 ${
                message.type === 'success'
                  ? 'bg-green-500/20 text-green-100 border-green-400/30 shadow-lg shadow-green-500/20'
                  : 'bg-red-500/20 text-red-100 border-red-400/30 shadow-lg shadow-red-500/20'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <Label
                htmlFor="ten"
                className="text-white/90 font-medium text-sm sm:text-base flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Tên đăng nhập
              </Label>
              <div className="relative">
                <Input
                  id="ten"
                  name="ten"
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={formData.ten}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 rounded-xl px-4 py-3 focus:bg-white/15 focus:border-amber-300/50 focus:ring-2 focus:ring-amber-300/20 transition-all duration-300 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="mk"
                className="text-white/90 font-medium text-sm sm:text-base flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="mk"
                  name="mk"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  value={formData.mk}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 rounded-xl px-4 py-3 pr-12 focus:bg-white/15 focus:border-amber-300/50 focus:ring-2 focus:ring-amber-300/20 transition-all duration-300 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                href="#"
                className="text-amber-300/80 hover:text-amber-300 text-sm transition-colors duration-300"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500/80 to-yellow-600/80 hover:from-amber-500 hover:to-yellow-600 text-white font-bold py-3 px-6 rounded-xl border border-amber-300/30 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 backdrop-blur-sm text-sm sm:text-base"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang xử lý...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Đăng nhập
                </div>
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm">
              <span className="text-white/70">Chưa có tài khoản?</span>
              <Link
                href="/dangky"
                className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 font-medium transition-colors duration-300"
              >
                <UserPlus className="w-4 h-4" />
                Đăng ký ngay
              </Link>
            </div>

            <div className="border-t border-white/20 pt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm transition-colors duration-300"
              >
                <Home className="w-4 h-4" />
                Quay lại trang chủ
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-yellow-500/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-yellow-500/10 rounded-full blur-xl"></div>
      </div>
    </div>
  );
}
