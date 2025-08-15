import { z, ZodError } from 'zod';

// Custom regex patterns
const USERNAME_REGEX = /^[a-zA-Z0-9]+$/; // Chỉ chữ và số, không dấu, không cách, không ký tự đặc biệt
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/; // Ít nhất 6 ký tự, có chữ và số
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Danh sách câu hỏi bí mật hợp lệ
const VALID_SECRET_QUESTIONS = ['1', '2', '3', '4', '5', '6'] as const;

// Register schema
export const registerSchema = z
  .object({
    // Tên đăng nhập - chỉ chữ và số, không dấu, không cách, không ký tự đặc biệt
    ten: z
      .string()
      .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
      .max(20, 'Tên đăng nhập không được vượt quá 20 ký tự')
      .regex(
        USERNAME_REGEX,
        'Tên đăng nhập chỉ được chứa chữ cái và số, không có dấu, khoảng cách hay ký tự đặc biệt'
      )
      .refine((val) => val.trim() === val, 'Tên đăng nhập không được có khoảng trắng ở đầu hoặc cuối'),

    // Mật khẩu - ít nhất 6 ký tự, phải có cả chữ và số
    mk: z
      .string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
      .max(50, 'Mật khẩu không được vượt quá 50 ký tự')
      .regex(PASSWORD_REGEX, 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số'),

    // Xác nhận mật khẩu
    rmk: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),

    // Email - optional nhưng nếu có thì phải hợp lệ
    email: z
      .string()
      .email('Email không hợp lệ')
      .min(1, 'Email là bắt buộc')
      .max(100, 'Email không được vượt quá 100 ký tự')
      .regex(EMAIL_REGEX, 'Định dạng email không hợp lệ'),

    // Câu hỏi bí mật - phải chọn từ danh sách
    cauhoi: z.enum(VALID_SECRET_QUESTIONS, {
      message: 'Vui lòng chọn một câu hỏi bí mật hợp lệ',
    }),

    // Trả lời bí mật
    traloi: z
      .string()
      .min(1, 'Vui lòng nhập trả lời cho câu hỏi bí mật')
      .max(100, 'Trả lời không được vượt quá 100 ký tự')
      .refine((val) => val.trim().length > 0, 'Trả lời không được chỉ chứa khoảng trắng'),

    // Xác nhận trả lời bí mật
    retraloi: z.string().min(1, 'Vui lòng xác nhận trả lời bí mật'),

    // Checkbox đồng ý điều khoản
    ck: z
      .string()
      .min(1, 'Vui lòng đồng ý với điều khoản sử dụng')
      .refine((val) => val === 'ok', 'Bạn phải đồng ý với điều khoản sử dụng để tiếp tục'),

    // Mã xác nhận captcha
    maxacnhan: z.string().min(1, 'Vui lòng nhập mã xác nhận').regex(/^\d+$/, 'Mã xác nhận phải là số'),

    // Mã PIN
    pin: z
      .string()
      .min(4, 'Mã PIN phải có ít nhất 4 ký tự')
      .max(6, 'Mã PIN không được vượt quá 6 ký tự')
      .regex(/^\d+$/, 'Mã PIN chỉ được chứa số'),
  })
  .refine(
    // Kiểm tra mật khẩu và xác nhận mật khẩu khớp nhau
    (data) => data.mk === data.rmk,
    {
      message: 'Mật khẩu xác nhận không khớp',
      path: ['rmk'], // Lỗi sẽ hiển thị ở field rmk
    }
  )
  .refine(
    // Kiểm tra trả lời bí mật và xác nhận khớp nhau
    (data) => data.traloi === data.retraloi,
    {
      message: 'Trả lời bí mật xác nhận không khớp',
      path: ['retraloi'], // Lỗi sẽ hiển thị ở field retraloi
    }
  );

// Login schema
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Tên đăng nhập là bắt buộc')
    .max(20, 'Tên đăng nhập không được vượt quá 20 ký tự'),

  password: z.string().min(1, 'Mật khẩu là bắt buộc').max(50, 'Mật khẩu không được vượt quá 50 ký tự'),
});

// Change password schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mật khẩu hiện tại là bắt buộc'),

    newPassword: z
      .string()
      .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
      .max(50, 'Mật khẩu mới không được vượt quá 50 ký tự')
      .regex(PASSWORD_REGEX, 'Mật khẩu mới phải chứa ít nhất 1 chữ cái và 1 số'),

    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
    path: ['newPassword'],
  });

// Type exports
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Helper function to validate captcha answer
export const validateCaptchaAnswer = (userAnswer: string, correctAnswer: string): boolean => {
  return userAnswer.trim() === correctAnswer.trim();
};

// Helper function to check username availability (client-side pre-validation)
export const validateUsernameFormat = (username: string): { isValid: boolean; message?: string } => {
  if (!username) {
    return { isValid: false, message: 'Tên đăng nhập không được để trống' };
  }

  if (username.length < 3) {
    return { isValid: false, message: 'Tên đăng nhập phải có ít nhất 3 ký tự' };
  }

  if (username.length > 20) {
    return { isValid: false, message: 'Tên đăng nhập không được vượt quá 20 ký tự' };
  }

  if (!USERNAME_REGEX.test(username)) {
    return { isValid: false, message: 'Tên đăng nhập chỉ được chứa chữ cái và số' };
  }

  return { isValid: true };
};

// Helper function to check password strength
export const getPasswordStrength = (
  password: string
): {
  score: number;
  feedback: string[];
  level: 'weak' | 'medium' | 'strong';
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push('Nên có ít nhất 8 ký tự');

  // Has lowercase
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Nên có chữ thường');

  // Has uppercase
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Nên có chữ hoa');

  // Has number
  if (/\d/.test(password)) score += 1;
  else feedback.push('Nên có số');

  // Has special character
  if (/[@$!%*?&]/.test(password)) score += 1;
  else feedback.push('Nên có ký tự đặc biệt');

  let level: 'weak' | 'medium' | 'strong';
  if (score <= 2) level = 'weak';
  else if (score <= 3) level = 'medium';
  else level = 'strong';

  return { score, feedback, level };
};

// Helper function for server-side error mapping
export const getVietnameseErrorMessage = (error: ZodError): string => {
  if (!error?.issues || error.issues.length === 0) {
    return 'Dữ liệu không hợp lệ';
  }

  const firstError = error.issues[0];
  const field = firstError.path[0];
  const message = firstError.message;

  // Map field-specific errors to Vietnamese
  const fieldMap: Record<string, string> = {
    ten: 'Tên đăng nhập',
    mk: 'Mật khẩu',
    rmk: 'Xác nhận mật khẩu',
    email: 'Email',
    cauhoi: 'Câu hỏi bí mật',
    traloi: 'Trả lời bí mật',
    retraloi: 'Xác nhận trả lời',
    ck: 'Điều khoản',
    maxacnhan: 'Mã xác nhận',
    pin: 'Mã PIN',
    username: 'Tên đăng nhập',
    password: 'Mật khẩu',
  };

  const fieldName = fieldMap[field as string] || 'Trường';

  // Return formatted error message
  return `${fieldName}: ${message}`;
};
