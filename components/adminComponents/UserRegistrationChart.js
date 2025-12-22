import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { CalendarToday, TrendingUp, People, DateRange } from '@mui/icons-material';

const UserRegistrationChart = () => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState('1month');
    const [totalUsers, setTotalUsers] = useState(0);

    useEffect(() => {
        fetchUserRegistrationData();
    }, [dateRange]);

    const fetchUserRegistrationData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/user-registrations?dateRange=${dateRange}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user registration data');
            }
            const data = await response.json();
            setChartData(data.registrationData || []);
            setTotalUsers(data.totalUsers || 0);
        } catch (error) {
            console.error('Error fetching user registration data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const dateRangeOptions = [
        { value: '1month', label: 'Last Month' },
        { value: '3months', label: 'Last 3 Months' },
        { value: '6months', label: 'Last 6 Months' },
        { value: '12months', label: 'Last Year' },
        { value: 'all', label: 'All Time' }
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'white',
                    border: '1px solid rgba(58, 28, 113, 0.2)',
                    borderRadius: '8px',
                    padding: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    <p style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#000',
                        margin: '0 0 0.5rem 0'
                    }}>
                        {label}
                    </p>
                    <p style={{
                        fontSize: '0.875rem',
                        color: '#3a1c71',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <People sx={{ fontSize: '1rem' }} />
                        {`${payload[0].value} new users`}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(58, 28, 113, 0.1)',
                textAlign: 'center',
                minHeight: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    fontSize: '1.125rem',
                    color: '#6b7280',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    Loading user registration data...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(58, 28, 113, 0.1)',
                textAlign: 'center',
                minHeight: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    fontSize: '1.125rem',
                    color: '#ef4444',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    Error loading chart: {error}
                </div>
            </div>
        );
    }

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(58, 28, 113, 0.1)',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '1.5rem 2rem',
                borderBottom: '1px solid rgba(58, 28, 113, 0.1)',
                background: 'linear-gradient(135deg, rgba(58, 28, 113, 0.05) 0%, rgba(215, 109, 119, 0.05) 50%, rgba(255, 175, 123, 0.05) 100%)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                }}>
                    <div>
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#000',
                            margin: 0,
                            fontFamily: 'Roboto, sans-serif',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <TrendingUp sx={{ color: '#3a1c71' }} />
                            User Registration Analytics
                        </h3>
                        <p style={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            margin: 0,
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            Track user registrations over time
                        </p>
                    </div>
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            background: '#3a1c71',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            fontFamily: 'Roboto, sans-serif',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <People sx={{ fontSize: '1rem' }} />
                            Total: {totalUsers} users
                        </div>
                    </div>
                </div>

                {/* Date Range Filter */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        fontFamily: 'Roboto, sans-serif'
                    }}>
                        <DateRange sx={{ fontSize: '1rem' }} />
                        Time Range:
                    </div>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        style={{
                            padding: '0.5rem 1rem',
                            border: '1px solid rgba(58, 28, 113, 0.2)',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontFamily: 'Roboto, sans-serif',
                            outline: 'none',
                            background: 'white',
                            cursor: 'pointer',
                            transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#3a1c71';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(58, 28, 113, 0.2)';
                        }}
                    >
                        {dateRangeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Chart */}
            <div style={{ padding: '2rem' }}>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3a1c71" stopOpacity={0.8}/>
                                    <stop offset="50%" stopColor="#d76d77" stopOpacity={0.6}/>
                                    <stop offset="95%" stopColor="#ffaf7b" stopOpacity={0.2}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(58, 28, 113, 0.1)" />
                            <XAxis 
                                dataKey="date" 
                                stroke="#6b7280"
                                fontSize={12}
                                fontFamily="Roboto, sans-serif"
                            />
                            <YAxis 
                                stroke="#6b7280"
                                fontSize={12}
                                fontFamily="Roboto, sans-serif"
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                                wrapperStyle={{
                                    fontFamily: 'Roboto, sans-serif',
                                    fontSize: '0.875rem'
                                }}
                            />
                            <Area 
                                type="monotone"
                                dataKey="users" 
                                name="New Users"
                                stroke="#3a1c71"
                                strokeWidth={3}
                                fill="url(#colorGradient)"
                                dot={{ fill: '#3a1c71', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: '#3a1c71', strokeWidth: 2, fill: '#fff' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        color: '#6b7280',
                        fontFamily: 'Roboto, sans-serif'
                    }}>
                        <CalendarToday sx={{ fontSize: '3rem', marginBottom: '1rem', color: '#d1d5db' }} />
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem' }}>No Data Available</h4>
                        <p style={{ margin: 0, fontSize: '0.875rem' }}>
                            No user registration data found for the selected time period.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserRegistrationChart;
