// Daily Usage Management Utility
import prisma from './prisma';

/**
 * Get the next midnight UTC timestamp
 * @returns {Date} Next midnight UTC
 */
function getNextMidnightUTC() {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setUTCHours(24, 0, 0, 0); // Set to next midnight UTC
  return nextMidnight;
}

/**
 * Get or create today's daily usage record for a user
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {number} dailyLimit - Daily credit limit (default: 5)
 * @returns {Object} Daily usage record
 */
export async function getTodayUsage(userId, email, dailyLimit = 5) {
  try {
    const now = new Date();
    const nextMidnight = getNextMidnightUTC();

    // Try to find existing record for today
    let dailyUsage = await prisma.dailyUsage.findFirst({
      where: {
        userId: userId,
        resetAt: {
          gt: now, // resetAt should be in the future (today's record)
        }
      }
    });

    // If no record exists for today, create one
    if (!dailyUsage) {
      dailyUsage = await prisma.dailyUsage.create({
        data: {
          userId: userId,
          email: email,
          usageCount: 0,
          dailyLimit: dailyLimit,
          resetAt: nextMidnight,
          lastUsed: null
        }
      });
    }

    return dailyUsage;
  } catch (error) {
    console.error('Error getting today usage:', error);
    throw error;
  }
}

/**
 * Check if user can use the service based on daily limits
 * @param {string} email - User email
 * @param {number} requiredCredits - Credits required for the operation
 * @returns {Object} { canUse: boolean, usage: Object, message: string }
 */
export async function canUseService(email, requiredCredits = 1) {
  try {
    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      return {
        canUse: false,
        usage: null,
        message: 'User not found'
      };
    }

    // Get today's usage record
    const dailyUsage = await getTodayUsage(user.id, email);

    // Check if user has exceeded daily limit
    if (dailyUsage.usageCount >= dailyUsage.dailyLimit) {
      return {
        canUse: false,
        usage: dailyUsage,
        message: `Daily limit exceeded. ${dailyUsage.usageCount}/${dailyUsage.dailyLimit} credits used today. Resets at ${dailyUsage.resetAt.toISOString()}`
      };
    }

    // Check if user has enough credits for this operation
    if (dailyUsage.usageCount + requiredCredits > dailyUsage.dailyLimit) {
      return {
        canUse: false,
        usage: dailyUsage,
        message: `Not enough daily credits. Need ${requiredCredits} credits, but only ${dailyUsage.dailyLimit - dailyUsage.usageCount} remaining today.`
      };
    }

    return {
      canUse: true,
      usage: dailyUsage,
      message: 'Service available'
    };
  } catch (error) {
    console.error('Error checking service usage:', error);
    return {
      canUse: false,
      usage: null,
      message: 'Error checking usage limits'
    };
  }
}

/**
 * Increment usage count for today's record
 * @param {string} email - User email
 * @param {number} creditsUsed - Number of credits used
 * @returns {Object} Updated usage record
 */
export async function incrementUsage(email, creditsUsed = 1) {
  try {
    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get today's usage record
    const dailyUsage = await getTodayUsage(user.id, email);

    // Increment usage count
    const updatedUsage = await prisma.dailyUsage.update({
      where: { id: dailyUsage.id },
      data: {
        usageCount: {
          increment: creditsUsed
        },
        lastUsed: new Date()
      }
    });

    return updatedUsage;
  } catch (error) {
    console.error('Error incrementing usage:', error);
    throw error;
  }
}

/**
 * Get user's current daily usage status
 * @param {string} email - User email
 * @returns {Object} Usage status
 */
export async function getUsageStatus(email) {
  try {
    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      return null;
    }

    // Get today's usage record
    const dailyUsage = await getTodayUsage(user.id, email);

    return {
      usageCount: dailyUsage.usageCount,
      dailyLimit: dailyUsage.dailyLimit,
      remainingCredits: dailyUsage.dailyLimit - dailyUsage.usageCount,
      resetAt: dailyUsage.resetAt,
      lastUsed: dailyUsage.lastUsed,
      canUseService: dailyUsage.usageCount < dailyUsage.dailyLimit
    };
  } catch (error) {
    console.error('Error getting usage status:', error);
    return null;
  }
}

/**
 * Reset daily usage for all users (can be called by a cron job)
 * This function creates new records for users who have records from yesterday
 */
export async function resetDailyUsage() {
  try {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // Find all expired daily usage records (resetAt is in the past)
    const expiredRecords = await prisma.dailyUsage.findMany({
      where: {
        resetAt: {
          lt: now
        }
      }
    });

    // Create new records for today for each expired record
    const newRecords = [];
    for (const record of expiredRecords) {
      const nextMidnight = getNextMidnightUTC();
      const newRecord = await prisma.dailyUsage.create({
        data: {
          userId: record.userId,
          email: record.email,
          usageCount: 0,
          dailyLimit: record.dailyLimit, // Keep same daily limit
          resetAt: nextMidnight,
          lastUsed: null
        }
      });
      newRecords.push(newRecord);
    }

    // Clean up old records (older than 7 days)
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    await prisma.dailyUsage.deleteMany({
      where: {
        resetAt: {
          lt: weekAgo
        }
      }
    });

    return {
      resetCount: newRecords.length,
      message: `Reset daily usage for ${newRecords.length} users`
    };
  } catch (error) {
    console.error('Error resetting daily usage:', error);
    throw error;
  }
}
