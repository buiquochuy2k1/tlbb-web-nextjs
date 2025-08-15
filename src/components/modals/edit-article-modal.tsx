'use client';

import { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Tag,
  Eye,
  Calendar,
  User,
  Hash,
  Save,
  Upload,
  CheckCircle,
  AlertTriangle,
  Plus,
  Minus,
  Edit3,
} from 'lucide-react';
import { secureFetch } from '@/lib/api-security';
import { ARTICLE_STATUS, VALIDATION_RULES } from '@/types/article-modal';

interface Category {
  cat_id: number;
  cat_name: string;
  cat_slug: string;
  cat_color: string;
  cat_icon: string;
}

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
  tags?: string[];
}

interface EditArticleFormData {
  ar_id: number;
  ar_title: string;
  ar_img: string;
  ar_des: string;
  ar_content: string;
  ar_slug: string;
  ar_type: number;
  ar_featured: boolean;
  ar_status: number;
  ar_meta_keywords: string;
  ar_meta_description: string;
  ar_order: number;
  tags: string[];
}

interface EditArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (article: { ar_id: number; message: string }) => void;
  article: Article | null;
}

export function EditArticleModal({ isOpen, onClose, onSuccess, article }: EditArticleModalProps) {
  const [formData, setFormData] = useState<EditArticleFormData>({
    ar_id: 0,
    ar_title: '',
    ar_img: '',
    ar_des: '',
    ar_content: '',
    ar_slug: '',
    ar_type: 1,
    ar_featured: false,
    ar_status: ARTICLE_STATUS.PUBLISHED,
    ar_meta_keywords: '',
    ar_meta_description: '',
    ar_order: 0,
    tags: [],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'seo'>('basic');
  const [previewMode, setPreviewMode] = useState(false);

  // Load categories when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Load article data when article prop changes
  useEffect(() => {
    if (article && isOpen) {
      setFormData({
        ar_id: article.ar_id,
        ar_title: article.ar_title,
        ar_img: article.ar_img,
        ar_des: article.ar_des,
        ar_content: article.ar_content,
        ar_slug: article.ar_slug,
        ar_type: article.ar_type,
        ar_featured: article.ar_featured,
        ar_status: article.ar_status,
        ar_meta_keywords: article.ar_meta_keywords || '',
        ar_meta_description: article.ar_meta_description || '',
        ar_order: article.ar_order,
        tags: article.tags || [],
      });
    }
  }, [article, isOpen]);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError(null);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = (): string | null => {
    if (!formData.ar_title.trim()) return 'Tiêu đề không được để trống';
    if (!formData.ar_des.trim()) return 'Mô tả không được để trống';
    if (!formData.ar_content.trim()) return 'Nội dung không được để trống';
    if (!formData.ar_slug.trim()) return 'Slug không được để trống';
    if (!formData.ar_type) return 'Vui lòng chọn danh mục';
    if (formData.ar_title.length > VALIDATION_RULES.TITLE_MAX_LENGTH)
      return `Tiêu đề quá dài (tối đa ${VALIDATION_RULES.TITLE_MAX_LENGTH} ký tự)`;
    if (formData.ar_des.length > VALIDATION_RULES.DESCRIPTION_MAX_LENGTH)
      return `Mô tả quá dài (tối đa ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} ký tự)`;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await secureFetch('/api/v1/tintuc/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess(data.data);
          handleClose();
        }, 2000);
      } else {
        setError(data.error || 'Có lỗi xảy ra khi cập nhật bài viết');
      }
    } catch (error) {
      console.error('Update article error:', error);
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    setNewTag('');
    setActiveTab('basic');
    setPreviewMode(false);
    onClose();
  };

  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-md rounded-2xl border border-purple-400/30 w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-400/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Chỉnh Sửa Bài Viết</h2>
              <p className="text-purple-200/70 text-sm">ID: #{article.ar_id}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {success ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Cập nhật bài viết thành công!</h3>
              <p className="text-purple-200/80 text-sm">Bài viết đã được cập nhật thành công.</p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex border-b border-purple-400/20 px-6">
                {[
                  { id: 'basic', label: 'Thông Tin Cơ Bản', icon: FileText },
                  { id: 'content', label: 'Nội Dung', icon: Edit3 },
                  { id: 'seo', label: 'SEO & Cài Đặt', icon: Hash },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'basic' | 'content' | 'seo')}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-purple-400 text-purple-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Form Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Tab */}
                  {activeTab === 'basic' && (
                    <div className="space-y-4">
                      {/* Title */}
                      <div>
                        <label className="block text-purple-200 text-sm font-medium mb-2">
                          Tiêu đề bài viết *
                        </label>
                        <input
                          type="text"
                          name="ar_title"
                          value={formData.ar_title}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/5 border border-purple-400/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                          placeholder="Nhập tiêu đề bài viết..."
                          disabled={isLoading}
                        />
                      </div>

                      {/* Slug */}
                      <div>
                        <label className="block text-purple-200 text-sm font-medium mb-2">
                          Đường dẫn (Slug) *
                        </label>
                        <input
                          type="text"
                          name="ar_slug"
                          value={formData.ar_slug}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/5 border border-purple-400/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                          placeholder="duong-dan-bai-viet"
                          disabled={isLoading}
                        />
                      </div>

                      {/* Category & Featured */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-purple-200 text-sm font-medium mb-2">Danh mục *</label>
                          <select
                            name="ar_type"
                            value={formData.ar_type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/5 border border-purple-400/30 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                            disabled={isLoading}
                          >
                            <option value="">Chọn danh mục</option>
                            {categories.map((cat) => (
                              <option key={cat.cat_id} value={cat.cat_id} className="bg-slate-800">
                                {cat.cat_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-end">
                          <label className="flex items-center gap-3 p-3 bg-purple-600/20 border border-purple-400/30 rounded-xl cursor-pointer hover:bg-purple-600/30 transition-colors">
                            <input
                              type="checkbox"
                              name="ar_featured"
                              checked={formData.ar_featured}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-purple-600 rounded"
                              disabled={isLoading}
                            />
                            <span className="text-purple-200 text-sm font-medium">Bài viết nổi bật</span>
                          </label>
                        </div>
                      </div>

                      {/* Image */}
                      <div>
                        <label className="block text-purple-200 text-sm font-medium mb-2">Ảnh đại diện</label>
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <input
                              type="url"
                              name="ar_img"
                              value={formData.ar_img}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 bg-white/5 border border-purple-400/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                              placeholder="https://example.com/image.jpg"
                              disabled={isLoading}
                            />
                          </div>
                          <button
                            type="button"
                            className="px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-400/30 rounded-xl text-purple-400 transition-colors"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                        </div>
                        {formData.ar_img && (
                          <div className="mt-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={formData.ar_img}
                              alt="Preview"
                              className="w-32 h-20 object-cover rounded-lg border border-purple-400/30"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-purple-200 text-sm font-medium mb-2">Mô tả ngắn *</label>
                        <textarea
                          name="ar_des"
                          value={formData.ar_des}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-3 bg-white/5 border border-purple-400/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all resize-none"
                          placeholder="Mô tả ngắn về nội dung bài viết..."
                          disabled={isLoading}
                        />
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-purple-200 text-sm font-medium mb-2">Tags</label>
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-1 px-4 py-2 bg-white/5 border border-purple-400/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                            placeholder="Thêm tag mới..."
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={handleAddTag}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600/20 border border-purple-400/30 rounded-full text-purple-200 text-sm"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-1 text-purple-400 hover:text-red-400 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Content Tab */}
                  {activeTab === 'content' && (
                    <div className="space-y-4">
                      {/* Content Toolbar */}
                      <div className="flex items-center justify-between">
                        <label className="block text-purple-200 text-sm font-medium">
                          Nội dung bài viết *
                        </label>
                        <button
                          type="button"
                          onClick={() => setPreviewMode(!previewMode)}
                          className="flex items-center gap-2 px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-400/30 rounded-lg text-purple-400 text-sm transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          {previewMode ? 'Chỉnh sửa' : 'Xem trước'}
                        </button>
                      </div>

                      {previewMode ? (
                        <div className="min-h-[300px] p-4 bg-white/5 border border-purple-400/30 rounded-xl text-white">
                          <div
                            className="prose prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: formData.ar_content }}
                          />
                        </div>
                      ) : (
                        <textarea
                          name="ar_content"
                          value={formData.ar_content}
                          onChange={handleInputChange}
                          rows={15}
                          className="w-full px-4 py-3 bg-white/5 border border-purple-400/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all resize-none font-mono text-sm"
                          placeholder="Nhập nội dung bài viết (HTML được hỗ trợ)..."
                          disabled={isLoading}
                        />
                      )}
                    </div>
                  )}

                  {/* SEO Tab */}
                  {activeTab === 'seo' && (
                    <div className="space-y-4">
                      {/* Status & Order */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-purple-200 text-sm font-medium mb-2">Trạng thái</label>
                          <select
                            name="ar_status"
                            value={formData.ar_status}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/5 border border-purple-400/30 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                            disabled={isLoading}
                          >
                            <option value={1} className="bg-slate-800">
                              Công khai
                            </option>
                            <option value={0} className="bg-slate-800">
                              Nháp
                            </option>
                            <option value={2} className="bg-slate-800">
                              Chờ duyệt
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-purple-200 text-sm font-medium mb-2">
                            Thứ tự hiển thị
                          </label>
                          <input
                            type="number"
                            name="ar_order"
                            value={formData.ar_order}
                            onChange={handleInputChange}
                            min="0"
                            className="w-full px-4 py-3 bg-white/5 border border-purple-400/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      {/* Meta Keywords */}
                      <div>
                        <label className="block text-purple-200 text-sm font-medium mb-2">Từ khóa SEO</label>
                        <input
                          type="text"
                          name="ar_meta_keywords"
                          value={formData.ar_meta_keywords}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/5 border border-purple-400/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                          placeholder="từ khóa 1, từ khóa 2, từ khóa 3"
                          disabled={isLoading}
                        />
                      </div>

                      {/* Meta Description */}
                      <div>
                        <label className="block text-purple-200 text-sm font-medium mb-2">Mô tả SEO</label>
                        <textarea
                          name="ar_meta_description"
                          value={formData.ar_meta_description}
                          onChange={handleInputChange}
                          rows={3}
                          maxLength={VALIDATION_RULES.META_DESCRIPTION_MAX_LENGTH}
                          className="w-full px-4 py-3 bg-white/5 border border-purple-400/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all resize-none"
                          placeholder="Mô tả ngắn gọn cho Google Search (tối đa 160 ký tự)"
                          disabled={isLoading}
                        />
                        <p className="text-purple-300/70 text-xs mt-1">
                          {formData.ar_meta_description.length}/{VALIDATION_RULES.META_DESCRIPTION_MAX_LENGTH}{' '}
                          ký tự
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}
                </form>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-purple-400/20 bg-slate-900/50">
                <div className="flex items-center gap-2 text-purple-200/70 text-sm">
                  <User className="w-4 h-4" />
                  <span>ID: #{formData.ar_id}</span>
                  <Calendar className="w-4 h-4 ml-4" />
                  <span>{new Date(article.ar_time * 1000).toLocaleDateString('vi-VN')}</span>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all"
                    disabled={isLoading}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    <Save className="w-4 h-4" />
                    {isLoading ? 'Đang cập nhật...' : 'Cập nhật bài viết'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
