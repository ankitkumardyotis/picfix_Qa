import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getUsageStatus } from "@/lib/dailyUsage";
import { getUserPlan } from "@/lib/userData";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: 'Please login to access this feature.' });
    }

    // Check if user has a plan - daily usage only applies to users without plans
    const planData = await getUserPlan(session.user.id);
    const hasPlan = planData && planData.length > 0 && planData[0];

    if (hasPlan) {
      return res.status(200).json({
        message: 'Daily usage tracking is not applicable for users with plans. You have unlimited access through your plan.',
        hasPlan: true,
        planName: planData[0].planName,
        remainingPoints: planData[0].remainingPoints
      });
    }

    const usageStatus = await getUsageStatus(session.user.email);

    if (!usageStatus) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      usageCount: usageStatus.usageCount,
      dailyLimit: usageStatus.dailyLimit,
      remainingCredits: usageStatus.remainingCredits,
      resetAt: usageStatus.resetAt,
      lastUsed: usageStatus.lastUsed,
      canUseService: usageStatus.canUseService,
      resetTimeFormatted: usageStatus.resetAt ? new Date(usageStatus.resetAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      }) : null,
      hasPlan: false
    });

  } catch (error) {
    console.error('Error fetching daily usage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
