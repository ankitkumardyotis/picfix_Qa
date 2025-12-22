import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import { isSuperAdmin } from '../../lib/adminAuth';
import AdminSplitButton from './AdminSplitButton';
import { Dashboard } from '@mui/icons-material';
import { People } from '@mui/icons-material';
import { CreditCard } from '@mui/icons-material';
import { Analytics } from '@mui/icons-material';
import { AdminPanelSettings } from '@mui/icons-material';
import { Assignment } from '@mui/icons-material';

const AdminSidebar = ({ activeTab, setActiveTab, session }) => {
    const router = useRouter();

    const menuItems = [
        {
            id: 'overview',
            label: 'Overview',
            icon: <Dashboard sx={{color: '#3a1c71'}} />,
            description: 'Dashboard overview'
        },
        {
            id: 'users',
            label: 'Users',
            icon: <People sx={{color: '#3a1c71'}} />,
            description: 'Manage users'
        },
        {
            id: 'payments',
            label: 'Payments',
            icon: <CreditCard sx={{color: '#3a1c71'}} />,
            description: 'Payment history'
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: <Analytics sx={{color: '#3a1c71'}} />,
            description: 'User analytics'
        },
        {
            id: 'manage-admins',
            label: 'Manage Admins',
            icon: <AdminPanelSettings sx={{color: '#3a1c71'}} />,
            description: 'Admin management'
        },
        {
            id: 'assign-plans',
            label: 'Assign Plans',
            icon: <Assignment sx={{color: '#3a1c71'}} />,
            description: 'Manual plan assignment'
        },
      
    ];

    return (
        <div style={{
            width: '280px',
            minHeight: '100vh',
            background: 'white',
            borderRight: '1px solid rgba(58, 28, 113, 0.1)',
            boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.1)',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                padding: '2rem 1.5rem',
                borderBottom: '1px solid rgba(58, 28, 113, 0.1)',
                background: 'linear-gradient(135deg, rgba(58, 28, 113, 0.05) 0%, rgba(215, 109, 119, 0.05) 50%, rgba(255, 175, 123, 0.05) 100%)'
            }}>
                <Link href="/" passHref legacyBehavior>
                    <a style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        textDecoration: 'none'
                    }}>
                        <img src="/assets/logo.jpg" alt="PicFix AI" style={{ width: '40px', height: '40px', borderRadius: '12px' }} />
                       
                        <div>
                           
                            <p style={{
                                fontSize: '0.75rem',
                                color: '#6b7280',
                                margin: 0,
                                fontFamily: 'Roboto, sans-serif'
                            }}>
                                Admin Dashboard
                            </p>
                        </div>
                    </a>
                </Link>
            </div>

            {/* Navigation Menu */}
            <div style={{
                padding: '1.5rem 0',
                flex: 1
            }}>
               

                <nav>
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1.5rem',
                                border: 'none',
                                background: activeTab === item.id 
                                    ? 'linear-gradient(135deg, rgba(58, 28, 113, 0.1) 0%, rgba(215, 109, 119, 0.1) 50%, rgba(255, 175, 123, 0.1) 100%)'
                                    : 'transparent',
                                borderRight: activeTab === item.id ? '3px solid #3a1c71' : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                textAlign: 'left'
                            }}
                            onMouseEnter={(e) => {
                                if (activeTab !== item.id) {
                                    e.currentTarget.style.background = 'rgba(58, 28, 113, 0.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeTab !== item.id) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            <div style={{
                                fontSize: '1.25rem',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {item.icon}
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '0.875rem',
                                    fontWeight: activeTab === item.id ? '600' : '500',
                                    color: activeTab === item.id ? '#3a1c71' : '#374151',
                                    marginBottom: '0.125rem',
                                    fontFamily: 'Roboto, sans-serif'
                                }}>
                                    {item.label}
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#6b7280',
                                    fontFamily: 'Roboto, sans-serif'
                                }}>
                                    {item.description}
                                </div>
                            </div>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Footer */}
            <div style={{
                padding: '1.5rem',
                borderTop: '1px solid rgba(58, 28, 113, 0.1)',
                background: 'rgba(58, 28, 113, 0.02)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '1rem'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: isSuperAdmin(session) 
                            ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
                            : 'linear-gradient(135deg, #3a1c71 0%, #d76d77 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        color: 'white',
                        fontWeight: '600'
                    }}>
                        {session?.user?.image ? (
                            <img 
                                src={session.user.image} 
                                alt="User" 
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                }}
                            />
                        ) : (
                            session?.user?.name?.charAt(0)?.toUpperCase() || 
                            session?.user?.email?.charAt(0)?.toUpperCase() || 'A'
                        )}
                    </div>
                    <div>
                        <div style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#000',
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            {session?.user?.name || 'Admin User'}
                        </div>
                        <div style={{
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            {session?.user?.email || 'admin@picfix.ai'}
                        </div>
                        {/* <div style={{
                            fontSize: '0.7rem',
                            color: isSuperAdmin(session) ? '#dc2626' : '#3b82f6',
                            fontWeight: '600',
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            {isSuperAdmin(session) ? 'Super Admin' : 'Admin'}
                        </div> */}
                    </div>
                </div>

                {/* Admin Split Button Navigation */}
                <AdminSplitButton />
            </div>
        </div>
    );
};

export default AdminSidebar;
