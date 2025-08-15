// Types for Article Modal and API
export interface ArticleCategory {
  cat_id: number;
  cat_name: string;
  cat_slug: string;
  cat_color: string;
  cat_icon: string;
  cat_description?: string;
  cat_order: number;
  cat_status: number;
  article_count?: number;
}

export interface CreateArticleData {
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

export interface CreatedArticle {
  ar_id: number;
  message: string;
}

export interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (article: CreatedArticle) => void;
}

// Article Status Constants
export const ARTICLE_STATUS = {
  DRAFT: 0,
  PUBLISHED: 1,
  PENDING: 2,
} as const;

export const ARTICLE_STATUS_LABELS = {
  [ARTICLE_STATUS.DRAFT]: 'Nháp',
  [ARTICLE_STATUS.PUBLISHED]: 'Công khai',
  [ARTICLE_STATUS.PENDING]: 'Chờ duyệt',
} as const;

// Form validation rules
export const VALIDATION_RULES = {
  TITLE_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 500,
  META_DESCRIPTION_MAX_LENGTH: 160,
  SLUG_PATTERN: /^[a-z0-9-]+$/,
} as const;
