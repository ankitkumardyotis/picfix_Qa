
import Razorpay from "razorpay"
import { v4 as uuid } from "uuid";


const instance = new Razorpay({
    key_id: process.env.RAZORPAY_TEST_KEY_ID,
    key_secret: process.env.RAZORPAY_TEST_KEY_SECRET,
});
export default async function handler(req, res) {
    let { amount } = req.body;


    const options = {
        amount: amount.toString() * 100,
        currency: "INR",
        receipt: uuid(),
    };
    const order = await instance.orders.create(options);
    return res.status(200).json({ order: order });
}













