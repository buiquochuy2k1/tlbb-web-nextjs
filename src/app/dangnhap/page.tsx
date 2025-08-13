import Image from 'next/image';
import { LoginForm } from '@/components/form/login-form';
import { AuthGuard } from '@/components/auth/auth-guard';

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false} redirectTo="/">
      <main className="relative w-full min-h-screen overflow-hidden">
        {/* Background with multiple layers */}
        <div className="fixed inset-0">
          <Image
            src="/assets/images/bg_pc_2.png"
            alt="Thiên Long Bát Bộ Background"
            fill
            priority
            className="object-cover"
          />
          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/50"></div>
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-amber-900/5 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <LoginForm />
        </div>

        {/* Floating particles effect */}
        <div className="fixed inset-0 pointer-events-none z-5">
          <div className="absolute top-20 left-20 w-2 h-2 bg-amber-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-yellow-300/30 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 left-40 w-1.5 h-1.5 bg-amber-300/25 rounded-full animate-pulse delay-2000"></div>
          <div className="absolute bottom-60 right-20 w-1 h-1 bg-yellow-400/20 rounded-full animate-pulse delay-3000"></div>
        </div>

        {/* Copyright */}
        <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-20">
          <div className="text-white/60 text-xs sm:text-sm backdrop-blur-sm bg-black/20 px-3 py-1 rounded-full border border-white/10">
            © 2024 VNG Corporation
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
