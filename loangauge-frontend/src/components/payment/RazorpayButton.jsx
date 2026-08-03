import toast from 'react-hot-toast';
import { useCreateRazorpayOrderMutation, useVerifyRazorpayPaymentMutation } from '../../services/notificationService';

export default function RazorpayButton({ amount = 49900 }) {
  const [createOrder] = useCreateRazorpayOrderMutation();
  const [verifyPayment] = useVerifyRazorpayPaymentMutation();

  const handleUpgrade = async () => {
    try {
      const orderResponse = await createOrder(amount).unwrap();
      const order = orderResponse.data; // ApiResponse envelope

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: 'LoanGauge Premium',
        description: 'One-time Premium upgrade',
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }).unwrap();
            toast.success('Upgraded to Premium!');
          } catch {
            toast.error('Payment verification failed');
          }
        },
        theme: { color: '#4f46e5' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      toast.error('Could not start payment. Try again.');
    }
  };

  return (
    <button onClick={handleUpgrade} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium">
      Upgrade to Premium
    </button>
  );
}