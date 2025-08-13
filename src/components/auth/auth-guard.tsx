'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true = require login, false = require NOT login
  redirectTo?: string; // where to redirect if condition not met
}

export function AuthGuard({ children, requireAuth = true, redirectTo = '/dangnhap' }: AuthGuardProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [shouldShowChildren, setShouldShowChildren] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/v1/auth/me', {
          credentials: 'include',
        });

        const authenticated = response.ok;

        // If we require auth but user is not authenticated
        if (requireAuth && !authenticated) {
          router.replace(redirectTo);
          return;
        }

        // If we require NO auth (login/register pages) but user IS authenticated
        if (!requireAuth && authenticated) {
          router.replace(redirectTo);
          return;
        }

        // If we reach here, auth check passed
        setShouldShowChildren(true);
      } catch (error) {
        console.error('Auth check error:', error);

        // If we require auth and there's an error, redirect to login
        if (requireAuth) {
          router.replace(redirectTo);
          return;
        }

        // If we don't require auth, show children anyway
        setShouldShowChildren(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [requireAuth, redirectTo, router]);

  // Don't show anything while checking (transparent)
  if (isChecking) {
    return (
      <main className="relative w-full min-h-screen overflow-hidden">
        <div className="fixed inset-0">
          <Image
            src="/assets/images/bd-bg-blue.png"
            alt="Thiên Long Bát Bộ Background"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60"></div>
        </div>

        {/* Loading */}
        <div className="relative z-20 min-h-screen flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
              <span className="text-white text-lg font-medium">Đang tải thông tin...</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Only show children if auth check passed
  if (shouldShowChildren) {
    return <>{children}</>;
  }

  // Don't render anything if redirecting
  return null;
}
