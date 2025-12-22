import react from 'react';
import axios from 'axios'
import logo from '../public/assets/logo.jpg'
import { useSession } from 'next-auth/react';

function demoPage() {
    const { data: session, status } = useSession();
    const checkoutHandler = async (amount) => {
        const result = await axios.get("api/razorpayPayment/createCheckout")
    

        const options = {
            key: process.env.RAZORPAY_TEST_KEY_ID,
            amount: result.data.order.amount,
            name: session.user.name,
            currency: "INR",
            image: 'https://www.picfix.ai/favicon.ico',
            order_id: result.data.order.id,
            callback_url: "api/razorpayPayment/verifyPayment",
            prefill: {
                name: session.user.name,
                email: session.user.email,
            },
            theme: {
                "color": "#b2b2ff"
            }
        };
        const razor = new window.Razorpay(options);
        razor.open();
    }
    return (<div className="" style={{ minHeight: '70vh', margin: '5rem' }} >
        <button
            // className={cn(buttonVariants({ size: "lg" }))}
            // disabled={isLoading}
            onClick={checkoutHandler}
        >
            Pay Now
        </button>
    </div >)
}
export default demoPage;