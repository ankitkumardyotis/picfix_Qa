import React, { useState, useEffect } from 'react';
import { Search as SearchIcon } from '@mui/icons-material';

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    const [sortField, setSortField] = useState('date');
    const [sortDirection, setSortDirection] = useState('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchPayments();
    }, [pagination.page, statusFilter, searchTerm]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                status: statusFilter,
                search: searchTerm
            });

            const response = await fetch(`/api/admin/payment-history?${params}`);
            if (!response.ok) {
                throw new Error('Failed to fetch payment history');
            }

            const data = await response.json();
            setPayments(data.payments || []);
            setPagination(prev => ({
                ...prev,
                total: data.pagination.total,
                totalPages: data.pagination.totalPages
            }));
        } catch (error) {
            console.error('Error fetching payment history:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && payments.length === 0) {
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
                    Loading payment history...
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
                    Error loading payment history: {error}
                </div>
            </div>
        );
    }

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const filteredPayments = payments.filter(payment => {
        const matchesSearch = payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || payment.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const sortedPayments = [...filteredPayments].sort((a, b) => {
        if (!sortField) return 0;

        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'date') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'completed': return { bg: '#dcfce7', color: '#10b981' };
            case 'pending': return { bg: '#fef3c7', color: '#f59e0b' };
            case 'failed': return { bg: '#fee2e2', color: '#ef4444' };
            default: return { bg: '#f3f4f6', color: '#6b7280' };
        }
    };

    const getPlanColor = (plan) => {
        switch (plan) {
            case 'Premium': return '#3a1c71';
            case 'Pro': return '#d76d77';
            case 'Basic': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const totalRevenue = payments.filter(p => p.status === 'captured' || p.status === 'PAYMENT_SUCCESS').reduce((sum, p) => sum + p.amount, 0);
    const pendingRevenue = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    const failedCount = payments.filter(p => p.status === 'failed').length;

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
                    alignItems: 'flex-start',
                    marginBottom: '1.5rem'
                }}>
                    <div>
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#000',
                            margin: 0,
                            marginBottom: '0.5rem',
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            Payment History
                        </h3>
                        <p style={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            margin: 0,
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            Track and manage all payment transactions
                        </p>
                    </div>

                    {/* Summary Cards */}
                    <div style={{
                        display: 'flex',
                        gap: '1rem'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            textAlign: 'center',
                            minWidth: '120px'
                        }}>
                            <div style={{
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                fontFamily: 'Roboto, sans-serif'
                            }}>
                                ${totalRevenue.toLocaleString()}
                            </div>
                            <div style={{
                                fontSize: '0.75rem',
                                opacity: 0.9,
                                fontFamily: 'Roboto, sans-serif'
                            }}>
                                Total Revenue
                            </div>
                        </div>
                        <div style={{
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: 'white',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            textAlign: 'center',
                            minWidth: '120px'
                        }}>
                            <div style={{
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                fontFamily: 'Roboto, sans-serif'
                            }}>
                                ${pendingRevenue.toLocaleString()}
                            </div>
                            <div style={{
                                fontSize: '0.75rem',
                                opacity: 0.9,
                                fontFamily: 'Roboto, sans-serif'
                            }}>
                                Pending
                            </div>
                        </div>
                        <div style={{
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            color: 'white',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            textAlign: 'center',
                            minWidth: '120px'
                        }}>
                            <div style={{
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                fontFamily: 'Roboto, sans-serif'
                            }}>
                                {failedCount}
                            </div>
                            <div style={{
                                fontSize: '0.75rem',
                                opacity: 0.9,
                                fontFamily: 'Roboto, sans-serif'
                            }}>
                                Failed
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center'
                }}>
                    {/* Search Bar */}
                    <div style={{ position: 'relative', flex: 1 }}>
                        <input
                            type="text"
                            placeholder="Search by user, payment ID, or transaction ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.5rem',
                                border: '1px solid rgba(58, 28, 113, 0.2)',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                fontFamily: 'Roboto, sans-serif',
                                outline: 'none',
                                transition: 'border-color 0.2s ease'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#3a1c71';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(58, 28, 113, 0.2)';
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            left: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#6b7280',
                            fontSize: '1rem'
                        }}>
                            <SearchIcon />
                        </div>
                    </div>


                </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse'
                }}>
                    <thead>
                        <tr style={{
                            background: 'rgba(58, 28, 113, 0.02)',
                            borderBottom: '1px solid rgba(58, 28, 113, 0.1)'
                        }}>
                            {[
                                { key: 'id', label: 'Payment ID' },
                                { key: 'userName', label: 'User' },
                                { key: 'amount', label: 'Amount' },
                                { key: 'plan', label: 'Plan' },
                                { key: 'status', label: 'Status' },
                                { key: 'paymentMethod', label: 'Method' },
                                { key: 'date', label: 'Date' },
                            ].map((header) => (
                                <th
                                    key={header.key}
                                    onClick={() => header.key !== 'actions' && handleSort(header.key)}
                                    style={{
                                        padding: '1rem',
                                        textAlign: 'left',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        color: '#374151',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        fontFamily: 'Roboto, sans-serif',
                                        cursor: header.key !== 'actions' ? 'pointer' : 'default',
                                        userSelect: 'none'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        {header.label}
                                        {header.key !== 'actions' && sortField === header.key && (
                                            <span style={{ fontSize: '0.75rem' }}>
                                                {sortDirection === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPayments.map((payment, index) => (
                            <tr
                                key={payment.id}
                                style={{
                                    borderBottom: '1px solid rgba(58, 28, 113, 0.05)',
                                    transition: 'background-color 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(58, 28, 113, 0.02)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <td style={{ padding: '1rem' }}>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#3a1c71',
                                        fontFamily: 'Roboto, sans-serif'
                                    }}>
                                        {payment.id}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: '#6b7280',
                                        fontFamily: 'Roboto, sans-serif'
                                    }}>
                                        {payment.transactionId}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#000',
                                        fontFamily: 'Roboto, sans-serif'
                                    }}>
                                        {payment.userName}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: '#6b7280',
                                        fontFamily: 'Roboto, sans-serif'
                                    }}>
                                        {payment.userEmail}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        color: '#000',
                                        fontFamily: 'Roboto, sans-serif'
                                    }}>
                                        ${payment.amount.toLocaleString()}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        background: getPlanColor(payment.plan),
                                        color: 'white',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        fontFamily: 'Roboto, sans-serif'
                                    }}>
                                        {payment.plan}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        background: getStatusColor(payment.status).bg,
                                        color: getStatusColor(payment.status).color,
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        fontFamily: 'Roboto, sans-serif'
                                    }}>
                                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        color: '#000',
                                        fontFamily: 'Roboto, sans-serif'
                                    }}>
                                        {payment.paymentMethod}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        color: '#000',
                                        fontFamily: 'Roboto, sans-serif'
                                    }}>
                                         {new Date(payment.date).getDate().toString().padStart(2, '0')}/{(new Date(payment.date).getMonth() + 1).toString().padStart(2, '0')}/{new Date(payment.date).getFullYear()}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: '#6b7280',
                                        fontFamily: 'Roboto, sans-serif'
                                    }}>
                                        {new Date(payment.date).toLocaleTimeString()}
                                    </div>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentHistory;
