// pages/api/getPlan.js

import prisma from '@/lib/prisma';
// import prisma from "@/pages/api/_lib/prisma";

export default async function handler(req, res) {
    const { model, status, createdAt, replicateId, userId } = req.body

    try {
        const history = await prisma.history.create({

            data: {
                userId: userId,
                model: model,
                status: status,
                createdAt: createdAt,
                replicateId: replicateId
            }
        }).catch(err => {
            console.error('Error creating Plan:', err);
        });
        res.status(200).json({ history });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
