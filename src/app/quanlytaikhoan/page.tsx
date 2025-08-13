'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Calendar,
  Globe,
  Coins,
  Shield,
  Gamepad2,
  ArrowLeft,
  Crown,
  Sword,
  Star,
  CircleDollarSign,
  TrendingUp,
} from 'lucide-react';
import { CharacterName } from '@/lib/character-name';
import { AuthGuard } from '@/components/auth/auth-guard';
import { ChangePasswordModal } from '@/components/modals/change-password-modal';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { secureFetch } from '@/lib/api-security';

interface UserCharacter {
  charname: string;
  level: number;
  yuanbao: number;
  uipoint: number;
  exp: number;
}

interface UserProfile {
  id: number;
  name: string;
  email?: string;
  is_online: boolean;
  date_registered?: Date;
  last_ip_login?: string;
  characters: UserCharacter[];
}

// Helper function to format money
const formatExp = (exp: number): string => {
  if (exp >= 1000000000) {
    return (exp / 1000000000).toFixed(1) + 'B';
  } else if (exp >= 1000000) {
    return (exp / 1000000).toFixed(1) + 'M';
  } else if (exp >= 1000) {
    return (exp / 1000).toFixed(1) + 'K';
  }
  return exp.toString();
};

export default function QuanLyTaiKhoanPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<UserCharacter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await secureFetch('/api/v1/account/profile', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setProfile(data.data);
            // Auto select first character if available
            if (data.data.characters && data.data.characters.length > 0) {
              setSelectedCharacter(data.data.characters[0]);
            }
          } else {
            setError('Không thể tải thông tin tài khoản');
          }
        } else if (response.status === 401) {
          window.location.href = '/dangnhap';
        } else {
          setError('Có lỗi xảy ra khi tải dữ liệu');
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        setError('Không thể kết nối đến server');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <main className="relative w-full min-h-screen overflow-hidden">
        {/* Background */}
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

  if (error) {
    return (
      <main className="relative w-full min-h-screen overflow-hidden">
        {/* Background */}
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

        {/* Error */}
        <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
          <div className="bg-red-500/10 backdrop-blur-xl rounded-3xl border border-red-400/30 shadow-2xl p-8 text-center max-w-md">
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-white text-xl font-bold mb-2">Có lỗi xảy ra</h2>
            <p className="text-red-200 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay về trang chủ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <AuthGuard requireAuth={true} redirectTo="/dangnhap">
      <main className="relative w-full min-h-screen overflow-hidden">
        {/* Enhanced Background */}
        <div className="fixed inset-0">
          <Image
            src="/assets/images/bd-bg-blue.png"
            alt="Thiên Long Bát Bộ Background"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/60"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 via-transparent to-amber-900/10"></div>
        </div>

        {/* Floating particles */}
        <div className="fixed inset-0 pointer-events-none z-5">
          <div className="absolute top-20 left-20 w-2 h-2 bg-amber-400/30 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-yellow-300/40 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 left-40 w-1.5 h-1.5 bg-amber-300/35 rounded-full animate-pulse delay-2000"></div>
          <div className="absolute bottom-60 right-20 w-1 h-1 bg-yellow-400/30 rounded-full animate-pulse delay-3000"></div>
        </div>

        {/* Content */}
        <div className="relative z-20 min-h-screen p-4 sm:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link
                    href="/"
                    className="w-12 h-12 bg-gradient-to-br from-amber-500/80 to-yellow-600/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 border border-amber-300/30"
                  >
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </Link>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                      <span className="bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                        QUẢN LÝ TÀI KHOẢN
                      </span>
                    </h1>
                    <p className="text-white/80">Thông tin chi tiết về tài khoản của bạn</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/napthe"
                    className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <CircleDollarSign className="w-4 h-4" />
                    <span>Nạp Bạc</span>
                  </Link>
                  <button
                    onClick={() => setShowChangePasswordModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Đổi Mật Khẩu</span>
                  </button>
                  <div className="hidden sm:flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        profile?.is_online ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                      }`}
                    ></div>
                    <span className="text-white/80 text-sm">
                      {profile?.is_online ? 'Đang online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Account Info */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-blue-900/30 via-blue-800/20 to-blue-900/30 backdrop-blur-xl rounded-3xl border-2 border-blue-400/30 shadow-2xl p-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600/80 to-cyan-600/80 p-4 rounded-2xl border border-blue-400/50 mb-6">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-blue-900" />
                    </div>
                    <h2 className="text-xl font-bold text-white drop-shadow-lg">THÔNG TIN TÀI KHOẢN</h2>
                  </div>
                </div>

                {/* Account Details */}
                <div className="space-y-4">
                  <div className="bg-blue-800/40 backdrop-blur-sm rounded-2xl border border-blue-400/30 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-5 h-5 text-blue-300" />
                      <span className="text-blue-200 text-sm font-medium">Tên tài khoản</span>
                    </div>
                    <p className="text-white font-bold text-lg">{profile?.name}</p>
                  </div>

                  {profile?.email && (
                    <div className="bg-blue-800/40 backdrop-blur-sm rounded-2xl border border-blue-400/30 p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Mail className="w-5 h-5 text-blue-300" />
                        <span className="text-blue-200 text-sm font-medium">Email</span>
                      </div>
                      <p className="text-white font-medium">{profile.email}</p>
                    </div>
                  )}

                  <div className="bg-blue-800/40 backdrop-blur-sm rounded-2xl border border-blue-400/30 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Coins className="w-5 h-5 text-yellow-400" />
                      <span className="text-blue-200 text-sm font-medium">Kim Nguyên Bảo</span>
                    </div>
                    {selectedCharacter ? (
                      <div>
                        <p className="text-yellow-400 font-bold text-lg">
                          {selectedCharacter.yuanbao?.toLocaleString()} KNB
                        </p>
                      </div>
                    ) : (
                      <p className="text-yellow-400/60 font-medium">Chọn nhân vật để xem KNB</p>
                    )}
                  </div>

                  <div className="bg-blue-800/40 backdrop-blur-sm rounded-2xl border border-blue-400/30 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <CircleDollarSign className="w-5 h-5 text-yellow-400" />
                      <span className="text-blue-200 text-sm font-medium">Bạc</span>
                    </div>
                    {selectedCharacter ? (
                      <div>
                        <p className="text-yellow-400 font-bold text-lg">
                          {selectedCharacter.uipoint?.toLocaleString()} Bạc
                        </p>
                      </div>
                    ) : (
                      <p className="text-yellow-400/60 font-medium">Chọn nhân vật để xem Bạc</p>
                    )}
                  </div>

                  {profile?.date_registered && (
                    <div className="bg-blue-800/40 backdrop-blur-sm rounded-2xl border border-blue-400/30 p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-blue-300" />
                        <span className="text-blue-200 text-sm font-medium">Ngày đăng ký</span>
                      </div>
                      <p className="text-white font-medium">
                        {new Date(profile.date_registered).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  )}

                  {profile?.last_ip_login && (
                    <div className="bg-blue-800/40 backdrop-blur-sm rounded-2xl border border-blue-400/30 p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Globe className="w-5 h-5 text-blue-300" />
                        <span className="text-blue-200 text-sm font-medium">IP đăng nhập cuối</span>
                      </div>
                      <p className="text-white font-mono text-sm">{profile.last_ip_login}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Characters List */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-purple-900/30 via-purple-800/20 to-purple-900/30 backdrop-blur-xl rounded-3xl border-2 border-purple-400/30 shadow-2xl p-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600/80 to-pink-600/80 p-4 rounded-2xl border border-purple-400/50 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                        <Gamepad2 className="w-6 h-6 text-orange-900" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white drop-shadow-lg">NHÂN VẬT</h2>
                        <p className="text-purple-200 text-sm">{profile?.characters?.length || 0} nhân vật</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-yellow-400" />
                    </div>
                  </div>
                </div>

                {/* Characters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile?.characters?.length ? (
                    profile.characters.map((character, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedCharacter(character)}
                        className={`bg-gradient-to-r backdrop-blur-sm rounded-2xl border p-4 transition-all duration-300 group cursor-pointer ${
                          selectedCharacter?.charname === character.charname
                            ? 'from-purple-600/60 to-pink-600/50 border-purple-300/50 shadow-lg shadow-purple-500/20'
                            : 'from-purple-800/40 to-pink-800/30 border-purple-400/30 hover:from-purple-700/50 hover:to-pink-700/40'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                selectedCharacter?.charname === character.charname
                                  ? 'bg-yellow-400 animate-pulse'
                                  : 'bg-purple-400'
                              }`}
                            ></div>
                            <div>
                              <h3 className="text-white font-bold group-hover:text-purple-200 transition-colors">
                                <CharacterName charname={character.charname} />
                              </h3>
                              <p className="text-purple-200 text-sm flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {formatExp(character.exp)} EXP
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-bold flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400" />
                              Lv.{character.level}
                            </div>
                            {selectedCharacter?.charname === character.charname && (
                              <div className="text-yellow-400 text-xs flex items-center gap-1 mt-1">
                                <Crown className="w-3 h-3" />
                                Đã chọn
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8">
                      <Sword className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
                      <p className="text-purple-200/80 text-lg">Chưa có nhân vật nào</p>
                      <p className="text-purple-200/60 text-sm mt-1">
                        Hãy tạo nhân vật trong game để hiển thị ở đây
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={() => {
          console.log('Password changed successfully');
        }}
      />

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </AuthGuard>
  );
}
