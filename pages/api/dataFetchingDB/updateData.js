import prisma from '@/lib/prisma';
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    const { userId } = req.query;

    try {
        const plan = await prisma.plan.findFirst({
            where: {
                userId: userId,
            }
        });
        const saveCreditPoint = await prisma.plan.update({
            where: {
                id: plan.id,
                userId: userId,
            },
            data: {
                remainingPoints: {
                    decrement: 1
                }
            },
        })
        res.status(200).json({ saveCreditPoint });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
