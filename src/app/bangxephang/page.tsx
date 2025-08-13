'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Trophy, Crown, Medal, Sword, Star, Search, Filter, Users, TrendingUp, Home } from 'lucide-react';
import { CharacterName } from '@/lib/character-name';
import { AuthGuard } from '@/components/auth/auth-guard';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { secureFetch } from '@/lib/api-security';
import Link from 'next/link';

interface RankingPlayer {
  charname: string;
  level: number;
  accname?: string;
  menpai?: string;
  exp?: number;
}

export default function BangXepHangPage() {
  const [rankings, setRankings] = useState<RankingPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedFilter, setSelectedFilter] = useState('all');

  // Fetch rankings data
  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await secureFetch('/api/v1/bangxephang');
        if (response.ok) {
          const data = await response.json();
          console.log('Rankings API: Data received:', data);
          setRankings(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching rankings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  // Filter rankings based on search term
  const filteredRankings = rankings.filter((player) =>
    player.charname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get rank icon based on position
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Trophy className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    if (rank <= 10) return <Star className="w-5 h-5 text-purple-400" />;
    return <Sword className="w-4 h-4 text-blue-400" />;
  };

  // Get rank background color
  const getRankBg = (rank: number) => {
    if (rank === 1) return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
    if (rank === 2) return 'from-gray-400/20 to-slate-400/20 border-gray-400/30';
    if (rank === 3) return 'from-amber-600/20 to-orange-500/20 border-amber-500/30';
    if (rank <= 10) return 'from-purple-500/20 to-indigo-500/20 border-purple-400/30';
    return 'from-blue-500/10 to-cyan-500/10 border-blue-400/20';
  };

  return (
    <AuthGuard requireAuth={false}>
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

        {/* Animated particles */}
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-amber-400/30 rounded-full animate-pulse`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${3 + Math.random() * 4}s`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen">
          {/* Header */}
          <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8 animate__animated animate__fadeInDown">
              {/* Home Button */}
              <div className="flex justify-center mb-6">
                <Link href="/" className="group">
                  <div className="glass rounded-xl px-6 py-3 flex items-center space-x-3 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    <Home className="w-5 h-5 text-amber-400 group-hover:text-amber-300" />
                    <span className="text-white font-medium group-hover:text-amber-300">
                      Quay về trang chủ
                    </span>
                  </div>
                </Link>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent mb-4">
                BẢNG XẾP HẠNG
              </h1>
              <div className="flex items-center justify-center space-x-2 text-white/80">
                <Users className="w-5 h-5" />
                <span className="text-lg">Top Cao Thủ Thiên Long Bát Bộ</span>
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate__animated animate__fadeInUp animate__delay-1s">
              <div className="glass rounded-xl p-6 text-center">
                <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Tổng Cao Thủ</h3>
                <p className="text-3xl font-bold text-amber-400">{rankings.length}</p>
              </div>

              <div className="glass rounded-xl p-6 text-center">
                <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Cấp Độ Cao Nhất</h3>
                <p className="text-3xl font-bold text-green-400">
                  {rankings.length > 0 ? Math.max(...rankings.map((p) => p.level)) : 0}
                </p>
              </div>

              <div className="glass rounded-xl p-6 text-center">
                <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Đang Hiển Thị</h3>
                <p className="text-3xl font-bold text-blue-400">{filteredRankings.length}</p>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="glass rounded-2xl p-6 mb-8 animate__animated animate__fadeInUp animate__delay-2s">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm cao thủ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-white/80">
                    <Filter className="w-5 h-5" />
                    <span>Lọc:</span>
                  </div>
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  >
                    <option value="all" className="bg-gray-800">
                      Tất cả
                    </option>
                    <option value="top10" className="bg-gray-800">
                      Top 10
                    </option>
                    <option value="top50" className="bg-gray-800">
                      Top 50
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Rankings Table */}
            <div className="glass rounded-2xl overflow-hidden animate__animated animate__fadeInUp animate__delay-3s">
              <div className="p-6 border-b border-white/20">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                  <Trophy className="w-8 h-8 text-amber-400" />
                  <span>Bảng Xếp Hạng Cao Thủ</span>
                </h2>
                <p className="text-white/70 mt-2">Danh sách các cao thủ mạnh nhất trong Thiên Long Bát Bộ</p>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center space-x-3">
                    <div className="w-8 h-8 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
                    <span className="text-white text-lg">Đang tải bảng xếp hạng...</span>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20 bg-white/5">
                        <th className="px-6 py-4 text-left text-white font-semibold">Hạng</th>
                        <th className="px-6 py-4 text-left text-white font-semibold">Tên Nhân Vật</th>
                        <th className="px-6 py-4 text-center text-white font-semibold">Cấp Độ</th>
                        <th className="px-6 py-4 text-center text-white font-semibold">Thành Tích</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRankings.map((player, index) => {
                        const rank = index + 1;
                        return (
                          <tr
                            key={`${player.charname}-${index}`}
                            className={`border-b border-white/10 hover:bg-white/5 transition-all duration-300 bg-gradient-to-r ${getRankBg(
                              rank
                            )} border-l-4`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                {getRankIcon(rank)}
                                <span
                                  className={`font-bold text-xl ${
                                    rank <= 3
                                      ? 'text-amber-400'
                                      : rank <= 10
                                      ? 'text-purple-400'
                                      : 'text-blue-400'
                                  }`}
                                >
                                  #{rank}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-400/20 to-yellow-500/20 rounded-full flex items-center justify-center border border-amber-400/30">
                                  <Sword className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                  <CharacterName
                                    charname={player.charname}
                                    className="font-semibold text-lg"
                                  />
                                  {player.accname && (
                                    <p className="text-white/60 text-sm">@{player.accname}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="inline-flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-1">
                                <Star className="w-4 h-4 text-amber-400" />
                                <span className="font-bold text-amber-400 text-lg">{player.level}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                {rank <= 3 && (
                                  <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 px-3 py-1 rounded-full text-sm font-semibold border border-amber-400/30">
                                    Huyền Thoại
                                  </div>
                                )}
                                {rank > 3 && rank <= 10 && (
                                  <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-semibold border border-purple-400/30">
                                    Cao Thủ
                                  </div>
                                )}
                                {rank > 10 && (
                                  <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold border border-blue-400/30">
                                    Tinh Anh
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {filteredRankings.length === 0 && !loading && (
                    <div className="p-12 text-center">
                      <div className="text-white/60 text-lg">
                        {searchTerm ? 'Không tìm thấy cao thủ nào phù hợp' : 'Chưa có dữ liệu xếp hạng'}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll to top button */}
        <ScrollToTop useImage={true} />
      </main>
    </AuthGuard>
  );
}
