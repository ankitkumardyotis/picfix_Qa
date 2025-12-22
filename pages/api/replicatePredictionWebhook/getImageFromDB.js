import prisma from '@/lib/prisma';

export default async function handler(req, res) {

    const { replicateId } = req.query;

    try {
        const webhookData = await prisma.WebhookEvent.findFirst({
            where: {
                replicateId: replicateId,
            }
        });
        if (!webhookData) {
            res.status(400).json("No Data Found")
            return
        } else {
            res.status(200).json({ webhookData });
        }
    } catch (error) {
        console.error('Error fetching plan:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
