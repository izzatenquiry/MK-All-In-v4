import React, { useEffect, useState } from 'react';
import { handlePaymentReturn, getOrderData, clearOrderData, type PaymentReturnData } from '../../../services/toyyibPayService';
import { registerTokenUltra } from '../../../services/userService';
import { CheckCircleIcon, AlertTriangleIcon } from '../../Icons';
import Spinner from '../../common/Spinner';

interface PaymentReturnHandlerProps {
  currentUser: any;
  onUserUpdate?: (user: any) => void;
  onNavigateToSettings?: () => void;
}

const PaymentReturnHandler: React.FC<PaymentReturnHandlerProps> = ({ 
  currentUser, 
  onUserUpdate,
  onNavigateToSettings 
}) => {
  const [status, setStatus] = useState<'checking' | 'success' | 'failed' | 'pending'>('checking');
  const [message, setMessage] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const processPaymentReturn = async () => {
      console.log('[PaymentReturn] Processing payment return...');
      console.log('[PaymentReturn] URL:', window.location.href);
      console.log('[PaymentReturn] Query params:', window.location.search);
      
      // Get payment return data from URL
      const paymentData = handlePaymentReturn();
      console.log('[PaymentReturn] Payment data:', paymentData);
      
      if (!paymentData) {
        console.warn('[PaymentReturn] No payment data found - not a payment return page');
        // Not a payment return page, redirect to home
        if (onNavigateToSettings) {
          onNavigateToSettings();
        } else {
          window.location.href = '/';
        }
        return;
      }

      // Get saved order data
      const orderData = getOrderData();
      console.log('[PaymentReturn] Order data:', orderData);
      
      if (!orderData) {
        console.error('[PaymentReturn] Order data not found in sessionStorage');
        setStatus('failed');
        setMessage('Order data not found. Please contact support.');
        return;
      }

      // Get user ID from order data, localStorage, sessionStorage, or currentUser
      const userId = orderData.userId 
        || localStorage.getItem('toyyibpay_user_id') 
        || sessionStorage.getItem('toyyibpay_user_id') 
        || currentUser?.id;
      
      console.log('[PaymentReturn] User ID:', userId);
      
      if (!userId) {
        console.error('[PaymentReturn] User ID not found');
        setStatus('failed');
        setMessage('User information not found. Please contact support.');
        return;
      }

      // Check payment status
      // status: '1' = success, '2' = failed, '3' = pending
      console.log('[PaymentReturn] Payment status:', paymentData.status);
      
      if (paymentData.status === '1') {
        // Payment successful - auto register
        setStatus('success');
        setMessage('Payment successful! Registering your account...');
        
        setIsRegistering(true);
        try {
          console.log('[PaymentReturn] Calling registerTokenUltra for user:', userId);
          // Call registerTokenUltra (no telegramId needed)
          const result = await registerTokenUltra(userId);
          console.log('[PaymentReturn] Registration result:', result);

          if (result.success) {
            console.log('[PaymentReturn] Registration successful!');
            setMessage('Payment successful! Your Token Ultra registration is complete.');
            // Clear order data
            clearOrderData();
            localStorage.removeItem('toyyibpay_user_id');
            sessionStorage.removeItem('toyyibpay_user_id');
            
            // Update user if callback provided
            if (onUserUpdate && result.user) {
              onUserUpdate(result.user);
            }
            
            // Invalidate cache
            sessionStorage.removeItem(`token_ultra_active_${userId}`);
            sessionStorage.removeItem(`token_ultra_active_timestamp_${userId}`);
            
            // Redirect to settings after 3 seconds
            setTimeout(() => {
              if (onNavigateToSettings) {
                onNavigateToSettings();
              } else {
                window.location.href = '/settings';
              }
            }, 3000);
          } else {
            console.error('[PaymentReturn] Registration failed:', result.message);
            setStatus('failed');
            setMessage(`Payment successful but registration failed: ${result.message}. Please contact support.`);
          }
        } catch (error) {
          console.error('[PaymentReturn] Registration error:', error);
          setStatus('failed');
          setMessage(`Payment successful but registration failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please contact support.`);
        } finally {
          setIsRegistering(false);
        }
      } else if (paymentData.status === '2') {
        setStatus('failed');
        setMessage('Payment failed. Please try again.');
      } else if (paymentData.status === '3') {
        setStatus('pending');
        setMessage('Payment is pending. Please wait for confirmation.');
      }
    };

    processPaymentReturn();
  }, [currentUser, onUserUpdate, onNavigateToSettings]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50 dark:bg-neutral-900">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-8 max-w-md w-full">
        {status === 'checking' && (
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">Processing payment...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              Payment Successful!
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">{message}</p>
            {isRegistering && (
              <div className="flex items-center justify-center gap-2">
                <Spinner />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Registering...</span>
              </div>
            )}
            {!isRegistering && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">
                Redirecting to settings...
              </p>
            )}
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center">
            <AlertTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              Payment Failed
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">{message}</p>
            <button
              onClick={() => {
                if (onNavigateToSettings) {
                  onNavigateToSettings();
                } else {
                  window.location.href = '/settings';
                }
              }}
              className="w-full bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Back to Settings
            </button>
          </div>
        )}

        {status === 'pending' && (
          <div className="text-center">
            <Spinner />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2 mt-4">
              Payment Pending
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">{message}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Please wait for payment confirmation. You will be notified once payment is confirmed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentReturnHandler;
