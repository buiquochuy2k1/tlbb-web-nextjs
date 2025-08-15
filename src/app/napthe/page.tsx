'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AuthGuard } from '@/components/auth/auth-guard';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { PaymentModal } from '@/components/modals/payment-modal';
import { secureFetch } from '@/lib/api-security';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentPackage {
  id: string;
  silver: number;
  price: number;
  bonus: number;
  popular?: boolean;
  packages: string[];
}

// Payment packages will be loaded from API
const DEFAULT_PACKAGES: PaymentPackage[] = [
  { id: '1', silver: 1000, price: 10000, bonus: 0, packages: ['starter'] },
  { id: '2', silver: 5000, price: 50000, bonus: 500, packages: ['basic'] },
  { id: '3', silver: 10000, price: 100000, bonus: 1500, popular: true, packages: ['medium'] },
  { id: '4', silver: 20000, price: 200000, bonus: 4000, packages: ['high'] },
  { id: '5', silver: 50000, price: 500000, bonus: 12500, packages: ['ultra'] },
  { id: '6', silver: 100000, price: 1000000, bonus: 30000, packages: ['max'] },
];

export default function NapThePage() {
  const [selectedPackage, setSelectedPackage] = useState<PaymentPackage | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [transferContent, setTransferContent] = useState('');
  const [username, setUsername] = useState('');
  const [paymentTimeLeft, setPaymentTimeLeft] = useState(0);
  const [currentTransactionCode, setCurrentTransactionCode] = useState<string | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const paymentTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);
  const [paymentPackages, setPaymentPackages] = useState<PaymentPackage[]>(DEFAULT_PACKAGES);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);

  // Database-based payment session management

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatSilver = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // Load active payment session from database
  const loadActivePaymentSession = useCallback(async () => {
    try {
      const response = await secureFetch('/api/v1/payment/session');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // console.log('🔄 Restored payment session from database:', data.data);

          // Find matching package for UI
          const matchingPackage = paymentPackages.find((pkg) => pkg.price === data.data.amount);

          return {
            selectedPackage: matchingPackage, // Could be undefined
            transactionCode: data.data.transactionCode,
            qrCodeUrl: data.data.qrCodeUrl,
            timeLeft: data.data.remainingTime,
            transactionId: data.data.transactionId,
            amount: data.data.amount, // Add amount for fallback package creation
            showQRCode: true,
          };
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to load payment session:', error);
      return null;
    }
  }, []);

  // Load payment packages from database
  const loadPaymentPackages = useCallback(async () => {
    try {
      setIsLoadingPackages(true);
      const response = await secureFetch('/api/v1/billing/packages');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setPaymentPackages(data.data);
          console.log('✅ Loaded payment packages from database:', data.data.length, 'packages');
        }
      }
    } catch (error) {
      console.error('❌ Failed to load payment packages:', error);
      // Keep using default packages on error
    } finally {
      setIsLoadingPackages(false);
    }
  }, []);

  // Fetch user profile and restore payment session
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await secureFetch('/api/v1/account/profile');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUsername(data.data.name);

            // After getting username, try to restore payment session
            const savedSession = await loadActivePaymentSession();
            if (savedSession) {
              // console.log('🔄 Restoring session data:', savedSession);

              // Set package even if not found in PAYMENT_PACKAGES
              if (savedSession.selectedPackage) {
                setSelectedPackage(savedSession.selectedPackage);
              } else {
                // Create a temporary package if not found
                const tempPackage: PaymentPackage = {
                  id: 'temp',
                  silver: Math.floor((savedSession.amount || 0) / 100), // Estimate silver from price
                  price: savedSession.amount || 0,
                  bonus: 0,
                  packages: ['restored'],
                };
                setSelectedPackage(tempPackage);
                console.log('⚠️ Package not found, using temporary package:', tempPackage);
              }

              setQrCodeUrl(savedSession.qrCodeUrl);
              setTransferContent(savedSession.transactionCode);
              setCurrentTransactionCode(savedSession.transactionCode);
              setPaymentTimeLeft(savedSession.timeLeft);
              setShowQRCode(true); // Force show QR code
              setShowModal(false); // Always show QR code directly, not modal
              setIsPaymentCompleted(false);

              // console.log('✅ Payment session restored successfully', {
              //   hasPackage: !!savedSession.selectedPackage,
              //   showQRCode: true,
              //   timeLeft: savedSession.timeLeft,
              // });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    // Load packages first, then fetch profile
    loadPaymentPackages().then(() => {
      fetchProfile();
    });
  }, [loadActivePaymentSession, loadPaymentPackages]);

  // Payment countdown timer with auto-cleanup
  useEffect(() => {
    // Clear any existing timer first
    if (paymentTimerRef.current) {
      clearInterval(paymentTimerRef.current);
      paymentTimerRef.current = null;
    }

    // Don't start timer if payment completed or no time left
    if (paymentTimeLeft <= 0 || isPaymentCompleted) {
      return;
    }

    const timer = setInterval(() => {
      setPaymentTimeLeft((prev) => {
        const newTime = prev - 1;

        if (newTime <= 0) {
          setShowModal(false);
          setShowQRCode(false);
          setSelectedPackage(null);
          setCurrentTransactionCode(null);

          toast.error('Phiên thanh toán đã hết hạn! Vui lòng chọn gói khác nếu muốn tiếp tục.');
          return 0;
        }
        return newTime;
      });
    }, 1000);

    paymentTimerRef.current = timer;

    return () => {
      if (paymentTimerRef.current) {
        clearInterval(paymentTimerRef.current);
        paymentTimerRef.current = null;
      }
    };
  }, [paymentTimeLeft, isPaymentCompleted]);

  const handleSelectPackage = async (pkg: PaymentPackage) => {
    if (isCreatingPayment) return;

    setIsCreatingPayment(true);

    try {
      // Generate transaction code
      const randomCode =
        Date.now().toString().slice(-6) +
        Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, '0');
      const transactionCode = `TLTH ${username} ${randomCode}`;

      // Call API to create payment transaction
      const response = await secureFetch('/api/v1/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: pkg.packages[0], // Use first package type
          amount: pkg.price,
          transactionCode: transactionCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedPackage(pkg);
        setQrCodeUrl(data.data.qrCodeUrl);
        setTransferContent(transactionCode);
        setCurrentTransactionCode(transactionCode);
        setIsPaymentCompleted(false); // Reset payment completed flag
        setPaymentTimeLeft(600); // Start 10-minute countdown
        setShowModal(true);
        setShowQRCode(false);
      } else {
        toast.error('Lỗi tạo giao dịch: ' + data.error);
      }
    } catch (error) {
      console.error('❌ Error creating payment:', error);
      toast.error('Lỗi kết nối! Vui lòng thử lại.');
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (selectedPackage) {
      setShowQRCode(true);
    }
  };

  const handlePaymentComplete = async () => {
    if (!currentTransactionCode) return;

    try {
      console.log('🔍 Verifying payment:', currentTransactionCode);

      const response = await secureFetch('/api/v1/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionCode: currentTransactionCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // console.log('✅ Payment verified successfully, stopping all timers');

        // Mark payment as completed FIRST to prevent any timer actions
        setIsPaymentCompleted(true);

        // Force stop timer immediately
        if (paymentTimerRef.current) {
          clearInterval(paymentTimerRef.current);
          paymentTimerRef.current = null;
        }

        // Stop timer by setting time to 0
        setPaymentTimeLeft(0);

        // Clean up UI
        setShowModal(false);
        setShowQRCode(false);
        setSelectedPackage(null);
        setCurrentTransactionCode(null);

        toast.success(
          `✅ Xác minh thành công!\n\nGói: ${data.data.package}\nSố tiền: ${data.data.amount} VND\nMã GD: ${
            data.data.bankRefNo
          }\nBạc nhận được: ${data.data.baseSilver || 0}${
            data.data.bonusSilver ? ` + ${data.data.bonusSilver} (thưởng)` : ''
          } = ${data.data.silverAdded || 0}\n\nBạc đã được cộng vào tài khoản!`
        );
      } else {
        toast.error(
          `❌ Xác minh thất bại!\n\nLỗi: ${data.error}\n\nVui lòng kiểm tra lại giao dịch hoặc liên hệ hỗ trợ.`
        );
      }
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      toast.error('❌ Lỗi kết nối! Vui lòng thử lại sau.');
    }
  };

  // Function to delete expired transaction
  const deleteExpiredTransaction = async (transactionCode: string) => {
    try {
      // console.log('🗑️ Attempting to delete transaction:', transactionCode);

      const response = await secureFetch(`/api/v1/payment/delete/${encodeURIComponent(transactionCode)}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        // console.log('✅ Transaction deleted successfully:', transactionCode);
      } else {
        // console.log('⚠️ Transaction delete failed:', data.error);
        // Don't show error to user - might be already completed/deleted
      }
    } catch (error) {
      console.error('❌ Error deleting transaction:', error);
      // Don't show error to user - transaction might already be deleted
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-amber-900/20 via-red-900/20 to-yellow-900/20 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('/assets/images/bd-bg-blue.png')] bg-cover bg-center bg-fixed opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/40"></div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Home Button */}
          <div className="flex justify-center mb-2">
            <Link href="/" className="group">
              <div className="glass rounded-xl px-6 py-3 flex items-center space-x-3 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <Home className="w-5 h-5 text-amber-400 group-hover:text-amber-300" />
                <span className="text-white font-medium group-hover:text-amber-300">Quay về trang chủ</span>
              </div>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8 animate__animated animate__fadeInDown">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-600 mb-4">
              Nạp Bạc Thiên Long
            </h1>
            <p className="text-gray-300 text-lg">Chọn gói nạp phù hợp để tăng sức mạnh trong game</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
            {/* Left Side - Package Selection */}
            <div className={`${showQRCode ? 'lg:w-1/2' : 'w-full'} transition-all duration-500`}>
              <div className="backdrop-blur-lg bg-black/30 border border-yellow-500/20 rounded-2xl p-6 shadow-2xl h-full flex flex-col">
                <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center">🪙 Chọn Gói Nạp Bạc</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  {paymentPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => handleSelectPackage(pkg)}
                      className={`
                        relative cursor-pointer group transition-all duration-300 transform hover:scale-105
                        ${pkg.popular ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}
                        ${selectedPackage?.id === pkg.id ? 'ring-2 ring-red-500' : ''}
                      `}
                    >
                      {(pkg.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                          <span className="bg-gradient-to-r from-yellow-400 to-red-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                            🔥 PHỔ BIẾN
                          </span>
                        </div>
                      )) ||
                        null}

                      <div className="backdrop-blur-lg bg-gradient-to-br from-yellow-900/20 to-red-900/20 border border-yellow-500/30 rounded-xl p-4 hover:border-yellow-400/50 transition-all duration-300">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-400 mb-1">
                            {formatSilver(pkg.silver)} Bạc
                          </div>
                          {pkg.bonus > 0 && (
                            <div className="text-sm text-green-400 mb-2">
                              + {formatSilver(pkg.bonus)} Bạc thưởng
                            </div>
                          )}
                          <div className="text-lg text-white font-semibold mb-3">
                            {formatCurrency(pkg.price)}
                          </div>

                          <div className="bg-gradient-to-r from-yellow-600 to-red-600 hover:from-yellow-500 hover:to-red-500 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 group-hover:shadow-lg">
                            Chọn Gói
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedPackage && showQRCode && (
                  <div className="mt-6 text-center">
                    <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl p-4">
                      <div className="text-green-400 font-semibold mb-2">
                        ✅ Đã chọn: {formatSilver(selectedPackage.silver)} Bạc
                      </div>
                      <div className="text-white">Số tiền: {formatCurrency(selectedPackage.price)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - QR Code Display */}
            {showQRCode && selectedPackage && (
              <div className="lg:w-1/2 animate__animated animate__fadeInRight">
                <div className="backdrop-blur-lg bg-black/30 border border-green-500/20 rounded-2xl p-6 shadow-2xl h-full flex flex-col">
                  <h2 className="text-2xl font-bold text-green-400 mb-4 text-center">
                    📱 Quét Mã QR Thanh Toán
                  </h2>

                  {/* Timer */}
                  <div className="text-center mb-4">
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
                        paymentTimeLeft <= 60
                          ? 'bg-red-600/20 border border-red-500/30'
                          : paymentTimeLeft <= 180
                          ? 'bg-orange-600/20 border border-orange-500/30'
                          : 'bg-green-600/20 border border-green-500/30'
                      }`}
                    >
                      <span className="text-lg">⏰</span>
                      <span
                        className={`text-lg font-mono font-bold ${
                          paymentTimeLeft <= 60
                            ? 'text-red-400'
                            : paymentTimeLeft <= 180
                            ? 'text-orange-400'
                            : 'text-green-400'
                        }`}
                      >
                        {formatTime(paymentTimeLeft)}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">Thời gian còn lại</p>
                  </div>

                  <div className="text-center flex-1 flex flex-col justify-center">
                    <div className="bg-white p-4 rounded-xl mb-4 inline-block mx-auto">
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        width={256}
                        height={256}
                        className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 mx-auto"
                        onError={(e) => {
                          console.error('QR Code load error:', e);
                          (e.target as HTMLImageElement).src = '/placeholder-qr.png';
                        }}
                      />
                    </div>

                    <div className="space-y-3 text-left bg-gradient-to-br from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-xl p-4">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Ngân hàng:</span>
                        <span className="text-white font-semibold">MB Bank</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Số tài khoản:</span>
                        <span className="text-white font-semibold">{process.env.BANK_ACCOUNT_NO}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Số tiền:</span>
                        <span className="text-green-400 font-bold">
                          {formatCurrency(selectedPackage.price)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Nội dung:</span>
                        <span className="text-yellow-400 font-semibold">{transferContent}</span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <button
                        onClick={handlePaymentComplete}
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        ✅ Tôi Đã Chuyển Khoản
                      </button>

                      <button
                        onClick={() => {
                          // Cancel current transaction
                          if (currentTransactionCode) {
                            deleteExpiredTransaction(currentTransactionCode);
                          }

                          // Clear timer
                          if (paymentTimerRef.current) {
                            clearInterval(paymentTimerRef.current);
                            paymentTimerRef.current = null;
                          }

                          setShowQRCode(false);
                          setSelectedPackage(null);
                          setCurrentTransactionCode(null);
                          setPaymentTimeLeft(0);
                          setIsPaymentCompleted(false);
                        }}
                        className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                      >
                        🔄 Chọn Gói Khác
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Modal */}
        {showModal && selectedPackage && (
          <PaymentModal
            isOpen={showModal}
            onClose={handleModalClose}
            onComplete={handlePaymentComplete}
            selectedPackage={selectedPackage}
            qrCodeUrl={qrCodeUrl}
            timeLeft={paymentTimeLeft}
          />
        )}

        <ScrollToTop />
      </div>
    </AuthGuard>
  );
}
