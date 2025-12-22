import prisma from "@/lib/prisma";

export default async function handler(req, res) {
    const { userId } = req.query;
    const data = await prisma.PaymentHistory.findMany({
        where: {
            userId: userId,
        }
    })
    res.status(200).json({ data });
}