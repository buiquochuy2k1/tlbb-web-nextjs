'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useState } from 'react';
import { secureFetch } from '@/lib/api-security';
import { registerSchema, type RegisterFormData, validateUsernameFormat } from '@/lib/validation/auth';
import { ZodError } from 'zod';
import { Eye, EyeOff, Lock, User, Mail, HelpCircle, Shield, UserPlus, Home, LogIn } from 'lucide-react';

// Danh sách câu hỏi bí mật
const secretQuestions = [
  { value: '0', label: 'Chọn câu hỏi bí mật' },
  { value: '1', label: 'Tên thú cưng đầu tiên của bạn là gì?' },
  { value: '2', label: 'Tên trường tiểu học của bạn là gì?' },
  { value: '3', label: 'Món ăn yêu thích của bạn là gì?' },
  { value: '4', label: 'Màu sắc yêu thích của bạn là gì?' },
  { value: '5', label: 'Tên của người bạn thân nhất là gì?' },
  { value: '6', label: 'Quê hương của bạn ở đâu?' },
];

export function RegisterForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [formData, setFormData] = useState<RegisterFormData>({
    ten: '',
    mk: '',
    rmk: '',
    email: '',
    cauhoi: '1', // Giá trị mặc định hợp lệ
    traloi: '',
    retraloi: '',
    ck: '',
    maxacnhan: '',
    pin: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [realTimeErrors, setRealTimeErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked ? 'ok' : '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Real-time validation for username
      if (name === 'ten') {
        const validation = validateUsernameFormat(value);
        setRealTimeErrors((prev) => ({
          ...prev,
          ten: validation.isValid ? undefined : validation.message,
        }));
      }
    }
  };

  const generateCaptcha = () => {
    // Simple math captcha
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    return { question: `${num1} + ${num2} = ?`, answer: (num1 + num2).toString() };
  };

  const [captcha] = useState(generateCaptcha);

  const validateForm = () => {
    try {
      setErrors({});
      setMessage(null);

      // Validate captcha first
      if (formData.maxacnhan !== captcha.answer) {
        setMessage({ type: 'error', text: 'Mã xác nhận không chính xác!' });
        return false;
      }

      // Validate with Zod schema
      registerSchema.parse(formData);
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        // Zod validation errors
        const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
        error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            fieldErrors[issue.path[0] as keyof RegisterFormData] = issue.message;
          }
        });
        setErrors(fieldErrors);

        // Show first error message
        const firstError = error.issues[0]?.message || 'Dữ liệu không hợp lệ';
        setMessage({ type: 'error', text: firstError });
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await secureFetch('/api/v1/auth/dangky', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.ten,
          password: formData.mk,
          confirmPassword: formData.rmk,
          question: secretQuestions.find((q) => q.value === formData.cauhoi)?.label || null,
          answer: formData.traloi,
          email: formData.email || null,
          phone: null, // You can add phone field if needed
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Đăng ký thành công! Vui lòng đăng nhập.' });
        // Reset form after successful registration
        setTimeout(() => {
          window.location.href = '/dangnhap';
        }, 2000);
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Có lỗi xảy ra khi đăng ký!',
        });
      }
    } catch (error) {
      console.error('Register error:', error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra, vui lòng thử lại!' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('w-full max-w-lg mx-auto p-4 sm:p-6', className)} {...props}>
      {/* Glassmorphism Container */}
      <div className="relative">
        {/* Background blur effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl"></div>

        {/* Content */}
        <div className="relative z-10 p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400/30 to-yellow-500/30 backdrop-blur-sm rounded-2xl border border-amber-300/30 mb-4">
              <UserPlus className="w-8 h-8 text-amber-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 drop-shadow-lg">
              Thiên Long Thiên Hà
            </h1>
            <p className="text-white/80 text-sm sm:text-base">Tạo tài khoản mới</p>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username and Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="ten" className="text-white/90 font-medium text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Tên đăng nhập *
                </Label>
                <Input
                  id="ten"
                  name="ten"
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={formData.ten}
                  onChange={handleInputChange}
                  required
                  className={`w-full bg-white/10 backdrop-blur-sm border text-white placeholder-white/50 rounded-xl px-4 py-3 focus:bg-white/15 focus:ring-2 transition-all duration-300 text-sm ${
                    errors.ten || realTimeErrors.ten
                      ? 'border-red-400/50 focus:border-red-400/50 focus:ring-red-400/20'
                      : 'border-white/20 focus:border-amber-300/50 focus:ring-amber-300/20'
                  }`}
                />
                {(errors.ten || realTimeErrors.ten) && (
                  <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {errors.ten || realTimeErrors.ten}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90 font-medium text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`w-full bg-white/10 backdrop-blur-sm border text-white placeholder-white/50 rounded-xl px-4 py-3 focus:bg-white/15 focus:ring-2 transition-all duration-300 text-sm ${
                    errors.email
                      ? 'border-red-400/50 focus:border-red-400/50 focus:ring-red-400/20'
                      : 'border-white/20 focus:border-amber-300/50 focus:ring-amber-300/20'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Password Fields Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="mk" className="text-white/90 font-medium text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Mật khẩu *
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
                    className={`w-full bg-white/10 backdrop-blur-sm border text-white placeholder-white/50 rounded-xl px-4 py-3 pr-12 focus:bg-white/15 focus:ring-2 transition-all duration-300 text-sm ${
                      errors.mk
                        ? 'border-red-400/50 focus:border-red-400/50 focus:ring-red-400/20'
                        : 'border-white/20 focus:border-amber-300/50 focus:ring-amber-300/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.mk && (
                  <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {errors.mk}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="rmk" className="text-white/90 font-medium text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Xác nhận mật khẩu *
                </Label>
                <div className="relative">
                  <Input
                    id="rmk"
                    name="rmk"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    value={formData.rmk}
                    onChange={handleInputChange}
                    required
                    className={`w-full bg-white/10 backdrop-blur-sm border text-white placeholder-white/50 rounded-xl px-4 py-3 pr-12 focus:bg-white/15 focus:ring-2 transition-all duration-300 text-sm ${
                      errors.rmk
                        ? 'border-red-400/50 focus:border-red-400/50 focus:ring-red-400/20'
                        : 'border-white/20 focus:border-amber-300/50 focus:ring-amber-300/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.rmk && (
                  <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {errors.rmk}
                  </p>
                )}
              </div>
            </div>

            {/* Secret Question */}
            <div className="space-y-2">
              <Label htmlFor="cauhoi" className="text-white/90 font-medium text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Câu hỏi bí mật *
              </Label>
              <select
                id="cauhoi"
                name="cauhoi"
                value={formData.cauhoi}
                onChange={handleInputChange}
                required
                className={`w-full bg-white/10 backdrop-blur-sm border text-white rounded-xl px-4 py-3 focus:bg-white/15 focus:ring-2 transition-all duration-300 text-sm ${
                  errors.cauhoi
                    ? 'border-red-400/50 focus:border-red-400/50 focus:ring-red-400/20'
                    : 'border-white/20 focus:border-amber-300/50 focus:ring-amber-300/20'
                }`}
              >
                {secretQuestions.map((question) => (
                  <option key={question.value} value={question.value} className="bg-gray-800 text-white">
                    {question.label}
                  </option>
                ))}
              </select>
              {errors.cauhoi && (
                <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {errors.cauhoi}
                </p>
              )}
            </div>

            {/* Secret Answer Fields Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Secret Answer */}
              <div className="space-y-2">
                <Label htmlFor="traloi" className="text-white/90 font-medium text-sm">
                  Trả lời bí mật *
                </Label>
                <Input
                  id="traloi"
                  name="traloi"
                  type="text"
                  placeholder="Nhập câu trả lời"
                  value={formData.traloi}
                  onChange={handleInputChange}
                  required
                  className={`w-full bg-white/10 backdrop-blur-sm border text-white placeholder-white/50 rounded-xl px-4 py-3 focus:bg-white/15 focus:ring-2 transition-all duration-300 text-sm ${
                    errors.traloi
                      ? 'border-red-400/50 focus:border-red-400/50 focus:ring-red-400/20'
                      : 'border-white/20 focus:border-amber-300/50 focus:ring-amber-300/20'
                  }`}
                />
                {errors.traloi && (
                  <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {errors.traloi}
                  </p>
                )}
              </div>

              {/* Confirm Secret Answer */}
              <div className="space-y-2">
                <Label htmlFor="retraloi" className="text-white/90 font-medium text-sm">
                  Xác nhận trả lời *
                </Label>
                <Input
                  id="retraloi"
                  name="retraloi"
                  type="text"
                  placeholder="Nhập lại trả lời"
                  value={formData.retraloi}
                  onChange={handleInputChange}
                  required
                  className={`w-full bg-white/10 backdrop-blur-sm border text-white placeholder-white/50 rounded-xl px-4 py-3 focus:bg-white/15 focus:ring-2 transition-all duration-300 text-sm ${
                    errors.retraloi
                      ? 'border-red-400/50 focus:border-red-400/50 focus:ring-red-400/20'
                      : 'border-white/20 focus:border-amber-300/50 focus:ring-amber-300/20'
                  }`}
                />
                {errors.retraloi && (
                  <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {errors.retraloi}
                  </p>
                )}
              </div>
            </div>

            {/* Captcha */}
            <div className="space-y-2">
              <Label
                htmlFor="maxacnhan"
                className="text-white/90 font-medium text-sm flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Mã xác nhận: <span className="text-amber-300 font-bold">{captcha.question}</span> *
              </Label>
              <Input
                id="maxacnhan"
                name="maxacnhan"
                type="text"
                placeholder="Nhập kết quả phép tính"
                value={formData.maxacnhan}
                onChange={handleInputChange}
                required
                className={`w-full bg-white/10 backdrop-blur-sm border text-white placeholder-white/50 rounded-xl px-4 py-3 focus:bg-white/15 focus:ring-2 transition-all duration-300 text-sm ${
                  errors.maxacnhan
                    ? 'border-red-400/50 focus:border-red-400/50 focus:ring-red-400/20'
                    : 'border-white/20 focus:border-amber-300/50 focus:ring-amber-300/20'
                }`}
              />
              {errors.maxacnhan && (
                <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {errors.maxacnhan}
                </p>
              )}
            </div>

            {/* Mã PIN */}
            <div className="space-y-2">
              <Label htmlFor="pin" className="text-white/90 font-medium text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Mã PIN *
              </Label>
              <Input
                id="pin"
                name="pin"
                type="text"
                placeholder="Nhập mã PIN"
                value={formData.pin}
                onChange={handleInputChange}
                required
                className={`w-full bg-white/10 backdrop-blur-sm border text-white placeholder-white/50 rounded-xl px-4 py-3 focus:bg-white/15 focus:ring-2 transition-all duration-300 text-sm ${
                  errors.pin
                    ? 'border-red-400/50 focus:border-red-400/50 focus:ring-red-400/20'
                    : 'border-white/20 focus:border-amber-300/50 focus:ring-amber-300/20'
                }`}
              />
              {errors.pin && (
                <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {errors.pin}
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start space-x-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <input
                type="checkbox"
                id="ck"
                name="ck"
                onChange={handleInputChange}
                required
                className="mt-1 w-4 h-4 text-amber-400 bg-white/10 border-white/30 rounded focus:ring-amber-300 focus:ring-2"
              />
              <div className="flex-1">
                <Label htmlFor="ck" className="text-sm text-white/80 leading-relaxed">
                  Tôi đồng ý với{' '}
                  <Link
                    href="#"
                    className="text-amber-300 hover:text-amber-200 underline transition-colors duration-300"
                  >
                    Điều khoản sử dụng
                  </Link>{' '}
                  và{' '}
                  <Link
                    href="#"
                    className="text-amber-300 hover:text-amber-200 underline transition-colors duration-300"
                  >
                    Chính sách bảo mật
                  </Link>{' '}
                  của Thiên Long Thiên Hà
                </Label>
                {errors.ck && (
                  <p className="text-red-300 text-xs mt-2 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {errors.ck}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500/80 to-yellow-600/80 hover:from-amber-500 hover:to-yellow-600 text-white font-bold py-3 px-6 rounded-xl border border-amber-300/30 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 backdrop-blur-sm text-sm"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang xử lý...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Đăng ký
                </div>
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm">
              <span className="text-white/70">Đã có tài khoản?</span>
              <Link
                href="/dangnhap"
                className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 font-medium transition-colors duration-300"
              >
                <LogIn className="w-4 h-4" />
                Đăng nhập ngay
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
