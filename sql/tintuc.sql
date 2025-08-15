CREATE TABLE IF NOT EXISTS `article` (
  `ar_id` int(11) NOT NULL AUTO_INCREMENT,
  `ar_title` varchar(500) NOT NULL,                    -- Tăng độ dài cho tiêu đề dài
  `ar_img` varchar(255) NOT NULL,                      -- Giữ nguyên
  `ar_des` text,                                       -- Thay đổi thành TEXT cho mô tả dài
  `ar_content` longtext NOT NULL,                      -- Thay đổi thành LONGTEXT cho nội dung dài
  `ar_slug` varchar(255) NOT NULL,                     -- Giữ nguyên
  `ar_type` int(2) NOT NULL,                          -- Giữ nguyên (dùng làm category_id)
  `ar_time` int(11) NOT NULL,                         -- Giữ nguyên (timestamp)
  `ar_by` int(11) NOT NULL,                           -- Giữ nguyên (author_id)
  
  -- Thêm các trường mới
  `ar_views` int(11) DEFAULT 0,                       -- Số lượt xem
  `ar_featured` tinyint(1) DEFAULT 0,                 -- Tin nổi bật (0: không, 1: có)
  `ar_status` tinyint(1) DEFAULT 1,                   -- Trạng thái (0: ẩn, 1: hiện, 2: nháp)
  `ar_meta_keywords` varchar(500),                    -- Keywords SEO
  `ar_meta_description` varchar(300),                 -- Meta description SEO
  `ar_updated_at` int(11),                            -- Thời gian cập nhật
  `ar_order` int(11) DEFAULT 0,                       -- Thứ tự hiển thị
  
  PRIMARY KEY (`ar_id`) USING BTREE,
  INDEX `idx_type` (`ar_type`),
  INDEX `idx_status` (`ar_status`),
  INDEX `idx_featured` (`ar_featured`),
  INDEX `idx_time` (`ar_time`),
  UNIQUE KEY `unique_slug` (`ar_slug`(191))
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;



CREATE TABLE IF NOT EXISTS `article_categories` (
  `cat_id` int(11) NOT NULL AUTO_INCREMENT,
  `cat_name` varchar(100) NOT NULL,                   -- Tên danh mục
  `cat_slug` varchar(100) NOT NULL,                   -- Slug danh mục
  `cat_color` varchar(50) DEFAULT 'from-gray-500 to-slate-600', -- Màu gradient
  `cat_icon` varchar(50) DEFAULT 'Newspaper',         -- Icon component name
  `cat_order` int(11) DEFAULT 0,                      -- Thứ tự hiển thị
  `cat_status` tinyint(1) DEFAULT 1,                  -- Trạng thái
  
  PRIMARY KEY (`cat_id`),
  UNIQUE KEY `unique_slug` (`cat_slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default categories
INSERT INTO `article_categories` (`cat_id`, `cat_name`, `cat_slug`, `cat_color`, `cat_icon`, `cat_order`) VALUES
(1, 'Sự Kiện', 'su-kien', 'from-amber-500 to-yellow-600', 'Gift', 1),
(2, 'Cập Nhật', 'cap-nhat', 'from-blue-500 to-cyan-600', 'Zap', 2),
(3, 'Giải Đấu', 'giai-dau', 'from-purple-500 to-pink-600', 'Trophy', 3),
(4, 'Hướng Dẫn', 'huong-dan', 'from-green-500 to-emerald-600', 'Gamepad2', 4),
(5, 'Thông Báo', 'thong-bao', 'from-red-500 to-orange-600', 'Users', 5);



CREATE TABLE IF NOT EXISTS `article_tags` (
  `tag_id` int(11) NOT NULL AUTO_INCREMENT,
  `tag_name` varchar(50) NOT NULL,
  `tag_slug` varchar(50) NOT NULL,
  `tag_count` int(11) DEFAULT 0,                      -- Số bài viết có tag này
  
  PRIMARY KEY (`tag_id`),
  UNIQUE KEY `unique_slug` (`tag_slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




CREATE TABLE IF NOT EXISTS `article_tag_relations` (
  `rel_id` int(11) NOT NULL AUTO_INCREMENT,
  `ar_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  
  PRIMARY KEY (`rel_id`),
  FOREIGN KEY (`ar_id`) REFERENCES `article`(`ar_id`) ON DELETE CASCADE,
  FOREIGN KEY (`tag_id`) REFERENCES `article_tags`(`tag_id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_relation` (`ar_id`, `tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;