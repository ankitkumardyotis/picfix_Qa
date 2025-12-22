import prisma from '@/lib/prisma';
import { withAdminAuth } from '@/lib/adminAuth';

async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // Get date range parameter from query
        const { dateRange = '6months' } = req.query;
        
        // Calculate date range based on parameter
        const getDateFromRange = (range) => {
            const now = new Date();
            switch (range) {
                case '1month':
                    const oneMonthAgo = new Date(now);
                    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                    return oneMonthAgo;
                case '3months':
                    const threeMonthsAgo = new Date(now);
                    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                    return threeMonthsAgo;
                case '6months':
                    const sixMonthsAgo = new Date(now);
                    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                    return sixMonthsAgo;
                case '12months':
                    const twelveMonthsAgo = new Date(now);
                    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
                    return twelveMonthsAgo;
                case 'all':
                    return new Date('2020-01-01'); // Far back date for all time
                default:
                    const defaultSixMonthsAgo = new Date(now);
                    defaultSixMonthsAgo.setMonth(defaultSixMonthsAgo.getMonth() - 6);
                    return defaultSixMonthsAgo;
            }
        };

        const startDate = getDateFromRange(dateRange);
        
        // Get all users within the date range
        const users = await prisma.user.findMany({
            where: {
                createdAt: { gte: startDate }
            },
            select: {
                createdAt: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        // Get total users count
        const totalUsers = await prisma.user.count();

        // Group users by date
        const registrationMap = new Map();
        
        users.forEach(user => {
            const dateKey = user.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD format
            const existing = registrationMap.get(dateKey) || 0;
            registrationMap.set(dateKey, existing + 1);
        });

        // Convert to array and format for chart
        const registrationData = [];
        
        // Generate date range based on the selected period
        const generateDateRange = (range) => {
            const dates = [];
            const now = new Date();
            
            switch (range) {
                case '1month':
                    for (let i = 30; i >= 0; i--) {
                        const date = new Date(now);
                        date.setDate(date.getDate() - i);
                        dates.push(date);
                    }
                    break;
                case '3months':
                    for (let i = 90; i >= 0; i -= 3) {
                        const date = new Date(now);
                        date.setDate(date.getDate() - i);
                        dates.push(date);
                    }
                    break;
                case '6months':
                    for (let i = 6; i >= 0; i--) {
                        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                        dates.push(date);
                    }
                    break;
                case '12months':
                    for (let i = 12; i >= 0; i--) {
                        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                        dates.push(date);
                    }
                    break;
                default:
                    // For 'all' or default, group by month
                    const earliestUser = users[0];
                    if (earliestUser) {
                        const startDate = new Date(earliestUser.createdAt);
                        const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
                        
                        while (currentDate <= now) {
                            dates.push(new Date(currentDate));
                            currentDate.setMonth(currentDate.getMonth() + 1);
                        }
                    }
                    break;
            }
            
            return dates;
        };

        const dateRange_array = generateDateRange(dateRange);
        
        // Format data based on date range
        if (dateRange === '1month') {
            // Daily data for last month
            dateRange_array.forEach(date => {
                const dateKey = date.toISOString().split('T')[0];
                const userCount = registrationMap.get(dateKey) || 0;
                
                registrationData.push({
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    users: userCount,
                    fullDate: dateKey
                });
            });
        } else if (dateRange === '3months') {
            // Weekly data for last 3 months
            for (let i = 0; i < dateRange_array.length - 1; i++) {
                const weekStart = dateRange_array[i];
                const weekEnd = dateRange_array[i + 1] || new Date();
                
                let weeklyCount = 0;
                for (const [dateKey, count] of registrationMap.entries()) {
                    const date = new Date(dateKey);
                    if (date >= weekStart && date < weekEnd) {
                        weeklyCount += count;
                    }
                }
                
                registrationData.push({
                    date: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    users: weeklyCount,
                    fullDate: weekStart.toISOString().split('T')[0]
                });
            }
        } else {
            // Monthly data for 6 months, 12 months, or all time
            dateRange_array.forEach(monthDate => {
                const monthKey = monthDate.toISOString().substring(0, 7); // YYYY-MM format
                const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                
                // Count users registered in this month
                let monthlyCount = 0;
                for (const [dateKey, count] of registrationMap.entries()) {
                    if (dateKey.startsWith(monthKey)) {
                        monthlyCount += count;
                    }
                }
                
                registrationData.push({
                    date: monthName,
                    users: monthlyCount,
                    fullDate: monthKey
                });
            });
        }

        // Sort by date
        registrationData.sort((a, b) => a.fullDate.localeCompare(b.fullDate));

        res.status(200).json({
            success: true,
            registrationData,
            totalUsers,
            dateRange,
            summary: {
                totalInPeriod: users.length,
                averagePerDay: dateRange === '1month' ? (users.length / 30).toFixed(1) : null,
                averagePerWeek: dateRange === '3months' ? (users.length / 12).toFixed(1) : null,
                averagePerMonth: ['6months', '12months', 'all'].includes(dateRange) ? (users.length / dateRange_array.length).toFixed(1) : null
            }
        });
    } catch (error) {
        console.error('Error fetching user registration data:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}

export default withAdminAuth(handler);
