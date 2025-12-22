import React, { useState, useEffect } from 'react';
import { Search as SearchIcon } from '@mui/icons-material';

const UsersTable = () => {
    const [users, setUsers] = useState([]);
    const [availablePlans, setAvailablePlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlan, setSelectedPlan] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchLoading, setSearchLoading] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
    });

    useEffect(() => {
        fetchUsers();
    }, [currentPage, selectedPlan]);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== '') {
                setCurrentPage(1); // Reset to first page when searching
                setSearchLoading(true);
                fetchUsers();
            } else if (searchTerm === '' && currentPage === 1) {
                // Only fetch if we're on page 1 and search is cleared
                setSearchLoading(true);
                fetchUsers();
            }
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Reset to first page when plan filter changes
    useEffect(() => {
        if (selectedPlan !== '') {
            setCurrentPage(1);
            setSearchLoading(true);
            fetchUsers();
        }
    }, [selectedPlan]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: pagination.limit.toString(),
                search: searchTerm,
                plan: selectedPlan
            });
            const response = await fetch(`/api/admin/users?${params}`);
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            setUsers(data.users || []);
            setPagination(data.pagination || pagination);
            setAvailablePlans(data.availablePlans || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError(error.message);
        } finally {
            setLoading(false);
            setSearchLoading(false);
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
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '1.125rem',
                    color: '#6b7280',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    Loading users...
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
                    Error loading users: {error}
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

    const handleSearch = (value) => {
        setSearchTerm(value);
    };

    const handlePlanFilter = (plan) => {
        setSelectedPlan(plan);
    };

    // Use available plans from API response
    const getUniquePlans = () => {
        return availablePlans;
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Since we're doing filtering and pagination on the server, we can use users directly
    // Client-side sorting can still be applied if needed
    const sortedUsers = [...users].sort((a, b) => {
        if (!sortField) return 0;

        let aValue = a[sortField];
        let bValue = b[sortField];

        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const getPlanColor = (planName) => {
        switch (planName) {
            case 'Premium': return '#3a1c71';
            case 'Pro': return '#d76d77';
            case 'Basic': return '#6b7280';
            case 'Free': return '#9ca3af';
            default: return '#6b7280';
        }
    };

    const getStatusColor = (status) => {
        return status === 'Active' ? '#10b981' : '#ef4444';
    };

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
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            Users Management
                        </h3>
                        <p style={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            margin: 0,
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            Manage and monitor user accounts
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
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            Total: {pagination.totalUsers} users
                        </div>
                    </div>
                </div>

                {/* Search and Filter Controls */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center'
                }}>
                    {/* Search Bar */}
                    <div style={{ position: 'relative', flex: 1 }}>
                        <input
                            type="text"
                            placeholder="Search users by name, email, or plan..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
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
                        {searchLoading && (
                            <div style={{
                                position: 'absolute',
                                right: '0.75rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#3a1c71',
                                fontSize: '0.75rem',
                                fontFamily: 'Roboto, sans-serif'
                            }}>
                                Searching...
                            </div>
                        )}
                    </div>

                    {/* Plan Filter Dropdown */}
                    <div style={{ minWidth: '200px' }}>
                        <select
                            value={selectedPlan}
                            onChange={(e) => handlePlanFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
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
                            <option value="">All Plans</option>
                            {getUniquePlans().map((planName) => (
                                <option key={planName} value={planName}>
                                    {planName}
                                </option>
                            ))}
                        </select>
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
                                { key: 'name', label: 'User' },
                                { key: 'plan', label: 'Plan' },
                                { key: 'credits', label: 'Credits' },
                                { key: 'imagesProcessed', label: 'Images' },
                                { key: 'joinDate', label: 'Join Date' },

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

                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedUsers.map((user, index) => (
                            <tr
                                key={user.id}
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
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            background: user.image ? `url(${user.image})` : `linear-gradient(135deg, ${getPlanColor(user.plan.name)} 0%, #d76d77 100%)`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: '600',
                                            fontSize: '0.875rem',
                                            fontFamily: 'Roboto, sans-serif'
                                        }}>
                                            {!user.image && user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                color: '#000',
                                                fontFamily: 'Roboto, sans-serif'
                                            }}>
                                                {user.name}
                                            </div>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: '#6b7280',
                                                fontFamily: 'Roboto, sans-serif'
                                            }}>
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        background: getPlanColor(user.plan.name),
                                        color: 'white',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        fontFamily: 'Roboto, sans-serif'
                                    }}>
                                        {user.plan.name}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        color: '#000',
                                        fontWeight: '600',
                                        fontFamily: 'Roboto, sans-serif'
                                    }}>
                                        {user.plan.remainingCredits}/{user.plan.credits}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: '#6b7280',
                                        fontFamily: 'Roboto, sans-serif'
                                    }}>
                                        {user.plan.usedCredits} used
                                    </div>
                                </td>

                                <td style={{ padding: '1rem' }}>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#000',
                                        fontFamily: 'Roboto, sans-serif'
                                    }}>
                                        {user.imagesProcessed}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        color: '#000',
                                        fontFamily: 'Roboto, sans-serif'
                                    }}>
                                        {/* {new Date(user.joinDate).toLocaleDateString()} */}
                                        {new Date(user.joinDate).getDate().toString().padStart(2, '0')}
                                        -
                                        {(new Date(user.joinDate).getMonth() + 1).toString().padStart(2, '0')}
                                        -
                                        {new Date(user.joinDate).getFullYear()}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: '#6b7280',
                                        fontFamily: 'Roboto, sans-serif'
                                    }}>
                                        Last Image: {
                                            user.lastImageGeneration
                                                ? (() => {
                                                    const date = new Date(user.lastImageGeneration);
                                                    const day = String(date.getDate()).padStart(2, '0');
                                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                                    const year = date.getFullYear();
                                                    return `${day}-${month}-${year}`;
                                                })()
                                                : 'Never'
                                        }
                                    </div>

                                </td>


                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div style={{
                    padding: '1.5rem 2rem',
                    borderTop: '1px solid rgba(58, 28, 113, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(58, 28, 113, 0.02)'
                }}>
                    <div style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        fontFamily: 'Roboto, sans-serif'
                    }}>
                        Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.totalUsers)} of {pagination.totalUsers} users
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center'
                    }}>
                        {/* Previous Button */}
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={!pagination.hasPrevPage}
                            style={{
                                padding: '0.5rem 1rem',
                                border: '1px solid rgba(58, 28, 113, 0.2)',
                                borderRadius: '6px',
                                background: pagination.hasPrevPage ? 'white' : '#f9fafb',
                                color: pagination.hasPrevPage ? '#3a1c71' : '#9ca3af',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                fontFamily: 'Roboto, sans-serif',
                                cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (pagination.hasPrevPage) {
                                    e.target.style.background = '#f8fafc';
                                    e.target.style.borderColor = '#3a1c71';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (pagination.hasPrevPage) {
                                    e.target.style.background = 'white';
                                    e.target.style.borderColor = 'rgba(58, 28, 113, 0.2)';
                                }
                            }}
                        >
                            Previous
                        </button>

                        {/* Page Numbers */}
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                            {(() => {
                                const pages = [];
                                const startPage = Math.max(1, currentPage - 2);
                                const endPage = Math.min(pagination.totalPages, currentPage + 2);

                                for (let i = startPage; i <= endPage; i++) {
                                    pages.push(
                                        <button
                                            key={i}
                                            onClick={() => handlePageChange(i)}
                                            style={{
                                                padding: '0.5rem 0.75rem',
                                                border: '1px solid rgba(58, 28, 113, 0.2)',
                                                borderRadius: '6px',
                                                background: i === currentPage ? '#3a1c71' : 'white',
                                                color: i === currentPage ? 'white' : '#3a1c71',
                                                fontSize: '0.875rem',
                                                fontWeight: '500',
                                                fontFamily: 'Roboto, sans-serif',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                minWidth: '2.5rem'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (i !== currentPage) {
                                                    e.target.style.background = '#f8fafc';
                                                    e.target.style.borderColor = '#3a1c71';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (i !== currentPage) {
                                                    e.target.style.background = 'white';
                                                    e.target.style.borderColor = 'rgba(58, 28, 113, 0.2)';
                                                }
                                            }}
                                        >
                                            {i}
                                        </button>
                                    );
                                }
                                return pages;
                            })()}
                        </div>

                        {/* Next Button */}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={!pagination.hasNextPage}
                            style={{
                                padding: '0.5rem 1rem',
                                border: '1px solid rgba(58, 28, 113, 0.2)',
                                borderRadius: '6px',
                                background: pagination.hasNextPage ? 'white' : '#f9fafb',
                                color: pagination.hasNextPage ? '#3a1c71' : '#9ca3af',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                fontFamily: 'Roboto, sans-serif',
                                cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (pagination.hasNextPage) {
                                    e.target.style.background = '#f8fafc';
                                    e.target.style.borderColor = '#3a1c71';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (pagination.hasNextPage) {
                                    e.target.style.background = 'white';
                                    e.target.style.borderColor = 'rgba(58, 28, 113, 0.2)';
                                }
                            }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersTable;
