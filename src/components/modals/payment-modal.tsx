'use client';

import { useState, useEffect } from 'react';
import { X, Clock, QrCode, CreditCard } from 'lucide-react';

interface PaymentPackage {
  id: string;
  silver: number;
  price: number;
  bonus: number;
  popular?: boolean;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  selectedPackage: PaymentPackage;
  qrCodeUrl: string;
  timeLeft: number;
}

export function PaymentModal({
  isOpen,
  onClose,
  onComplete,
  selectedPackage,
  qrCodeUrl,
  timeLeft,
}: PaymentModalProps) {
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsExpired(false);
      return;
    }

    setIsExpired(timeLeft <= 0);
  }, [isOpen, timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatSilver = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-auto animate__animated animate__zoomIn">
        <div className="backdrop-blur-lg bg-gradient-to-br from-black/80 to-gray-900/80 border-2 border-yellow-500/30 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-600/20 to-red-600/20 border-b border-yellow-500/30 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Xác Nhận Thanh Toán
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Timer */}
            <div className="text-center mb-6">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
                  isExpired
                    ? 'bg-red-600/20 border border-red-500/30'
                    : timeLeft <= 60
                    ? 'bg-orange-600/20 border border-orange-500/30'
                    : 'bg-green-600/20 border border-green-500/30'
                }`}
              >
                <Clock className="w-5 h-5" />
                <span
                  className={`text-lg font-mono font-bold ${
                    isExpired ? 'text-red-400' : timeLeft <= 60 ? 'text-orange-400' : 'text-green-400'
                  }`}
                >
                  {isExpired ? 'HẾT HẠN' : formatTime(timeLeft)}
                </span>
              </div>
              <p className="text-gray-300 text-sm mt-2">
                {isExpired ? 'Phiên thanh toán đã hết hạn' : 'Thời gian còn lại để hoàn tất thanh toán'}
              </p>
            </div>

            {/* Package Info */}
            <div className="bg-gradient-to-br from-yellow-900/20 to-red-900/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <h4 className="text-yellow-400 font-semibold mb-3 text-center">📦 Thông Tin Gói Nạp</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Số bạc:</span>
                  <span className="text-yellow-400 font-bold">
                    {formatSilver(selectedPackage.silver)} Bạc
                  </span>
                </div>
                {selectedPackage.bonus > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Bạc thưởng:</span>
                    <span className="text-green-400 font-bold">
                      +{formatSilver(selectedPackage.bonus)} Bạc
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-yellow-500/20 pt-2">
                  <span className="text-gray-300">Tổng cộng:</span>
                  <span className="text-white font-bold text-lg">
                    {formatCurrency(selectedPackage.price)}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code Preview */}
            <div className="text-center mb-6">
              <div className="bg-white p-3 rounded-xl inline-block mb-3">
                <img
                  src={qrCodeUrl}
                  alt="QR Code Preview"
                  width={128}
                  height={128}
                  className="w-32 h-32 mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-qr.png';
                  }}
                />
              </div>
              <p className="text-gray-300 text-sm flex items-center justify-center gap-1">
                <QrCode className="w-4 h-4" />
                Quét mã QR để thanh toán
              </p>
            </div>

            {/* Payment Instructions */}
            <div className="bg-gradient-to-br from-blue-900/20 to-green-900/20 border border-blue-500/30 rounded-xl p-4 mb-6">
              <h4 className="text-blue-400 font-semibold mb-3">📋 Hướng Dẫn Thanh Toán</h4>
              <ol className="text-sm text-gray-300 space-y-1">
                <li>1. Mở ứng dụng MB Bank trên điện thoại</li>
                <li>2. Chọn &quot;Chuyển khoản&quot; → &quot;Quét mã QR&quot;</li>
                <li>3. Quét mã QR hiển thị ở trên</li>
                <li>4. Xác nhận thông tin và chuyển khoản</li>
                <li>5. Bấm &quot;Tôi Đã Nạp&quot; sau khi hoàn tất</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isExpired}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isExpired
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isExpired ? '❌ Hết Hạn' : '🔄 Đóng'}
              </button>

              <button
                onClick={onComplete}
                disabled={isExpired}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isExpired
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isExpired ? '❌ Hết Hạn' : '✅ Tôi Đã Nạp'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
