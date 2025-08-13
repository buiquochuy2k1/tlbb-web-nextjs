import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import 'animate.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Thiên Long Thiên Hà',
  description:
    'Thiên Long Thiên Hà là trang web chia sẻ thông tin về game Thiên Long Thiên Hà, với đầy đủ tính năng và trải nghiệm tốt nhất cho người chơi. Web hỗ trợ người chơi cập nhật thông tin, đăng ký, đăng nhập và thay đổi mật khẩu cũng như xem được thông tin tài khoản của mình. ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
