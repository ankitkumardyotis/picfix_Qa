import prisma from "@/lib/prisma";
import { encryptRazorpayPayment } from "@/utils/encryptAlgoForRazorpay";
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import Razorpay from "razorpay"
import { v4 as uuid } from "uuid";
import { priceStructure } from "@/constant/Constant";


const instance = new Razorpay({
    key_id: process.env.RAZORPAY_TEST_KEY_ID,
    key_secret: process.env.RAZORPAY_TEST_KEY_SECRET,
});

export default async function handler(req, res) {

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const session = await getServerSession(req, res, authOptions)

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const isAuthentic = encryptRazorpayPayment(body, razorpay_signature);

    if (isAuthentic) {
        // const order = await instance.orders.fetch(razorpay_order_id);
        const order = await instance.orders.fetchPayments(razorpay_order_id);
        const currentDate = new Date();
        // add payment to database 
        const latestPayment = order.items[order.items.length - 1]; // ✅ get latest (last) payment

        const [planDetails] = priceStructure.filter(
            (item) => item.currency === latestPayment.currency && item.price == (latestPayment.amount / 100)
        );

        await prisma.PaymentHistory.create({
            data: {
                transactionId: razorpay_payment_id,
                orderId: razorpay_order_id,
                userId: session.user.id,
                userName: session.user.name,
                emailId: latestPayment.email,
                contact: latestPayment.contact,
                planName: planDetails.name,
                creditPoints: parseInt(planDetails.creditPoints),
                createdAt: currentDate,
                amount: latestPayment.amount / 100,
                currency: latestPayment.currency,//to be added with actual plan         
                paymentStatus: latestPayment.status,
            }
        })

        const expiryDate = new Date(currentDate);
        expiryDate.setFullYear(currentDate.getFullYear() + 1);
        // Convert expiry date to ISO string format
        const expiryISOString = expiryDate.toISOString();


        await prisma.Plan.upsert({
            where: {
                userId: session.user.id // Assuming userId is unique and identifies the user uniquely
            },
            update: {
                userName: session.user.name,
                emailId: session.user.email,
                planName: planDetails.name,  //to be added with actual plan
                creditPoints: {
                    increment: parseInt(planDetails.creditPoints)
                },
                remainingPoints: {
                    increment: parseInt(planDetails.creditPoints)
                },
                createdAt: currentDate,
                expiredAt: expiryISOString,
            },
            create: {
                userId: session.user.id,
                userName: session.user.name,
                emailId: session.user.email,
                planName: planDetails.name,  //to be added with actual plan
                creditPoints: parseInt(planDetails.creditPoints), //to be added with actual plan        
                remainingPoints: parseInt(planDetails.creditPoints), //to be added with actual plan    
                createdAt: currentDate,
                expiredAt: expiryISOString,
            }
        });


        // Add Payment Details to Database after succefull Payment 
        res.redirect(302,
            `${process.env.NEXTAUTH_URL}/paymentSuccess?transactionId=${order.items[0].id}&amount=${order.items[0].amount}&paymentMethod=${order.items[0].method}&currency=${order.items[0].currency}&status=${'success'}&email=${order.items[0].email}`
        );

    } else {
        res.status(400).json({
            success: false,
        });
    }
};