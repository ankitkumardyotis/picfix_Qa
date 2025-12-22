import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { isSuperAdmin } from '../../lib/adminAuth';

const AdminManagement = () => {
    const { data: session } = useSession();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoading, setActionLoading] = useState('');

    // Check if current user is super admin
    const canManageAdmins = isSuperAdmin(session);

    useEffect(() => {
        if (canManageAdmins) {
            fetchAdmins();
        }
    }, [canManageAdmins, currentPage, searchTerm]);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/manage-admins?page=${currentPage}&limit=10&search=${searchTerm}`);
            const data = await response.json();

            if (response.ok) {
                setAdmins(data.admins);
                setTotalPages(data.pagination.totalPages);
            } else {
                setError(data.message || 'Failed to fetch admins');
            }
        } catch (error) {
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    const promoteToAdmin = async () => {
        if (!newAdminEmail.trim()) {
            setError('Please enter an email address');
            return;
        }

        try {
            setActionLoading('promote');
            setError('');
            setSuccess('');

            const response = await fetch('/api/admin/manage-admins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: newAdminEmail.trim() }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(`${data.user.name || data.user.email} has been promoted to admin`);
                setNewAdminEmail('');
                fetchAdmins(); // Refresh the list
            } else {
                setError(data.message || 'Failed to promote user');
            }
        } catch (error) {
            setError('Network error occurred');
        } finally {
            setActionLoading('');
        }
    };

    const removeAdmin = async (userId, userName, userEmail) => {
        if (!confirm(`Are you sure you want to remove admin role from ${userName || userEmail}?`)) {
            return;
        }

        try {
            setActionLoading(`remove-${userId}`);
            setError('');
            setSuccess('');

            const response = await fetch(`/api/admin/manage-admins?userId=${userId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(`Admin role removed from ${userName || userEmail}`);
                fetchAdmins(); // Refresh the list
            } else {
                setError(data.message || 'Failed to remove admin role');
            }
        } catch (error) {
            setError('Network error occurred');
        } finally {
            setActionLoading('');
        }
    };

    if (!canManageAdmins) {
        return (
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(58, 28, 113, 0.1)',
                textAlign: 'center'
            }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#ef4444',
                    marginBottom: '1rem',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    Access Denied
                </h2>
                <p style={{
                    fontSize: '1rem',
                    color: '#6b7280',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    Only super admins can manage admin roles.
                </p>
            </div>
        );
    }

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(58, 28, 113, 0.1)'
        }}>
            <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#000',
                marginBottom: '1.5rem',
                fontFamily: 'Roboto, sans-serif'
            }}>
                Admin Management
            </h2>

            {/* Error/Success Messages */}
            {error && (
                <div style={{
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1rem',
                    color: '#dc2626',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{
                    background: '#d1fae5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1rem',
                    color: '#065f46',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    {success}
                </div>
            )}

            {/* Promote User Section */}
            <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem',
                border: '1px solid #e2e8f0'
            }}>
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#000',
                    marginBottom: '1rem',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    Promote User to Admin
                </h3>
                
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                }}>
                    <input
                        type="email"
                        placeholder="Enter user email..."
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        style={{
                            flex: 1,
                            minWidth: '250px',
                            padding: '0.75rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontFamily: 'Roboto, sans-serif',
                            outline: 'none'
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && promoteToAdmin()}
                    />
                    <button
                        onClick={promoteToAdmin}
                        disabled={actionLoading === 'promote'}
                        style={{
                            background: actionLoading === 'promote' ? '#9ca3af' : 'linear-gradient(45deg, #3a1c71, #d76d77)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.75rem 1.5rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: actionLoading === 'promote' ? 'not-allowed' : 'pointer',
                            fontFamily: 'Roboto, sans-serif',
                            transition: 'all 0.2s'
                        }}
                    >
                        {actionLoading === 'promote' ? 'Promoting...' : 'Promote to Admin'}
                    </button>
                </div>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '1.5rem' }}>
                <input
                    type="text"
                    placeholder="Search admins..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    style={{
                        width: '100%',
                        maxWidth: '400px',
                        padding: '0.75rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontFamily: 'Roboto, sans-serif',
                        outline: 'none'
                    }}
                />
            </div>

            {/* Admin List */}
            {loading ? (
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#6b7280',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    Loading admins...
                </div>
            ) : (
                <>
                    <div style={{
                        overflowX: 'auto',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px'
                    }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse'
                        }}>
                            <thead style={{
                                background: '#f9fafb',
                                borderBottom: '1px solid #e5e7eb'
                            }}>
                                <tr>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'left',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#374151',
                                        fontFamily: 'Roboto, sans-serif'
                                    }}>User</th>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'left',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#374151',
                                        fontFamily: 'Roboto, sans-serif'
                                    }}>Role</th>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'left',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#374151',
                                        fontFamily: 'Roboto, sans-serif'
                                    }}>Joined</th>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'left',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#374151',
                                        fontFamily: 'Roboto, sans-serif'
                                    }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.map((admin) => (
                                    <tr key={admin.id} style={{
                                        borderBottom: '1px solid #f3f4f6'
                                    }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                {admin.image && (
                                                    <img
                                                        src={admin.image}
                                                        alt={admin.name || admin.email}
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '50%',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                )}
                                                <div>
                                                    <div style={{
                                                        fontSize: '0.875rem',
                                                        fontWeight: '500',
                                                        color: '#111827',
                                                        fontFamily: 'Roboto, sans-serif'
                                                    }}>
                                                        {admin.name || 'N/A'}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '0.75rem',
                                                        color: '#6b7280',
                                                        fontFamily: 'Roboto, sans-serif'
                                                    }}>
                                                        {admin.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                background: admin.role === 'super_admin' ? '#dc2626' : '#3b82f6',
                                                color: 'white',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '500',
                                                fontFamily: 'Roboto, sans-serif'
                                            }}>
                                                {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                            </span>
                                        </td>
                                        <td style={{
                                            padding: '1rem',
                                            fontSize: '0.875rem',
                                            color: '#6b7280',
                                            fontFamily: 'Roboto, sans-serif'
                                        }}>
                                            {new Date(admin.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {admin.role === 'admin' && admin.id !== session?.user?.id && (
                                                <button
                                                    onClick={() => removeAdmin(admin.id, admin.name, admin.email)}
                                                    disabled={actionLoading === `remove-${admin.id}`}
                                                    style={{
                                                        background: actionLoading === `remove-${admin.id}` ? '#9ca3af' : '#ef4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        padding: '0.5rem 1rem',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '500',
                                                        cursor: actionLoading === `remove-${admin.id}` ? 'not-allowed' : 'pointer',
                                                        fontFamily: 'Roboto, sans-serif',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {actionLoading === `remove-${admin.id}` ? 'Removing...' : 'Remove Admin'}
                                                </button>
                                            )}
                                            {admin.role === 'super_admin' && (
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    color: '#6b7280',
                                                    fontStyle: 'italic',
                                                    fontFamily: 'Roboto, sans-serif'
                                                }}>
                                                    {admin.id === session?.user?.id ? 'You' : 'Protected'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '1rem',
                            marginTop: '1.5rem',
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                style={{
                                    background: currentPage === 1 ? '#f3f4f6' : '#3b82f6',
                                    color: currentPage === 1 ? '#9ca3af' : 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.875rem',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Previous
                            </button>
                            <span style={{
                                fontSize: '0.875rem',
                                color: '#6b7280'
                            }}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                style={{
                                    background: currentPage === totalPages ? '#f3f4f6' : '#3b82f6',
                                    color: currentPage === totalPages ? '#9ca3af' : 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.875rem',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminManagement;
