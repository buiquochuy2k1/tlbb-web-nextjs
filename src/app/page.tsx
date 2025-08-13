'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Home,
  Newspaper,
  Trophy,
  Sparkles,
  Download,
  CreditCard,
  UserPlus,
  User,
  LogIn,
  LogOut,
  Facebook,
  Star,
  Users,
  Gamepad2,
  Shield,
  Menu,
  X,
  Server,
  Crown,
  Calendar,
  Clock,
  Award,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { CharacterName } from '@/lib/character-name';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { secureFetch } from '@/lib/api-security';

interface RankingPlayer {
  rank: number;
  charname: string;
  level: number;
}

interface Server {
  id: number;
  name: string;
  status: string;
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [user, setUser] = useState<{ id: number; name: string } | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [rankings, setRankings] = useState<RankingPlayer[]>([]);
  const [isLoadingRankings, setIsLoadingRankings] = useState(true);
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoadingServers, setIsLoadingServers] = useState(true);

  // Check authentication status from server
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/v1/auth/me', {
          method: 'GET',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser({ id: data.user.id, name: data.user.name });
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    checkAuth();
  }, []);

  // Fetch rankings data
  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await secureFetch('/api/v1/bangxephang');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setRankings(data.data.slice(0, 5)); // Show top 5 in homepage
          }
        }
      } catch (error) {
        console.error('Error fetching rankings:', error);
      } finally {
        setIsLoadingRankings(false);
      }
    };

    fetchRankings();
  }, []);

  // Fetch servers data
  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await secureFetch('/api/v1/servers');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setServers(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching servers:', error);
      } finally {
        setIsLoadingServers(false);
      }
    };

    fetchServers();
  }, []);

  // Logout function
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Clear user state - cookies are cleared by server
        setUser(null);
      } else {
        console.error('Logout failed:', data.error);
        // Even if logout fails, clear local state
        setUser(null);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even on error
      setUser(null);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <main className="relative w-full min-h-screen overflow-hidden">
      {/* Enhanced Background with multiple layers */}
      <div className="fixed inset-0">
        <Image
          src="/assets/images/bd-bg-blue.png"
          alt="Thiên Long Bát Bộ Background"
          fill
          priority
          className="object-cover"
        />
        {/* Enhanced gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 via-transparent to-amber-900/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent"></div>
      </div>

      {/* Floating particles effect */}
      <div className="fixed inset-0 pointer-events-none z-5">
        <div className="absolute top-20 left-20 w-2 h-2 bg-amber-400/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-yellow-300/40 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-40 w-1.5 h-1.5 bg-amber-300/35 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-60 right-20 w-1 h-1 bg-yellow-400/30 rounded-full animate-pulse delay-3000"></div>
        <div className="absolute top-60 left-60 w-1 h-1 bg-amber-200/25 rounded-full animate-pulse delay-4000"></div>
        <div className="absolute bottom-20 right-60 w-1.5 h-1.5 bg-yellow-500/30 rounded-full animate-pulse delay-5000"></div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-white hover:bg-white/20 transition-all duration-300 animate__animated animate__fadeInLeft animate__delay-1s"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="absolute top-0 left-0 w-80 h-full bg-gradient-to-br from-white/20 via-white/10 to-white/5 backdrop-blur-xl border-r border-white/20 animate__animated animate__slideInLeft">
            <div className="p-6 pt-20">
              {/* Mobile Logo */}
              <div className="text-center mb-8 animate__animated animate__fadeInDown animate__delay-1s">
                <Image
                  src="/assets/images/logo-mb.png"
                  alt="TLBB Logo"
                  width={80}
                  height={48}
                  className="mx-auto drop-shadow-lg animate__animated animate__bounceIn animate__delay-2s"
                />
                <h2 className="text-white font-bold text-lg mt-2 animate__animated animate__fadeInUp animate__delay-2s">
                  Thiên Long Thiên Hà
                </h2>
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-4 animate__animated animate__fadeInLeft animate__delay-3s">
                <Link
                  href="/"
                  className="flex items-center gap-3 text-white/90 hover:text-amber-300 transition-colors p-3 rounded-xl hover:bg-white/10 animate__animated animate__slideInLeft animate__delay-1s"
                >
                  <Home className="w-5 h-5" />
                  <span>Trang Chủ</span>
                </Link>
                <Link
                  href="/tintuc"
                  className="flex items-center gap-3 text-white/90 hover:text-amber-300 transition-colors p-3 rounded-xl hover:bg-white/10 animate__animated animate__slideInLeft animate__delay-2s"
                >
                  <Newspaper className="w-5 h-5" />
                  <span>Tin Tức</span>
                </Link>
                <Link
                  href="/bangxephang"
                  className="flex items-center gap-3 text-white/90 hover:text-amber-300 transition-colors p-3 rounded-xl hover:bg-white/10 animate__animated animate__slideInLeft animate__delay-3s"
                >
                  <Trophy className="w-5 h-5" />
                  <span>Bảng Xếp Hạng</span>
                </Link>
                <Link
                  href="/tinhnang"
                  className="flex items-center gap-3 text-white/90 hover:text-amber-300 transition-colors p-3 rounded-xl hover:bg-white/10 animate__animated animate__slideInLeft animate__delay-4s"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Tính Năng</span>
                </Link>
              </nav>

              {/* Mobile Action Buttons */}
              <div className="mt-8 space-y-3 animate__animated animate__fadeInUp animate__delay-4s">
                <Link
                  href="/download"
                  className="flex items-center gap-3 bg-gradient-to-r from-amber-500/80 to-yellow-600/80 text-white font-bold py-3 px-4 rounded-xl hover:from-amber-500 hover:to-yellow-600 transition-all duration-300 animate__animated animate__bounceInUp animate__delay-5s"
                >
                  <Download className="w-5 h-5" />
                  <span>Tải Game</span>
                </Link>
                <Link
                  href="/napthe"
                  className="flex items-center gap-3 bg-gradient-to-r from-green-500/80 to-emerald-600/80 text-white font-bold py-3 px-4 rounded-xl hover:from-green-500 hover:to-emerald-600 transition-all duration-300 animate__animated animate__bounceInUp animate__delay-6s"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Nạp Thẻ</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 w-64 h-full z-30 animate__animated animate__slideInLeft animate__delay-1s">
        {/* Character Background */}
        <div className="absolute inset-0">
          <Image src="/assets/images/bg_pc_doc.jpg" alt="TLBB Character" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
        </div>

        {/* Sidebar Content */}
        <div className="relative z-10 flex flex-col items-center w-full p-6">
          {/* Logo Section */}
          <div className="text-center mb-8 animate__animated animate__fadeInDown animate__delay-2s">
            <Image
              src="/assets/images/logo-mb.png"
              alt="TLBB Logo"
              width={120}
              height={72}
              className="drop-shadow-lg mb-4 animate__animated animate__bounceIn animate__delay-3s"
            />
            <Image
              src="/assets/images/emchua18.jpg"
              alt="18+ Rating"
              width={100}
              height={60}
              className="drop-shadow-lg animate__animated animate__fadeInUp animate__delay-4s"
            />
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col space-y-6 mb-8">
            <Link href="/" className="group animate__animated animate__rotateIn animate__delay-1s">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500/80 to-amber-600/80 backdrop-blur-sm border-2 border-amber-300/50 transform rotate-45 flex items-center justify-center hover:from-amber-400 hover:to-amber-500 hover:scale-110 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-amber-500/30">
                <div className="transform -rotate-45 text-center">
                  <Home className="w-5 h-5 text-white mb-1 mx-auto" />
                  <span className="text-white text-xs font-bold">Trang Chủ</span>
                </div>
              </div>
            </Link>

            <Link href="/tintuc" className="group animate__animated animate__rotateIn animate__delay-2s">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/80 to-blue-600/80 backdrop-blur-sm border-2 border-blue-300/50 transform rotate-45 flex items-center justify-center hover:from-blue-400 hover:to-blue-500 hover:scale-110 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-blue-500/30">
                <div className="transform -rotate-45 text-center">
                  <Newspaper className="w-5 h-5 text-white mb-1 mx-auto" />
                  <span className="text-white text-xs font-bold">Tin Tức</span>
                </div>
              </div>
            </Link>

            <Link href="/bangxephang" className="group animate__animated animate__rotateIn animate__delay-3s">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/80 to-purple-600/80 backdrop-blur-sm border-2 border-purple-300/50 transform rotate-45 flex items-center justify-center hover:from-purple-400 hover:to-purple-500 hover:scale-110 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-purple-500/30">
                <div className="transform -rotate-45 text-center">
                  <Trophy className="w-5 h-5 text-white mb-1 mx-auto" />
                  <span className="text-white text-xs font-bold">BXH</span>
                </div>
              </div>
            </Link>

            <Link href="/tinhnang" className="group animate__animated animate__rotateIn animate__delay-4s">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/80 to-emerald-600/80 backdrop-blur-sm border-2 border-emerald-300/50 transform rotate-45 flex items-center justify-center hover:from-emerald-400 hover:to-emerald-500 hover:scale-110 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-emerald-500/30">
                <div className="transform -rotate-45 text-center">
                  <Sparkles className="w-5 h-5 text-white mb-1 mx-auto" />
                  <span className="text-white text-xs font-bold">Tính Năng</span>
                </div>
              </div>
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-4 mb-8 animate__animated animate__fadeInUp animate__delay-5s">
            <Link href="/napthe">
              <div className="w-44 h-14 bg-gradient-to-r from-green-500/80 to-emerald-600/80 backdrop-blur-sm border border-green-300/30 rounded-xl flex items-center justify-center hover:from-green-500 hover:to-emerald-600 hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-green-500/30 animate__animated animate__bounceInLeft animate__delay-6s">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-white" />
                  <span className="text-white font-bold">Nạp Thẻ</span>
                </div>
              </div>
            </Link>

            {/* Logout Button - Only show if user is logged in - In Sidebar below Nap The */}
            {user && (
              <div className="flex flex-col space-y-4">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-44 h-14 bg-gradient-to-r from-red-500/80 to-red-600/80 backdrop-blur-sm border border-red-300/30 rounded-xl flex items-center justify-center hover:from-red-500 hover:to-red-600 hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-red-500/30 animate__animated animate__bounceInLeft animate__delay-7s"
                >
                  <div className="flex items-center space-x-2">
                    {isLoggingOut ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <LogOut className="w-5 h-5 text-white" />
                    )}
                    <span className="text-white font-bold">
                      {isLoggingOut ? 'Đang xuất...' : 'Đăng Xuất'}
                    </span>
                  </div>
                </button>

                <Link
                  href="/quanlytaikhoan"
                  className="w-44 h-14 bg-gradient-to-r from-yellow-500/80 to-amber-600/80 backdrop-blur-sm border border-yellow-300/30 rounded-xl flex items-center justify-center hover:from-yellow-500 hover:to-amber-600 hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-yellow-500/30 animate__animated animate__bounceInLeft animate__delay-7s"
                >
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-white" />
                    <span className="text-white font-bold">Quản lý tài khoản</span>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Social Button */}
          <div className="mt-auto animate__animated animate__bounceIn animate__delay-8s">
            <a
              href="https://www.facebook.com/bui.huy.547727/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-gradient-to-br from-blue-600/80 to-blue-700/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer border border-blue-400/30"
            >
              <Facebook className="w-6 h-6 text-white" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-20 lg:ml-64 min-h-screen flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="text-center max-w-4xl">
            {/* Main Title */}
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-2xl animate__animated animate__fadeInDown animate__delay-1s">
                <span className="bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                  THIÊN LONG
                </span>
              </h1>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-2xl animate__animated animate__fadeInUp animate__delay-2s">
                <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                  THIÊN HÀ
                </span>
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 drop-shadow-lg animate__animated animate__fadeIn animate__delay-3s">
                Hành trình võ lâm huyền thoại đang chờ đón bạn
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 animate__animated animate__fadeInUp animate__delay-4s">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 animate__animated animate__zoomIn animate__delay-1s">
                <Users className="w-8 h-8 text-amber-300 mx-auto mb-3" />
                <h3 className="text-white font-bold mb-2">Cộng Đồng</h3>
                <p className="text-white/80 text-sm">Hàng triệu người chơi</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 animate__animated animate__zoomIn animate__delay-2s">
                <Gamepad2 className="w-8 h-8 text-blue-300 mx-auto mb-3" />
                <h3 className="text-white font-bold mb-2">Gameplay</h3>
                <p className="text-white/80 text-sm">Đấu trường PvP hấp dẫn</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 animate__animated animate__zoomIn animate__delay-3s">
                <Shield className="w-8 h-8 text-green-300 mx-auto mb-3" />
                <h3 className="text-white font-bold mb-2">Bảo Mật</h3>
                <p className="text-white/80 text-sm">An toàn tuyệt đối</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 animate__animated animate__zoomIn animate__delay-4s">
                <Star className="w-8 h-8 text-purple-300 mx-auto mb-3" />
                <h3 className="text-white font-bold mb-2">Đánh Giá</h3>
                <p className="text-white/80 text-sm">4.8/5 sao từ game thủ</p>
              </div>
            </div>

            {/* CTA Buttons for Mobile/Tablet */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:hidden animate__animated animate__bounceInUp animate__delay-5s">
              {user ? (
                /* User is logged in - show welcome message */
                <div className="bg-gradient-to-r from-green-500/80 to-emerald-600/80 text-white font-bold py-4 px-8 rounded-xl backdrop-blur-sm border border-green-300/30 shadow-lg flex items-center justify-center gap-2">
                  <User className="w-5 h-5" />
                  Chào mừng, {user.name}!
                </div>
              ) : (
                /* User not logged in - show register/login buttons */
                <>
                  <Link
                    href="/dangky"
                    className="bg-gradient-to-r from-amber-500/80 to-yellow-600/80 hover:from-amber-500 hover:to-yellow-600 text-white font-bold py-4 px-8 rounded-xl backdrop-blur-sm border border-amber-300/30 shadow-lg hover:shadow-amber-500/30 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 animate__animated animate__pulse animate__infinite"
                  >
                    <UserPlus className="w-5 h-5" />
                    Đăng Ký Ngay
                  </Link>

                  <Link
                    href="/dangnhap"
                    className="bg-gradient-to-r from-blue-500/80 to-blue-600/80 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-xl backdrop-blur-sm border border-blue-300/30 shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-5 h-5" />
                    Đăng Nhập
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Bottom Action Bar */}
        <section className="p-4 sm:p-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6 animate__animated animate__fadeInUp animate__delay-6s">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {/* Nap The Button */}
              <Link
                href="/napthe"
                className="flex-shrink-0 animate__animated animate__bounceInLeft animate__delay-1s"
              >
                <div className="relative group">
                  <Image
                    src="/assets/images/nap-the.png"
                    alt="Nạp Thẻ"
                    width={180}
                    height={180}
                    className="drop-shadow-lg hover:scale-110 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                </div>
              </Link>

              {/* Center Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dangky" className="group animate__animated animate__zoomIn animate__delay-2s">
                  <div className="relative overflow-hidden rounded-xl">
                    <Image
                      src="/assets/images/dang-ky.png"
                      alt="Đăng Ký"
                      width={200}
                      height={80}
                      className="drop-shadow-lg group-hover:scale-110 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </Link>

                <a
                  href="/dangnhap"
                  rel="noopener noreferrer"
                  className="group animate__animated animate__zoomIn animate__delay-3s"
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <Image
                      src="/assets/images/dang-nhap.png"
                      alt="Đăng Nhập"
                      width={200}
                      height={80}
                      className="drop-shadow-lg group-hover:scale-110 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </a>

                <a
                  href="https://www.facebook.com/bui.huy.547727/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group animate__animated animate__zoomIn animate__delay-4s"
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <Image
                      src="/assets/images/tai-xuong.png"
                      alt="Tải Xuống"
                      width={200}
                      height={80}
                      className="drop-shadow-lg group-hover:scale-110 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </a>
              </div>

              {/* Nhap Code Button */}
              <Link
                href="/nhapcode"
                className="flex-shrink-0 animate__animated animate__bounceInRight animate__delay-5s"
              >
                <div className="relative group">
                  <Image
                    src="/assets/images/nhap-code.png"
                    alt="Nhập Code"
                    width={180}
                    height={180}
                    className="drop-shadow-lg hover:scale-110 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Information Blocks Section */}
        <section className="p-4 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 min-h-0">
            {/* Server List Block */}
            <div className="bg-gradient-to-br from-amber-900/30 via-amber-800/20 to-amber-900/30 backdrop-blur-xl rounded-3xl border-2 border-amber-400/30 shadow-2xl animate__animated animate__fadeInLeft animate__delay-1s">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-600/80 to-yellow-600/80 p-6 border-b-2 border-amber-400/50">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                    <Server className="w-6 h-6 text-amber-900" />
                  </div>
                  <h3 className="text-2xl font-bold text-white drop-shadow-lg">DANH SÁCH MÁY CHỦ</h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 flex flex-col max-h-[600px]">
                <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                  {isLoadingServers ? (
                    // Loading skeleton
                    Array.from({ length: 2 }).map((_, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-amber-800/40 to-yellow-800/30 backdrop-blur-sm rounded-2xl border border-amber-400/30 p-4 animate-pulse"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-amber-500/50 rounded-full"></div>
                            <div className="h-5 bg-amber-500/50 rounded w-24"></div>
                          </div>
                          <div className="h-6 bg-amber-500/50 rounded w-20"></div>
                        </div>
                      </div>
                    ))
                  ) : servers.length > 0 ? (
                    servers.map((server, index) => (
                      <div
                        key={server.id || index}
                        className="bg-gradient-to-r from-amber-800/40 to-yellow-800/30 backdrop-blur-sm rounded-2xl border border-amber-400/30 p-4 hover:from-amber-700/50 hover:to-yellow-700/40 transition-all duration-300 group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-full ${
                                server.status === 'online'
                                  ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50'
                                  : 'bg-red-400 animate-pulse shadow-lg shadow-red-400/50'
                              }`}
                            ></div>
                            <h4 className="text-white font-bold text-lg group-hover:text-amber-200 transition-colors">
                              {server.name}
                            </h4>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              server.status === 'online'
                                ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                                : 'bg-red-500/20 text-red-300 border border-red-400/30'
                            }`}
                          >
                            {server.status === 'online' ? 'HOẠT ĐỘNG' : 'BẢO TRÌ'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    // No data available
                    <div className="text-center py-8">
                      <div className="text-amber-200/60 mb-2">
                        <Server className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      </div>
                      <p className="text-amber-200/80">Không có server nào</p>
                      <p className="text-amber-200/60 text-sm mt-1">Vui lòng thử lại sau</p>
                    </div>
                  )}
                </div>

                {/* <div className="text-center pt-4 flex-shrink-0">
                  <Link
                    href="/servers"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-900 font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-amber-500/30 hover:scale-105 transition-all duration-300"
                  >
                    <Eye className="w-4 h-4" />
                    Xem Tất Cả
                  </Link>
                </div> */}
              </div>
            </div>

            {/* Rankings Block */}
            <div className="bg-gradient-to-br from-purple-900/30 via-purple-800/20 to-purple-900/30 backdrop-blur-xl rounded-3xl border-2 border-purple-400/30 shadow-2xl animate__animated animate__fadeInUp animate__delay-2s">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600/80 to-pink-600/80 p-6 border-b-2 border-purple-400/50">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <Trophy className="w-6 h-6 text-orange-900" />
                  </div>
                  <h3 className="text-2xl font-bold text-white drop-shadow-lg">BẢNG XẾP HẠNG</h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col max-h-[600px]">
                <div className="mb-4">
                  <select className="w-full bg-gradient-to-r from-purple-800/50 to-purple-700/50 text-white border border-purple-400/30 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400">
                    <option>Thiên Hà Server</option>
                  </select>
                </div>

                <div className="space-y-3 flex-1 ">
                  {isLoadingRankings ? (
                    // Loading skeleton
                    Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-purple-800/40 to-pink-800/30 backdrop-blur-sm rounded-2xl border border-purple-400/30 p-4 animate-pulse"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-500/50 rounded-full"></div>
                            <div>
                              <div className="h-4 bg-purple-500/50 rounded w-24 mb-2"></div>
                              <div className="h-3 bg-purple-400/50 rounded w-16"></div>
                            </div>
                          </div>
                          <div className="h-4 bg-purple-500/50 rounded w-12"></div>
                        </div>
                      </div>
                    ))
                  ) : rankings.length > 0 ? (
                    rankings.map((player) => (
                      <div
                        key={player.rank}
                        className="bg-gradient-to-r from-purple-800/40 to-pink-800/30 backdrop-blur-sm rounded-2xl border border-purple-400/30 p-4 hover:from-purple-700/50 hover:to-pink-700/40 transition-all duration-300 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${
                                player.rank === 1
                                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900'
                                  : player.rank === 2
                                  ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800'
                                  : player.rank === 3
                                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-amber-100'
                                  : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                              }`}
                            >
                              {player.rank === 1 ? <Crown className="w-4 h-4" /> : player.rank}
                            </div>
                            <div>
                              <h4 className="text-white font-bold group-hover:text-purple-200 transition-colors">
                                <CharacterName
                                  charname={player.charname}
                                  className="group-hover:opacity-90 transition-opacity"
                                />
                              </h4>
                              <p className="text-purple-200 text-sm">Cao thủ võ lâm</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-white font-bold">Lv.{player.level}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    // No data available
                    <div className="text-center py-8">
                      <div className="text-purple-200/60 mb-2">
                        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      </div>
                      <p className="text-purple-200/80">Không có dữ liệu bảng xếp hạng</p>
                      <p className="text-purple-200/60 text-sm mt-1">Vui lòng thử lại sau</p>
                    </div>
                  )}
                </div>

                <div className="text-center pt-4 flex-shrink-0">
                  <Link
                    href="/bangxephang"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-purple-500/30 hover:scale-105 transition-all duration-300"
                  >
                    <Award className="w-4 h-4" />
                    Xem Bảng Xếp Hạng
                  </Link>
                </div>
              </div>
            </div>

            {/* News Block */}
            <div className="bg-gradient-to-br from-blue-900/30 via-blue-800/20 to-blue-900/30 backdrop-blur-xl rounded-3xl border-2 border-blue-400/30 shadow-2xl animate__animated animate__fadeInRight animate__delay-3s">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600/80 to-cyan-600/80 p-6 border-b-2 border-blue-400/50">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <Newspaper className="w-6 h-6 text-blue-900" />
                  </div>
                  <h3 className="text-2xl font-bold text-white drop-shadow-lg">TIN TỨC MỚI NHẤT</h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col max-h-[600px]">
                <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                  {[
                    {
                      title: 'Cập Nhật Phiên Bản 2.1.6 - Tân Thiên Long',
                      summary:
                        'Phiên bản mới với nhiều tính năng hấp dẫn: Boss thế giới mới, kỹ năng Tân Thiên Long, và hệ thống bang hội nâng cao...',
                      date: '2024-01-15',
                      category: 'Cập Nhật',
                      hot: true,
                    },
                    {
                      title: 'Sự Kiện Tết Nguyên Đán 2024',
                      summary:
                        'Tham gia sự kiện Tết để nhận những phần thưởng độc quyền: Pet rồng vàng, trang phục Tết, và nhiều quà tặng khác...',
                      date: '2024-01-12',
                      category: 'Sự Kiện',
                      hot: true,
                    },
                    {
                      title: 'Giải Đấu Võ Lâm Đại Hội Q1/2024',
                      summary:
                        'Đăng ký tham gia giải đấu lớn nhất năm với tổng giải thưởng lên đến 500 triệu VND...',
                      date: '2024-01-10',
                      category: 'Giải Đấu',
                      hot: false,
                    },
                    {
                      title: 'Bảo Trì Server Định Kỳ',
                      summary:
                        'Thông báo bảo trì server vào thứ 3 hàng tuần từ 6:00 - 8:00 để cải thiện hiệu suất...',
                      date: '2024-01-08',
                      category: 'Thông Báo',
                      hot: false,
                    },
                  ].map((news, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-blue-800/40 to-cyan-800/30 backdrop-blur-sm rounded-2xl border border-blue-400/30 p-4 hover:from-blue-700/50 hover:to-cyan-700/40 transition-all duration-300 group cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div
                            className={`w-3 h-3 rounded-full mt-2 ${
                              news.hot
                                ? 'bg-red-400 animate-pulse shadow-lg shadow-red-400/50'
                                : 'bg-blue-400'
                            }`}
                          ></div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${
                                news.category === 'Cập Nhật'
                                  ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                                  : news.category === 'Sự Kiện'
                                  ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                                  : news.category === 'Giải Đấu'
                                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                              }`}
                            >
                              {news.category}
                            </span>
                            {news.hot && (
                              <span className="px-2 py-1 bg-red-500/20 text-red-300 border border-red-400/30 rounded-full text-xs font-bold animate-pulse">
                                HOT
                              </span>
                            )}
                          </div>

                          <h4 className="text-white font-bold text-lg mb-2 group-hover:text-blue-200 transition-colors line-clamp-2">
                            {news.title}
                          </h4>

                          <p className="text-blue-200/80 text-sm mb-3 line-clamp-2">{news.summary}</p>

                          <div className="flex items-center gap-2 text-xs text-blue-300">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(news.date).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center pt-4 flex-shrink-0">
                  <Link
                    href="/tintuc"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300"
                  >
                    <Calendar className="w-4 h-4" />
                    Xem Tất Cả Tin Tức
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Copyright */}
        <footer className="p-4 text-center animate__animated animate__fadeIn animate__delay-7s">
          <div className="text-white/60 text-sm backdrop-blur-sm bg-black/20 inline-block px-4 py-2 rounded-full border border-white/10">
            © 2024 VNG Corporation. All rights reserved.
          </div>
        </footer>
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </main>
  );
}
