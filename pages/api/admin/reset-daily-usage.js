import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { resetDailyUsage } from "@/lib/dailyUsage";
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: 'Please login to access this feature.' });
    }

    // Check if user is admin or super_admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    const result = await resetDailyUsage();

    res.status(200).json({
      success: true,
      message: result.message,
      resetCount: result.resetCount
    });

  } catch (error) {
    console.error('Error resetting daily usage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
