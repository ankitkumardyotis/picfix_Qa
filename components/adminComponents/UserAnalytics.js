import React, { useState, useEffect } from 'react';

const UserAnalytics = () => {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/analytics');
            if (!response.ok) {
                throw new Error('Failed to fetch analytics');
            }
            const data = await response.json();
            setAnalytics(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) {
        return (
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(58, 28, 113, 0.1)',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '1.125rem',
                    color: '#6b7280',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    Loading analytics...
                </div>
            </div>
        );
    }

    if (loading || !analytics) {
        return (
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(58, 28, 113, 0.1)',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '1.125rem',
                    color: '#6b7280',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    Loading analytics...
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
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '1.125rem',
                    color: '#ef4444',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    Error loading analytics: {error}
                </div>
            </div>
        );
    }

    // Use real analytics data with fallbacks
    const analyticsData = analytics || {};

    const SimpleChart = ({ data, type, height = 200 }) => {
        if (!data || data.length === 0) {
            return (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: height,
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    No data available
                </div>
            );
        }

        if (type === 'line') {
            const maxValue = Math.max(...data.map(d => Math.max(d.users || 0, d.activeUsers || 0)), 1);
            const chartWidth = 400;
            const chartHeight = height;
            const padding = 40;

            return (
                <div style={{ position: 'relative', width: '100%', height: height + 80 }}>
                    <svg width="100%" height={height + 80} viewBox={`0 0 ${chartWidth} ${chartHeight + 80}`}>
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map(percent => {
                            const y = padding + (chartHeight - 2 * padding) * (1 - percent / 100);
                            return (
                                <g key={percent}>
                                    <line
                                        x1={padding}
                                        y1={y}
                                        x2={chartWidth - padding}
                                        y2={y}
                                        stroke="#e5e7eb"
                                        strokeWidth="1"
                                    />
                                    <text
                                        x={padding - 10}
                                        y={y + 4}
                                        textAnchor="end"
                                        fontSize="10"
                                        fill="#6b7280"
                                    >
                                        {Math.round(maxValue * percent / 100)}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Data lines */}
                        {['users', 'activeUsers'].map((key, lineIndex) => {
                            const color = lineIndex === 0 ? '#3a1c71' : '#d76d77';
                            const points = data.map((d, i) => {
                                const x = padding + (chartWidth - 2 * padding) * i / (data.length - 1);
                                const y = padding + (chartHeight - 2 * padding) * (1 - d[key] / maxValue);
                                return `${x},${y}`;
                            }).join(' ');

                            return (
                                <g key={key}>
                                    <polyline
                                        points={points}
                                        fill="none"
                                        stroke={color}
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    {data.map((d, i) => {
                                        const x = padding + (chartWidth - 2 * padding) * i / (data.length - 1);
                                        const y = padding + (chartHeight - 2 * padding) * (1 - d[key] / maxValue);
                                        return (
                                            <circle
                                                key={i}
                                                cx={x}
                                                cy={y}
                                                r="4"
                                                fill={color}
                                            />
                                        );
                                    })}
                                </g>
                            );
                        })}

                        {/* X-axis labels */}
                        {data.map((d, i) => {
                            const x = padding + (chartWidth - 2 * padding) * i / (data.length - 1);
                            return (
                                <text
                                    key={i}
                                    x={x}
                                    y={chartHeight + 20}
                                    textAnchor="middle"
                                    fontSize="12"
                                    fill="#6b7280"
                                >
                                    {d.month}
                                </text>
                            );
                        })}
                    </svg>

                    {/* Legend */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '2rem',
                        marginTop: '1rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: '12px',
                                height: '3px',
                                background: '#3a1c71',
                                borderRadius: '2px'
                            }}></div>
                            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'Roboto, sans-serif' }}>
                                Total Users
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: '12px',
                                height: '3px',
                                background: '#d76d77',
                                borderRadius: '2px'
                            }}></div>
                            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'Roboto, sans-serif' }}>
                                Active Users
                            </span>
                        </div>
                    </div>
                </div>
            );
        }

        if (type === 'bar') {
            const maxValue = Math.max(...data.map(d => parseFloat(d.usage) || 0));
            return (
                <div style={{ width: '100%' }}>
                    {data.map((item, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '1rem',
                            gap: '1rem'
                        }}>
                            <div style={{
                                minWidth: '140px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#000',
                                fontFamily: 'Roboto, sans-serif'
                            }}>
                                {item.feature}
                            </div>
                            <div style={{
                                flex: 1,
                                height: '24px',
                                background: '#f3f4f6',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${maxValue > 0 ? ((parseFloat(item.usage) || 0) / maxValue) * 100 : 0}%`,
                                    background: item.color || '#6b7280',
                                    borderRadius: '12px',
                                    transition: 'width 0.3s ease'
                                }}></div>
                            </div>
                            <div style={{
                                minWidth: '50px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#000',
                                fontFamily: 'Roboto, sans-serif'
                            }}>
                                {item.usage}%
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return null;
    };

    if (!mounted) {
        return (
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(58, 28, 113, 0.1)',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '1.125rem',
                    color: '#6b7280',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    Loading analytics...
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#000',
                    marginBottom: '0.5rem',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    User Analytics
                </h2>
                <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    Comprehensive insights into user behavior and platform performance
                </p>
            </div>

            {/* Charts Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '2rem'
            }}>
 

                {/* Feature Usage Chart */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: '1px solid rgba(58, 28, 113, 0.1)'
                }}>
                    <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#000',
                        marginBottom: '1rem',
                        fontFamily: 'Roboto, sans-serif'
                    }}>
                        Feature Usage
                    </h3>
                    <SimpleChart data={analyticsData.featureUsage || []} type="bar" />
                </div>
            </div>

        </div>
    );
};

export default UserAnalytics;
