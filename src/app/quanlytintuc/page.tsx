'use client';

import { useState, useEffect, useCallback } from 'react';
import { CreateArticleModal } from '@/components/modals/create-article-modal';
import { EditArticleModal } from '@/components/modals/edit-article-modal';
import {
  Plus,
  FileText,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Tag,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Key,
  Lock,
  Shield,
} from 'lucide-react';
import { secureFetch } from '@/lib/api-security';
import { toast } from 'sonner';
import { AuthGuard } from '@/components/auth/auth-guard';

interface Article {
  ar_id: number;
  ar_title: string;
  ar_img: string;
  ar_des: string;
  ar_content: string;
  ar_slug: string;
  ar_type: number;
  ar_time: number;
  ar_views: number;
  ar_featured: boolean;
  ar_status: number;
  ar_meta_keywords?: string;
  ar_meta_description?: string;
  ar_order: number;
  category_name?: string;
  category_color?: string;
  author_name?: string;
  tags?: string[];
  publishDate?: string;
}

interface Category {
  cat_id: number;
  cat_name: string;
  cat_slug: string;
  cat_color: string;
  cat_icon: string;
}

export default function ArticleManagementPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // Access control states
  const [hasAccess, setHasAccess] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [verifyingAccess, setVerifyingAccess] = useState(false);
  const [accessError, setAccessError] = useState('');

  // Verify access key
  const verifyAccessKey = async (key: string) => {
    setVerifyingAccess(true);
    setAccessError('');

    try {
      const response = await fetch('/api/v1/tintuc/verify-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: key }),
      });

      const data = await response.json();

      if (data.success) {
        setHasAccess(true);
        toast.success('Truy cập thành công!');
      } else {
        setAccessError('Bạn không có quyền truy cập trang này');
        toast.error('Mã truy cập không đúng');
      }
    } catch (error) {
      console.error('Access verification error:', error);
      setAccessError('Có lỗi xảy ra khi xác thực');
      toast.error('Có lỗi xảy ra');
    } finally {
      setVerifyingAccess(false);
    }
  };

  // Handle access form submit
  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessKey.trim()) {
      verifyAccessKey(accessKey.trim());
    }
  };

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedStatus && { status: selectedStatus }),
      });

      const response = await secureFetch(`/api/v1/tintuc/getArticles?${params}`);
      const data = await response.json();

      if (data.success) {
        setArticles(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedCategory, selectedStatus]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await secureFetch('/api/v1/tintuc/getCategories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleCreateSuccess = (article: { ar_id: number; message: string }) => {
    // console.log('New article created:', article);
    loadArticles(); // Refresh the list
    toast.success(`Tạo bài viết thành công! ID: ${article.ar_id}`);
  };

  const handleEditSuccess = (article: { ar_id: number; message: string }) => {
    // console.log('Article updated:', article);
    loadArticles(); // Refresh the list
    setEditingArticle(null);
    toast.success(`Cập nhật bài viết thành công! ID: ${article.ar_id}`);
  };

  const handleEditClick = (article: Article) => {
    setEditingArticle(article);
    setShowEditModal(true);
  };

  const handleDeleteClick = async (articleId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;

    try {
      const response = await secureFetch('/api/v1/tintuc/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ar_id: articleId }),
      });

      const data = await response.json();
      if (data.success) {
        loadArticles();
        toast.success('Xóa bài viết thành công!');
      } else {
        toast.error('Có lỗi xảy ra: ' + data.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Có lỗi xảy ra khi xóa bài viết');
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 1:
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 0:
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 2:
        return <AlertCircle className="w-4 h-4 text-orange-400" />;
      default:
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return 'Công khai';
      case 0:
        return 'Nháp';
      case 2:
        return 'Chờ duyệt';
      default:
        return 'Không xác định';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Access Control Screen Component
  const AccessControlScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">🔐 Truy Cập Bảo Mật</h1>
          <p className="text-blue-200/80">Vui lòng nhập mã truy cập để tiếp tục</p>
        </div>

        <form onSubmit={handleAccessSubmit} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Key className="w-5 h-5 text-amber-400" />
            </div>
            <input
              type="password"
              placeholder="Nhập mã truy cập..."
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-amber-400/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
              disabled={verifyingAccess}
              autoFocus
            />
          </div>

          {accessError && (
            <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{accessError}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={verifyingAccess || !accessKey.trim()}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {verifyingAccess ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Đang xác thực...</span>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                <span>Xác Thực Truy Cập</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-blue-200/60 text-sm">🛡️ Trang này được bảo vệ bởi hệ thống bảo mật</p>
        </div>
      </div>
    </div>
  );

  // If no access, show access control screen
  if (!hasAccess) {
    return <AccessControlScreen />;
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">📝 Quản Lý Bài Viết</h1>
              <p className="text-blue-200/80 text-lg">Tạo, chỉnh sửa và quản lý bài viết tin tức</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 lg:mt-0 flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-medium transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Tạo Bài Viết Mới
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-blue-400/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-blue-400/30 rounded-xl text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all appearance-none"
                >
                  <option value="" className="bg-slate-800">
                    Tất cả danh mục
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.cat_id} value={cat.cat_slug} className="bg-slate-800">
                      {cat.cat_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-blue-400/30 rounded-xl text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all appearance-none"
                >
                  <option value="" className="bg-slate-800">
                    Tất cả trạng thái
                  </option>
                  <option value="1" className="bg-slate-800">
                    Công khai
                  </option>
                  <option value="0" className="bg-slate-800">
                    Nháp
                  </option>
                  <option value="2" className="bg-slate-800">
                    Chờ duyệt
                  </option>
                </select>
              </div>

              {/* Refresh Button */}
              <button
                onClick={loadArticles}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/30 rounded-xl text-blue-400 font-medium transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{articles.length}</div>
              <div className="text-white/80">Bài viết hiện tại</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {articles.filter((a) => a.ar_status === 1).length}
              </div>
              <div className="text-white/80">Đã công khai</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                {articles.filter((a) => a.ar_status === 0).length}
              </div>
              <div className="text-white/80">Bản nháp</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {articles.filter((a) => a.ar_featured).length}
              </div>
              <div className="text-white/80">Bài nổi bật</div>
            </div>
          </div>

          {/* Articles Table */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/20">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Danh sách bài viết ({articles.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
                <p className="text-blue-200">Đang tải...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
                <p className="text-blue-200 text-lg mb-2">Chưa có bài viết nào</p>
                <p className="text-blue-200/60 mb-4">Tạo bài viết đầu tiên để bắt đầu</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-colors"
                >
                  Tạo bài viết ngay
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left p-4 text-blue-200 font-medium">Bài viết</th>
                        <th className="text-left p-4 text-blue-200 font-medium">Danh mục</th>
                        <th className="text-left p-4 text-blue-200 font-medium">Trạng thái</th>
                        <th className="text-left p-4 text-blue-200 font-medium">Ngày đăng</th>
                        <th className="text-left p-4 text-blue-200 font-medium">Lượt xem</th>
                        <th className="text-right p-4 text-blue-200 font-medium">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articles.map((article) => (
                        <tr
                          key={article.ar_id}
                          className="border-t border-white/10 hover:bg-white/5 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {article.ar_img && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={article.ar_img}
                                  alt=""
                                  className="w-12 h-12 object-cover rounded-lg border border-blue-400/30"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              )}
                              <div>
                                <h3 className="text-white font-medium line-clamp-1 mb-1">
                                  {article.ar_title}
                                  {article.ar_featured && (
                                    <Star className="inline w-4 h-4 text-yellow-400 ml-2" />
                                  )}
                                </h3>
                                <p className="text-blue-200/60 text-sm line-clamp-1">{article.ar_des}</p>
                                {article.tags && article.tags.length > 0 && (
                                  <div className="flex gap-1 mt-1">
                                    {article.tags.slice(0, 2).map((tag, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-600/20 border border-blue-400/30 rounded text-blue-300 text-xs"
                                      >
                                        <Tag className="w-2 h-2" />
                                        {tag}
                                      </span>
                                    ))}
                                    {article.tags.length > 2 && (
                                      <span className="text-blue-400 text-xs">
                                        +{article.tags.length - 2}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            {article.category_name && (
                              <span
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: `${article.category_color}20`,
                                  color: article.category_color,
                                  borderColor: `${article.category_color}30`,
                                  border: '1px solid',
                                }}
                              >
                                {article.category_name}
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(article.ar_status)}
                              <span className="text-white text-sm">{getStatusText(article.ar_status)}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-blue-200">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">{formatDate(article.ar_time)}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-blue-200">
                              <Eye className="w-4 h-4" />
                              <span className="text-sm">{article.ar_views.toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => window.open(`/tintuc/${article.ar_slug}`, '_blank')}
                                className="p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/30 rounded-lg text-blue-400 transition-colors"
                                title="Xem bài viết"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditClick(article)}
                                className="p-2 bg-green-600/20 hover:bg-green-600/30 border border-green-400/30 rounded-lg text-green-400 transition-colors"
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(article.ar_id)}
                                className="p-2 bg-red-600/20 hover:bg-red-600/30 border border-red-400/30 rounded-lg text-red-400 transition-colors"
                                title="Xóa bài viết"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-6 border-t border-white/20">
                    <div className="flex items-center justify-between">
                      <p className="text-blue-200 text-sm">
                        Trang {currentPage} / {totalPages}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/30 rounded-lg text-blue-400 text-sm transition-colors disabled:opacity-50"
                        >
                          Trước
                        </button>
                        <button
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/30 rounded-lg text-blue-400 text-sm transition-colors disabled:opacity-50"
                        >
                          Sau
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Create Modal */}
        <CreateArticleModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />

        {/* Edit Article Modal */}
        <EditArticleModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingArticle(null);
          }}
          onSuccess={handleEditSuccess}
          article={editingArticle}
        />
      </div>
    </AuthGuard>
  );
}
