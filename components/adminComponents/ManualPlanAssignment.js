import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { isAdmin } from '../../lib/adminAuth';

const ManualPlanAssignment = () => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [planDetails, setPlanDetails] = useState({
        planName: '',
        creditPoints: '',
        expiryDays: '30'
    });

    // Check if current user is admin
    const canAssignPlans = isAdmin(session);

    const predefinedPlans = [
        { name: 'Basic', credits: 100, description: 'Basic plan with 100 credits' },
        { name: 'Pro', credits: 500, description: 'Pro plan with 500 credits' },
        { name: 'Premium', credits: 1000, description: 'Premium plan with 1000 credits' },
        { name: 'Enterprise', credits: 5000, description: 'Enterprise plan with 5000 credits' }
    ];

    useEffect(() => {
        // Clear search results when search term is empty
        if (!searchTerm.trim()) {
            setSearchResults([]);
            setSelectedUser(null);
        }
    }, [searchTerm]);

    const searchUsers = async () => {
        if (!searchTerm.trim()) {
            setError('Please enter an email or name to search');
            return;
        }

        try {
            setSearchLoading(true);
            setError('');
            
            const response = await fetch(`/api/admin/search-users?q=${encodeURIComponent(searchTerm.trim())}`);
            const data = await response.json();

            if (response.ok) {
                setSearchResults(data.users || []);
                if (data.users.length === 0) {
                    setError(`No users found matching "${searchTerm}". Try searching with a different term or check if the user exists.`);
                }
            } else {
                setError(data.message || 'Failed to search users');
            }
        } catch (error) {
            setError('Network error occurred while searching');
        } finally {
            setSearchLoading(false);
        }
    };


    const selectUser = (user) => {
        setSelectedUser(user);
        setSearchTerm(user.email);
        setSearchResults([]);
        setError('');
    };

    const selectPredefinedPlan = (plan) => {
        setPlanDetails({
            ...planDetails,
            planName: plan.name,
            creditPoints: plan.credits.toString()
        });
    };

    const assignPlan = async () => {
        if (!selectedUser) {
            setError('Please select a user first');
            return;
        }

        if (selectedUser.role === 'super_admin') {
            setError('Cannot assign plans to Super Admin users');
            return;
        }

        if (!planDetails.planName.trim() || !planDetails.creditPoints.trim()) {
            setError('Please fill in all plan details');
            return;
        }

        const credits = parseInt(planDetails.creditPoints);
        if (isNaN(credits) || credits <= 0) {
            setError('Credit points must be a positive number');
            return;
        }

        const expiryDays = parseInt(planDetails.expiryDays);
        if (isNaN(expiryDays) || expiryDays <= 0) {
            setError('Expiry days must be a positive number');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            const response = await fetch('/api/admin/assign-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    planName: planDetails.planName.trim(),
                    creditPoints: credits,
                    expiryDays: expiryDays
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(`Successfully assigned ${planDetails.planName} plan with ${credits} credits to ${selectedUser.name || selectedUser.email}`);
                // Reset form
                setSelectedUser(null);
                setSearchTerm('');
                setPlanDetails({
                    planName: '',
                    creditPoints: '',
                    expiryDays: '30'
                });
            } else {
                setError(data.message || 'Failed to assign plan');
            }
        } catch (error) {
            setError('Network error occurred while assigning plan');
        } finally {
            setLoading(false);
        }
    };

    if (!canAssignPlans) {
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
                    Only admins can assign plans to users.
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
                Manual Plan Assignment
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

            {/* User Search Section */}
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
                    1. Select User
                </h3>
                
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    marginBottom: '1rem'
                }}>
                    <input
                        type="text"
                        placeholder="Enter user email or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                        onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                    />
                    <button
                        onClick={searchUsers}
                        disabled={searchLoading}
                        style={{
                            background: searchLoading ? '#9ca3af' : 'linear-gradient(45deg, #3a1c71, #d76d77)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.75rem 1.5rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: searchLoading ? 'not-allowed' : 'pointer',
                            fontFamily: 'Roboto, sans-serif',
                            transition: 'all 0.2s'
                        }}
                    >
                        {searchLoading ? 'Searching...' : 'Search Users'}
                    </button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        maxHeight: '200px',
                        overflowY: 'auto'
                    }}>
                        {searchResults.map((user) => (
                            <div
                                key={user.id}
                                onClick={() => selectUser(user)}
                                style={{
                                    padding: '0.75rem 1rem',
                                    borderBottom: '1px solid #f3f4f6',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                {user.image && (
                                    <img
                                        src={user.image}
                                        alt={user.name || user.email}
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
                                        {user.name || 'N/A'}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: '#6b7280',
                                        fontFamily: 'Roboto, sans-serif'
                                    }}>
                                        {user.email}
                                    </div>
                                    {user.role !== 'user' && (
                                        <div style={{
                                            fontSize: '0.7rem',
                                            color: user.role === 'super_admin' ? '#dc2626' : '#f59e0b',
                                            fontWeight: '600',
                                            fontFamily: 'Roboto, sans-serif'
                                        }}>
                                            {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Selected User Display */}
                {selectedUser && (
                    <div style={{
                        background: '#e0f2fe',
                        border: '1px solid #0284c7',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginTop: '1rem'
                    }}>
                        <div style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#0c4a6e',
                            marginBottom: '0.25rem',
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            Selected User:
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            {selectedUser.image && (
                                <img
                                    src={selectedUser.image}
                                    alt={selectedUser.name || selectedUser.email}
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
                                    color: '#0c4a6e',
                                    fontFamily: 'Roboto, sans-serif'
                                }}>
                                    {selectedUser.name || 'N/A'}
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#0369a1',
                                    fontFamily: 'Roboto, sans-serif'
                                }}>
                                    {selectedUser.email}
                                </div>
                                {selectedUser.role !== 'user' && (
                                    <div style={{
                                        fontSize: '0.7rem',
                                        color: selectedUser.role === 'super_admin' ? '#dc2626' : '#f59e0b',
                                        fontWeight: '600',
                                        fontFamily: 'Roboto, sans-serif'
                                    }}>
                                        {selectedUser.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Warning for admin users */}
                {selectedUser && selectedUser.role === 'admin' && (
                    <div style={{
                        background: '#fef3c7',
                        border: '1px solid #f59e0b',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginTop: '1rem'
                    }}>
                        <div style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#92400e',
                            marginBottom: '0.25rem',
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            ⚠️ Admin User Selected
                        </div>
                        <div style={{
                            fontSize: '0.75rem',
                            color: '#92400e',
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            You are about to assign a plan to an admin user. This is allowed but please ensure this is intentional.
                        </div>
                    </div>
                )}

                {selectedUser && selectedUser.role === 'super_admin' && (
                    <div style={{
                        background: '#fee2e2',
                        border: '1px solid #dc2626',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginTop: '1rem'
                    }}>
                        <div style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#dc2626',
                            marginBottom: '0.25rem',
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            🚫 Super Admin User
                        </div>
                        <div style={{
                            fontSize: '0.75rem',
                            color: '#dc2626',
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            Plans cannot be assigned to Super Admin users. Please select a different user.
                        </div>
                    </div>
                )}
            </div>

            {/* Plan Details Section */}
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
                    2. Configure Plan Details
                </h3>

                {/* Predefined Plans */}
                {/* <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '0.5rem',
                        fontFamily: 'Roboto, sans-serif'
                    }}>
                        Quick Select (Optional):
                    </label>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '0.75rem'
                    }}>
                        {predefinedPlans.map((plan) => (
                            <button
                                key={plan.name}
                                onClick={() => selectPredefinedPlan(plan)}
                                style={{
                                    background: 'white',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    padding: '0.75rem',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontFamily: 'Roboto, sans-serif'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#3a1c71';
                                    e.currentTarget.style.background = '#f8fafc';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#d1d5db';
                                    e.currentTarget.style.background = 'white';
                                }}
                            >
                                <div style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: '#111827',
                                    marginBottom: '0.25rem'
                                }}>
                                    {plan.name}
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#6b7280'
                                }}>
                                    {plan.credits} credits
                                </div>
                            </button>
                        ))}
                    </div>
                </div> */}

                {/* Manual Plan Configuration */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }}>
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem',
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            Plan Name *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Premium"
                            value={planDetails.planName}
                            onChange={(e) => setPlanDetails({...planDetails, planName: e.target.value})}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontFamily: 'Roboto, sans-serif',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem',
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            Credit Points *
                        </label>
                        <input
                            type="number"
                            placeholder="e.g., 1000"
                            value={planDetails.creditPoints}
                            onChange={(e) => setPlanDetails({...planDetails, creditPoints: e.target.value})}
                            min="1"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontFamily: 'Roboto, sans-serif',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem',
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            Expiry (Days) *
                        </label>
                        <input
                            type="number"
                            placeholder="e.g., 30"
                            value={planDetails.expiryDays}
                            onChange={(e) => setPlanDetails({...planDetails, expiryDays: e.target.value})}
                            min="1"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontFamily: 'Roboto, sans-serif',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Assign Plan Button */}
            <div style={{ textAlign: 'center' }}>
                <button
                    onClick={assignPlan}
                    disabled={loading || !selectedUser}
                    style={{
                        background: loading || !selectedUser ? '#9ca3af' : 'linear-gradient(45deg, #3a1c71, #d76d77)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '1rem 2rem',
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        cursor: loading || !selectedUser ? 'not-allowed' : 'pointer',
                        fontFamily: 'Roboto, sans-serif',
                        transition: 'all 0.2s',
                        minWidth: '200px'
                    }}
                >
                    {loading ? 'Assigning Plan...' : 'Assign Plan'}
                </button>
            </div>

            {/* Instructions */}
            <div style={{
                marginTop: '2rem',
                padding: '1rem',
                background: '#fffbeb',
                border: '1px solid #fbbf24',
                borderRadius: '8px'
            }}>
                <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#92400e',
                    marginBottom: '0.5rem',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    Instructions:
                </h4>
                <ul style={{
                    fontSize: '0.75rem',
                    color: '#92400e',
                    margin: 0,
                    paddingLeft: '1.5rem',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    <li>Search for users by their email address or name</li>
                    <li>Select a user from the search results</li>
                    <li>Choose a predefined plan or enter custom plan details</li>
                    <li>Click "Assign Plan" to create/update the user's plan</li>
                    <li>If the user already has a plan, credits will be added to their existing balance</li>
                </ul>
            </div>
        </div>
    );
};

export default ManualPlanAssignment;
