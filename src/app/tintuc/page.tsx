'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import {
  Newspaper,
  Calendar,
  Eye,
  Search,
  Tag,
  Clock,
  TrendingUp,
  Home,
  ChevronRight,
  Star,
  Users,
  Gamepad2,
  Trophy,
  Gift,
  Zap,
} from 'lucide-react';
import { ScrollToTop } from '@/components/ui/scroll-to-top';

// Import types from API
import type { Article, ArticleResponse } from '@/app/api/v1/tintuc/getArticles/route';
import type { Category } from '@/app/api/v1/tintuc/getCategories/route';
import { secureFetch } from '@/lib/api-security';

// Helper functions
const getIconByName = (iconName: string) => {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    Newspaper,
    Gift,
    Zap,
    Trophy,
    Gamepad2,
    Users,
  };
  return icons[iconName] || Newspaper;
};

export default function TinTucPage() {
  const [news, setNews] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedNews, setSelectedNews] = useState<Article | null>(null);

  // Function to update views
  const updateViews = async (articleId: number) => {
    try {
      const response = await secureFetch('/api/v1/tintuc/updateViews', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId }),
      });

      const data = await response.json();
      if (data.success) {
        // Update the views in local state
        setNews((prevNews) =>
          prevNews.map((item) => (item.ar_id === articleId ? { ...item, ar_views: data.data.views } : item))
        );

        // Update selected news if it's the same article
        setSelectedNews((prevSelected) =>
          prevSelected && prevSelected.ar_id === articleId
            ? { ...prevSelected, ar_views: data.data.views }
            : prevSelected
        );
      }
    } catch (error) {
      console.error('Error updating views:', error);
    }
  };

  // Function to handle news selection with view tracking
  const handleNewsSelect = (item: Article) => {
    setSelectedNews(item);
    updateViews(item.ar_id);
  };

  // Fetch news data
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await secureFetch('/api/v1/tintuc/getArticles?limit=50');
        const data: ArticleResponse = await response.json();

        if (data.success && data.data) {
          setNews(data.data);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await secureFetch('/api/v1/tintuc/getCategories');
        const data = await response.json();

        if (data.success && data.data) {
          // Add "All" category at the beginning
          const allCategories = [
            {
              cat_id: 0,
              cat_name: 'Tất Cả',
              cat_slug: 'all',
              cat_color: 'from-gray-500 to-slate-600',
              cat_icon: 'Newspaper',
              cat_order: 0,
              cat_status: 1,
            },
            ...data.data,
          ];
          setCategories(allCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Filter news based on search term and category
  const filteredNews = news.filter((item) => {
    const matchesSearch =
      item.ar_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ar_des.toLowerCase().includes(searchTerm.toLowerCase());

    // Find the selected category info to get cat_name for comparison
    const selectedCategoryInfo = categories.find((cat) => cat.cat_slug === selectedCategory);
    const matchesCategory =
      selectedCategory === 'all' || item.category_name === selectedCategoryInfo?.cat_name;

    return matchesSearch && matchesCategory;
  });

  const featuredNews = filteredNews.filter((item) => item.ar_featured);

  // Get time ago
  const getTimeAgo = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} tuần trước`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

      {/* Animated particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-amber-400/20 rounded-full animate-pulse"
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
          <div className="text-center mb-8">
            {/* Home Button */}
            <div className="flex justify-center mb-6">
              <Link href="/" className="group">
                <div className="glass rounded-xl px-6 py-3 flex items-center space-x-3 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <Home className="w-5 h-5 text-amber-400 group-hover:text-amber-300" />
                  <span className="text-white font-medium group-hover:text-amber-300">Quay về trang chủ</span>
                </div>
              </Link>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent mb-4">
              TIN TỨC GIANG HỒ
            </h1>
            <div className="flex items-center justify-center space-x-2 text-white/80">
              <Newspaper className="w-5 h-5" />
              <span className="text-lg">Cập nhật mới nhất từ thế giới Thiên Long Bát Bộ</span>
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="glass rounded-xl p-4 text-center">
              <Newspaper className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white mb-1">Tổng Tin Tức</h3>
              <p className="text-2xl font-bold text-amber-400">{news.length}</p>
            </div>

            <div className="glass rounded-xl p-4 text-center">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white mb-1">Tin Nổi Bật</h3>
              <p className="text-2xl font-bold text-yellow-400">{featuredNews.length}</p>
            </div>

            <div className="glass rounded-xl p-4 text-center">
              <Eye className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white mb-1">Lượt Xem</h3>
              <p className="text-2xl font-bold text-blue-400">
                {news.reduce((sum, item) => sum + (item.ar_views || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Search and Category Filter */}
          <div className="glass rounded-2xl p-6 mb-8">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm tin tức..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => {
                const IconComponent = getIconByName(category.cat_icon);
                const isSelected = selectedCategory === category.cat_slug;
                return (
                  <button
                    key={category.cat_id}
                    onClick={() => setSelectedCategory(category.cat_slug)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      isSelected
                        ? `bg-gradient-to-r ${category.cat_color} text-white scale-105 shadow-lg`
                        : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm font-medium">{category.cat_name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center space-x-3">
                <div className="w-8 h-8 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
                <span className="text-white text-lg">Đang tải tin tức...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Featured News Section */}
              {featuredNews.length > 0 && (
                <div className="mb-8">
                  <div className="glass rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/20">
                      <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                        <Star className="w-8 h-8 text-amber-400" />
                        <span>Tin Tức Nổi Bật</span>
                      </h2>
                      <p className="text-white/70 mt-2">Những tin tức quan trọng và hot nhất</p>
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {featuredNews.map((item) => (
                          <div
                            key={item.ar_id}
                            className="group cursor-pointer"
                            onClick={() => handleNewsSelect(item)}
                          >
                            <div className="glass rounded-xl overflow-hidden border border-white/20 hover:border-amber-400/50 transition-all duration-300 hover:scale-[1.02]">
                              {/* News Header */}
                              <div className="relative h-48 bg-gradient-to-br from-amber-900/30 to-yellow-900/30 overflow-hidden">
                                {/* Article Image */}
                                {item.ar_img ? (
                                  <Image
                                    src={item.ar_img}
                                    alt={item.ar_title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    unoptimized={item.ar_img.startsWith('http')}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <Newspaper className="w-16 h-16 text-white/30" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute top-4 left-4">
                                  <span
                                    className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${
                                      item.category_color || 'from-gray-500 to-slate-600'
                                    }`}
                                  >
                                    {item.category_name}
                                  </span>
                                </div>
                                <div className="absolute top-4 right-4">
                                  <span className="bg-amber-500/80 text-white px-2 py-1 rounded text-xs font-bold">
                                    Nổi Bật
                                  </span>
                                </div>
                              </div>

                              {/* News Content */}
                              <div className="p-6">
                                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-amber-300 transition-colors">
                                  {item.ar_title}
                                </h3>
                                <p className="text-white/70 text-sm mb-4 line-clamp-2">{item.ar_des}</p>

                                {/* Meta Info */}
                                <div className="flex items-center justify-between text-xs text-white/60">
                                  <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="w-4 h-4" />
                                      <span>{getTimeAgo(item.ar_time)}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Eye className="w-4 h-4" />
                                      <span>{(item.ar_views || 0).toLocaleString()}</span>
                                    </div>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Regular News Section */}
              <div className="glass rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/20">
                  <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                    <Newspaper className="w-8 h-8 text-blue-400" />
                    <span>Tất Cả Tin Tức</span>
                  </h2>
                  <p className="text-white/70 mt-2">
                    {selectedCategory === 'all'
                      ? `Hiển thị ${filteredNews.length} tin tức`
                      : `Danh mục: ${
                          categories.find((cat) => cat.cat_slug === selectedCategory)?.cat_name ||
                          selectedCategory
                        } (${filteredNews.length} tin)`}
                  </p>
                </div>

                <div className="p-6">
                  {filteredNews.length === 0 ? (
                    <div className="text-center py-12">
                      <Newspaper className="w-16 h-16 text-white/30 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy tin tức</h3>
                      <p className="text-white/60">
                        {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có tin tức trong danh mục này'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredNews.map((item) => {
                        const categoryInfo = categories.find((cat) => cat.cat_slug === item.category_name);
                        return (
                          <div
                            key={item.ar_id}
                            className="group cursor-pointer"
                            onClick={() => handleNewsSelect(item)}
                          >
                            <div className="glass rounded-xl overflow-hidden border border-white/20 hover:border-amber-400/30 transition-all duration-300 hover:scale-[1.02] h-full flex flex-col">
                              {/* News Header */}
                              <div className="relative h-40 bg-gradient-to-br from-gray-800/50 to-gray-900/50 flex-shrink-0 overflow-hidden">
                                {/* Article Image */}
                                {item.ar_img ? (
                                  <Image
                                    src={item.ar_img}
                                    alt={item.ar_title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    unoptimized={item.ar_img.startsWith('http')}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <Newspaper className="w-12 h-12 text-white/30" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute top-3 left-3">
                                  <span
                                    className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${
                                      categoryInfo?.cat_color ||
                                      item.category_color ||
                                      'from-gray-500 to-slate-600'
                                    }`}
                                  >
                                    {categoryInfo?.cat_icon &&
                                      React.createElement(getIconByName(categoryInfo.cat_icon), {
                                        className: 'w-3 h-3',
                                      })}
                                    <span>{item.category_name}</span>
                                  </span>
                                </div>
                                {item.ar_featured && (
                                  <div className="absolute top-3 right-3">
                                    <span className="bg-amber-500/80 text-white px-2 py-1 rounded text-xs font-bold">
                                      Hot
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* News Content */}
                              <div className="p-4 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-amber-300 transition-colors">
                                  {item.ar_title}
                                </h3>
                                <p className="text-white/70 text-sm mb-4 line-clamp-3 flex-1">
                                  {item.ar_des}
                                </p>

                                {/* Tags */}
                                {item.tags && item.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-4">
                                    {item.tags.slice(0, 2).map((tag, tagIndex) => (
                                      <span
                                        key={tagIndex}
                                        className="inline-flex items-center space-x-1 bg-white/10 text-white/70 px-2 py-1 rounded text-xs"
                                      >
                                        <Tag className="w-3 h-3" />
                                        <span>{tag}</span>
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Meta Info */}
                                <div className="flex items-center justify-between text-xs text-white/60 mt-auto">
                                  <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{getTimeAgo(item.ar_time)}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Eye className="w-3 h-3" />
                                      <span>{(item.ar_views || 0).toLocaleString()}</span>
                                    </div>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                                </div>

                                {/* Author */}
                                <div className="text-xs text-white/50 mt-2 pt-2 border-t border-white/10">
                                  Đăng bởi: {item.author_name || 'Admin'}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* News Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedNews(null)}
          ></div>
          <div className="relative glass rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/30">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <span
                      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${
                        selectedNews.category_color || 'from-gray-500 to-slate-600'
                      }`}
                    >
                      <span>{selectedNews.category_name}</span>
                    </span>
                    {selectedNews.ar_featured && (
                      <span className="bg-amber-500/80 text-white px-2 py-1 rounded text-sm font-bold">
                        Tin Nổi Bật
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">{selectedNews.ar_title}</h2>
                  <div className="flex items-center space-x-6 text-sm text-white/70">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(new Date(selectedNews.ar_time * 1000).toISOString())}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{(selectedNews.ar_views || 0).toLocaleString()} lượt xem</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNews(null)}
                  className="ml-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all duration-300"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Article Image */}
              {selectedNews.ar_img && (
                <div className="relative w-full h-64 mb-6 rounded-xl overflow-hidden">
                  <Image
                    src={selectedNews.ar_img}
                    alt={selectedNews.ar_title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                    unoptimized={selectedNews.ar_img.startsWith('http')}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <p className="text-lg text-white/90 leading-relaxed mb-6">{selectedNews.ar_des}</p>
              <div className="text-white/80 leading-relaxed whitespace-pre-line">
                {selectedNews.ar_content}
              </div>

              {/* Tags */}
              {selectedNews.tags && selectedNews.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/20">
                  <h4 className="text-white font-semibold mb-3">Thẻ:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedNews.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center space-x-1 bg-white/10 text-white/70 px-3 py-1 rounded-full text-sm"
                      >
                        <Tag className="w-3 h-3" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Info */}
              <div className="mt-4 text-sm text-white/60">
                <span>Tác giả: </span>
                <span className="text-amber-400 font-semibold">{selectedNews.author_name || 'Admin'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to top button */}
      <ScrollToTop useImage={true} />
    </main>
  );
}
