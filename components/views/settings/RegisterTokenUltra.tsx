
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { type User, type TokenUltraRegistration } from '../../../types';
import { registerTokenUltra, saveUserRecaptchaToken, getTokenUltraRegistration, hasActiveTokenUltra } from '../../../services/userService';
import { createToyyibPayOrder, type OrderData } from '../../../services/toyyibPayService';
import { CheckCircleIcon, AlertTriangleIcon, TelegramIcon, XIcon, ClockIcon, KeyIcon, SparklesIcon, InformationCircleIcon } from '../../Icons';
import Spinner from '../../common/Spinner';

interface RegisterTokenUltraProps {
  currentUser: User;
  onUserUpdate?: (user: User) => void;
}

const RegisterTokenUltra: React.FC<RegisterTokenUltraProps> = ({ currentUser, onUserUpdate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  
  // Order form state - Get phone from currentUser
  const [orderFormData, setOrderFormData] = useState<OrderData>({
    name: currentUser.fullName || currentUser.username || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    amount: 21.50, // RM20.00 + RM1.50 ToyyibPay fee
    productName: 'Token Ultra - RM21.50',
  });
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage(null);

    try {
      // Call registerTokenUltra (no telegramId needed)
      const result = await registerTokenUltra(currentUser.id);

      if (result.success) {
        setSubmitStatus('success');
        if (onUserUpdate) {
          onUserUpdate(result.user);
        }
        // Invalidate cache
        sessionStorage.removeItem(`token_ultra_active_${currentUser.id}`);
        sessionStorage.removeItem(`token_ultra_active_timestamp_${currentUser.id}`);
        
        // Force refresh token ultra status cache
        await hasActiveTokenUltra(currentUser.id, true);
        // Show Telegram share modal
        setShowTelegramModal(true);
      } else {
        setSubmitStatus('error');
        // FIX: Cast to any to access 'message' property on union type where narrowing might fail.
        setErrorMessage((result as any).message || 'Failed to register. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for order form
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingOrder(true);
    setOrderError(null);

    try {
      const result = await createToyyibPayOrder(orderFormData);

      if (result.success && result.paymentUrl) {
        // Save user ID to both localStorage and sessionStorage for payment return handler
        // localStorage persists across tabs/windows, sessionStorage is tab-specific
        localStorage.setItem('toyyibpay_user_id', currentUser.id);
        sessionStorage.setItem('toyyibpay_user_id', currentUser.id);
        // Also update saved order data with userId
        // Check both sessionStorage and localStorage
        const savedData = sessionStorage.getItem('toyyibpay_order_data') || localStorage.getItem('toyyibpay_order_data');
        if (savedData) {
          try {
            const orderData = JSON.parse(savedData);
            orderData.userId = currentUser.id;
            // Save to both sessionStorage and localStorage
            sessionStorage.setItem('toyyibpay_order_data', JSON.stringify(orderData));
            localStorage.setItem('toyyibpay_order_data', JSON.stringify(orderData));
            console.log('[RegisterTokenUltra] Saved order data with userId:', currentUser.id);
          } catch (e) {
            console.error('Failed to update order data with userId:', e);
          }
        }
        console.log('[RegisterTokenUltra] Redirecting to payment URL:', result.paymentUrl);
        // Redirect to payment page
        window.location.href = result.paymentUrl;
      } else {
        setOrderError(result.message || 'Failed to create order. Please try again.');
      }
    } catch (err) {
      setOrderError('Network error. Please check your connection and try again.');
      console.error('Order creation error:', err);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Handler for order form field changes
  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'amount') {
      const numValue = parseFloat(value) || 0;
      setOrderFormData(prev => ({
        ...prev,
        amount: numValue,
        productName: `Token Ultra - RM${numValue.toFixed(2)}`,
      }));
    } else {
      setOrderFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Update orderFormData when currentUser changes (especially phone)
  useEffect(() => {
    setOrderFormData(prev => ({
      ...prev,
      name: currentUser.fullName || currentUser.username || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      // Keep existing amount value, don't reset it
    }));
  }, [currentUser]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Panel: Registration Form */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm p-6 h-full overflow-y-auto border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <KeyIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">Register Token Ultra</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Complete the form below and make a payment of RM21.50</p>
            </div>
          </div>

          {/* Payment Information Panel */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800">
            <h3 className="text-base sm:text-lg font-bold mb-4 text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-primary-500" />
              Payment Information
            </h3>
            
            <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-[0.5px] border-blue-200 dark:border-blue-800 mb-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] sm:text-xs text-blue-800 dark:text-blue-200">
                  <p className="text-[11px] sm:text-xs font-semibold mb-1">Payment Amount: RM{orderFormData.amount.toFixed(2)}</p>
                  <p className="text-[11px] sm:text-xs">Complete the form below to proceed to payment via ToyyibPay.</p>
                </div>
              </div>
            </div>
            
            {/* Order Form */}
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              {/* Name Field - Read-only */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={orderFormData.name}
                  disabled
                  readOnly
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
                />
              </div>

              {/* Email Field - Read-only */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={orderFormData.email}
                  disabled
                  readOnly
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
                />
              </div>

              {/* Phone Field - Read-only */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={orderFormData.phone}
                  disabled
                  readOnly
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
                />
              </div>

              {/* Amount Field - Editable */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Amount (RM)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={orderFormData.amount}
                  onChange={handleOrderChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400 italic">
                  Note: RM1.50 is ToyyibPay processing fee.
                </p>
              </div>

              {/* Error Message */}
              {orderError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 dark:text-red-200">{orderError}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isCreatingOrder}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 dark:bg-purple-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingOrder ? (
                  <>
                    <Spinner />
                    <span>Creating Order...</span>
                  </>
                ) : (
                  <span>Proceed to Payment</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel: Information */}
        <div className="flex flex-col gap-6">
          {/* Token Ultra Benefits Panel */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800">
            <h3 className="text-base sm:text-lg font-bold mb-4 text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-primary-500" />
              Token Ultra Benefits
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Unlimited Token Generation</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Generate tokens automatically without manual login</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Premium Features</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Access to advanced AI generation capabilities</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">30 Days Active</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Your subscription is valid for 30 days from registration</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Instructions Panel */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800">
            <h3 className="text-base sm:text-lg font-bold mb-4 text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
              <InformationCircleIcon className="w-5 h-5 text-primary-500" />
              Payment Instructions
            </h3>
            <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-[0.5px] border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-2 sm:gap-3">
                <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] sm:text-xs text-yellow-800 dark:text-yellow-200">
                  <p className="text-[11px] sm:text-xs font-semibold mb-1">Secure Payment via ToyyibPay</p>
                  <p className="text-[11px] sm:text-xs">After clicking "Proceed to Payment", you will be redirected to ToyyibPay to complete your payment. Once payment is successful, your Token Ultra registration will be activated automatically.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Telegram Share Modal */}
      {showTelegramModal && (
        <TelegramShareModal
          userName={currentUser.fullName || currentUser.username}
          userEmail={currentUser.email}
          userId={currentUser.id}
          onClose={() => setShowTelegramModal(false)}
          onUserUpdate={onUserUpdate}
        />
      )}
    </div>
  );
};

// Telegram Share Modal Component
interface TelegramShareModalProps {
  userName: string;
  userEmail: string;
  userId: string;
  onClose: () => void;
  onUserUpdate?: (user: User) => void;
}

const TelegramShareModal: React.FC<TelegramShareModalProps> = ({
  userName,
  userEmail,
  userId,
  onClose,
  onUserUpdate,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const message = `Token Ultra Registration

Name: ${userName}
Email: ${userEmail}

Please find payment proof attached.`;

  const telegramUrl = `https://t.me/monoklix_support?text=${encodeURIComponent(message)}`;

  const handleClose = () => {
    // Set message in sessionStorage before reload
    sessionStorage.setItem('token_ultra_ready_message', 'Akaun TOKEN ULTRA AI anda sudah siap. Terus Login untuk generate token.');
    // Reload page
    window.location.reload();
  };

  const handleOpenTelegram = async () => {
    // Update recaptcha token dengan default API key
    setIsUpdating(true);
    try {
      const defaultApiKey = '414f452fca8c16dedc687934823c7e97';
      const result = await saveUserRecaptchaToken(userId, defaultApiKey);
      
      if (result.success && onUserUpdate) {
        onUserUpdate(result.user);
      }
    } catch (error) {
      console.error('Failed to update recaptcha token:', error);
      // Continue anyway, don't block user from opening Telegram
    } finally {
      setIsUpdating(false);
    }

    // Open Telegram
    window.open(telegramUrl, '_blank', 'noopener,noreferrer');
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-zoomIn"
      aria-modal="true"
      role="dialog"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border-[0.5px] border-neutral-200/80 dark:border-neutral-800/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <TelegramIcon className="w-6 h-6 text-blue-500" />
            Share to Telegram
          </h3>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Share your registration details to <strong>@monoklix_support</strong> via Telegram. The message is pre-filled with your information.
          </p>

          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4 border-[0.5px] border-neutral-200/80 dark:border-neutral-700/80">
            <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Message Preview:
            </p>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap font-mono bg-white dark:bg-neutral-900 p-3 rounded border-[0.5px] border-neutral-200/80 dark:border-neutral-700/80">
              {message}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-[0.5px] border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <strong>Important:</strong> Please attach your payment proof image (barcode/receipt screenshot) when sending the message in Telegram.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleClose}
              className="flex-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-semibold py-2.5 px-4 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleOpenTelegram}
              disabled={isUpdating}
              className="flex-1 bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  <Spinner />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <TelegramIcon className="w-4 h-4" />
                  Open Telegram
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RegisterTokenUltra;
