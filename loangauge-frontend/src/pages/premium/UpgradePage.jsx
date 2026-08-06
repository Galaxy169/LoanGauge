import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Check, X, Star, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToastContext } from '@/context/ToastContext';
import { updateUser, setCredentials } from '@/store/authSlice';
import { useCreateOrderMutation, useVerifyPaymentMutation } from '@/services/paymentApi';
import { useRefreshTokenMutation } from '@/services/authApi';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getErrorMessage } from '@/utils/helpers';
import { RAZORPAY_KEY_ID } from '@/utils/runtimeConfig';

export default function UpgradePage() {
  const { user, isPremium } = useAuth();
  const dispatch = useDispatch();
  const toast = useToastContext();
  const navigate = useNavigate();
  
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [verifyPayment, { isLoading: isVerifyingPayment }] = useVerifyPaymentMutation();
  const [refreshTokenApi] = useRefreshTokenMutation();

  const isLoading = isCreatingOrder || isVerifyingPayment;

  const handleUpgrade = async () => {
    try {
      const order = await createOrder({ amount: 99900 }).unwrap();

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount || 99900,
        currency: order.currency || 'INR',
        name: 'LoanGauge',
        description: 'Premium Membership Upgrade',
        order_id: order.id,
        prefill: {
          name: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#2158e0'
        },
        handler: async (response) => {
          try {
            // API returns { data: true|false } — only treat this as a
            // successful upgrade if the server actually confirms it.
            const verified = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              userId: user?.id
            }).unwrap();

            if (verified) {
              // The old accessToken still carries the pre-upgrade role claim
              // (JWTs are self-contained and can't be patched client-side).
              // Mint a fresh token now that the backend has actually persisted
              // PREMIUM_USER, otherwise every subsequent premium-only call
              // (e.g. requesting an advisor consultation) will 403 even
              // though the UI shows the user as upgraded.
              try {
                const refreshResponse = await refreshTokenApi().unwrap();
                const authData = refreshResponse.data || refreshResponse;
                if (authData?.accessToken && authData?.user) {
                  dispatch(setCredentials({ user: authData.user, accessToken: authData.accessToken }));
                } else {
                  dispatch(updateUser({ role: 'PREMIUM_USER', subscriptionPlan: 'PREMIUM' }));
                }
              } catch {
                // Refresh failed — fall back to a local patch so the UI is
                // consistent, but the user may need to log out/in again
                // before premium-only endpoints will authorize correctly.
                dispatch(updateUser({ role: 'PREMIUM_USER', subscriptionPlan: 'PREMIUM' }));
              }
              toast.success('Successfully upgraded to LoanGauge Premium!');
              navigate('/dashboard');
            } else {
              toast.error('Payment could not be verified. Please contact support before retrying.');
            }
          } catch (err) {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
      };
      
      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          toast.error('Payment failed: ' + (response.error?.description || 'Transaction declined'));
        });
        rzp.open();
      } else {
        dispatch(updateUser({ role: 'PREMIUM_USER', subscriptionPlan: 'PREMIUM' }));
        toast.success('Upgraded to Premium (Demo Environment)!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isPremium) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center font-sans text-text-primary">
        <Card className="p-8 border-border bg-white rounded space-y-4">
          <div className="w-12 h-12 rounded-full bg-surface-hover border border-border flex items-center justify-center text-text-primary mx-auto">
            <Star className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">You are on LoanGauge Premium!</h1>
          <p className="text-text-secondary text-sm max-w-lg mx-auto">
            Thank you for being a premium member. You have unlimited assessment calibrations, advisor consultation requests, and full comparison analytics enabled.
          </p>
          <Button onClick={() => navigate('/dashboard')} variant="primary" size="lg" rightIcon={ArrowRight}>
            Go to Executive Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8 font-sans text-text-primary">
      <div className="text-center space-y-2">
        <Badge variant="default">Membership Tiers</Badge>
        <h1 className="text-3xl font-bold text-text-primary">
          Unlock LoanGauge Premium
        </h1>
        <p className="text-text-secondary text-sm max-w-2xl mx-auto">
          Get unlimited calibrations, priority financial advisor reviews, and advanced assessment comparison trends.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-stretch max-w-4xl mx-auto">
        {/* Basic Free Plan */}
        <Card className="p-6 border-border bg-white rounded flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <Badge variant="default">Basic Tier</Badge>
            <h3 className="text-xl font-bold text-text-primary">Free Access</h3>
            <p className="text-text-secondary text-xs">Essential loan readiness checks for individual borrowers</p>
            <div className="text-3xl font-bold text-text-primary">₹0</div>

            <ul className="space-y-2 pt-3 border-t border-border text-xs text-text-secondary">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-text-primary shrink-0" />
                <span>3 Assessment Calibrations Total</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-text-primary shrink-0" />
                <span>Standard Financial Profile</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-text-primary shrink-0" />
                <span>Goal Progress Tracking</span>
              </li>
              <li className="flex items-center gap-2 opacity-40">
                <X className="w-4 h-4 text-text-muted shrink-0" />
                <span>1-on-1 Advisor Consultations</span>
              </li>
              <li className="flex items-center gap-2 opacity-40">
                <X className="w-4 h-4 text-text-muted shrink-0" />
                <span>Side-by-Side Comparison Trends</span>
              </li>
            </ul>
          </div>

          <Button variant="outline" fullWidth disabled>
            Current Active Plan
          </Button>
        </Card>

        {/* Premium Plan Card */}
        <Card className="p-6 border-2 border-primary-600 bg-white rounded flex flex-col justify-between space-y-4 relative">
          <div className="absolute top-0 right-0 bg-primary-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl">
            RECOMMENDED
          </div>

          <div className="space-y-3">
            <Badge variant="default">Unlimited Access</Badge>
            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <span>Premium Tier</span>
              <Star className="w-4 h-4" />
            </h3>
            <p className="text-text-secondary text-xs">For active borrowers preparing major loan applications</p>
            
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-text-primary">₹999</span>
              <span className="text-xs text-text-muted">/ Annual Membership</span>
            </div>

            <ul className="space-y-2 pt-3 border-t border-border text-xs text-text-primary">
              <li className="flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4 text-text-primary shrink-0" />
                <span>Unlimited Loan Assessments</span>
              </li>
              <li className="flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4 text-text-primary shrink-0" />
                <span>1-on-1 Certified Advisor Reviews</span>
              </li>
              <li className="flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4 text-text-primary shrink-0" />
                <span>Side-by-Side Comparison Charts</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-text-primary shrink-0" />
                <span>AI Actionable Improvement Steps</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-text-primary shrink-0" />
                <span>Priority Advisory Support</span>
              </li>
            </ul>
          </div>

          <Button 
            variant="primary" 
            fullWidth 
            size="lg"
            onClick={handleUpgrade}
            isLoading={isLoading}
            rightIcon={Zap}
          >
            Upgrade to Premium Now
          </Button>
        </Card>
      </div>
    </div>
  );
}

