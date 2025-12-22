import React, { useState, useEffect } from 'react';
import { FaImage, FaLightbulb, FaMoneyBill, FaUser } from 'react-icons/fa';

const AdminStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/stats');
            if (!response.ok) {
                throw new Error('Failed to fetch stats');
            }
            const data = await response.json();
            setStats(data.stats);
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
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
                marginBottom: '2rem'
            }}>
                <div style={{
                    fontSize: '1.125rem',
                    color: '#6b7280',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    Loading statistics...
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
                marginBottom: '2rem'
            }}>
                <div style={{
                    fontSize: '1.125rem',
                    color: '#ef4444',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    Error loading statistics: {error}
                </div>
            </div>
        );
    }

    if (!stats) return null;

    const statsCards = [
        {
            title: "Total Users",
            value: stats.totalUsers.value.toLocaleString(),
            change: `${stats.totalUsers.change}%`,
            changeType: stats.totalUsers.changeType,
            icon: <FaUser />,
            gradient: "linear-gradient(135deg, #3a1c71 0%, #d76d77 50%)"
        },
        {
            title: "Active Users",
            value: stats.activeUsers.value.toLocaleString(),
            change: `${stats.activeUsers.change}%`,
            changeType: stats.activeUsers.changeType,
            icon: <FaUser />,
            gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
        },
        {
            title: "Total Revenue",
            value: `$${stats.totalRevenue.value.toLocaleString()}`,
            change: `${stats.totalRevenue.change}%`,
            changeType: stats.totalRevenue.changeType,
            icon: <FaMoneyBill />,
            gradient: "linear-gradient(135deg, #d76d77 0%, #ffaf7b 100%)"
        },
        {
            title: "Images Processed",
            value: stats.totalImages.value.toLocaleString(),
            change: `${stats.totalImages.change}%`,
            changeType: stats.totalImages.changeType,
            icon: <FaImage />,
            gradient: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)"
        },
        {
            title: "Today's Images",
            value: stats.todayImages.value.toLocaleString(),
            change: `${stats.todayImages.change}%`,
            changeType: stats.todayImages.changeType,
            icon: <FaLightbulb />,
            gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
        }
    ];
    return (
        <div style={{
            marginBottom: '2rem'
        }}>
            <div style={{
                marginBottom: '1.5rem'
            }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#000',
                    marginBottom: '0.5rem',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    Dashboard Overview
                </h2>
                <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    Key metrics and performance indicators
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem'
            }}>
                {statsCards.map((card, index) => (
                    <div
                        key={index}
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            border: '1px solid rgba(58, 28, 113, 0.1)',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 10px -3px rgba(0, 0, 0, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: card.gradient
                        }}></div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '1rem'
                        }}>
                            <div>
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: '#6b7280',
                                    fontWeight: '500',
                                    marginBottom: '0.5rem',
                                    fontFamily: 'Roboto, sans-serif'
                                }}>
                                    {card.title}
                                </p>
                                <h3 style={{
                                    fontSize: '2rem',
                                    fontWeight: '700',
                                    color: '#000',
                                    margin: 0,
                                    fontFamily: 'Roboto, sans-serif'
                                }}>
                                    {card.value}
                                </h3>
                            </div>
                            <div style={{
                                fontSize: '1.5rem',
                                background: card.gradient,
                                borderRadius: '12px',
                                width: '48px',
                                height: '48px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {card.icon}
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <span style={{
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: card.changeType === 'positive' ? '#10b981' : '#ef4444',
                                fontFamily: 'Roboto, sans-serif'
                            }}>
                                {card.change}
                            </span>
                            <span style={{
                                fontSize: '0.75rem',
                                color: '#6b7280',
                                fontFamily: 'Roboto, sans-serif'
                            }}>
                                {card.title === "Today's Images" ? '' : 'vs last month'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminStats;
