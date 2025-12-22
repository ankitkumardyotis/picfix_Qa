import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { getServerSession } from 'next-auth/next';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { authOptions } from '../api/auth/[...nextauth]';
import { isAdmin, isSuperAdmin } from '../../lib/adminAuth';
import AdminSidebar from '../../components/adminComponents/AdminSidebar';
import AdminStats from '../../components/adminComponents/AdminStats';
import UsersManagement from '../../components/adminComponents/UsersManagement';
import PaymentHistory from '../../components/adminComponents/PaymentHistory';
import UserAnalytics from '../../components/adminComponents/UserAnalytics';
import AdminManagement from '../../components/adminComponents/AdminManagement';
import LocationAnalytics from '../../components/adminComponents/LocationAnalytics';
import AdminSplitButton from '../../components/adminComponents/AdminSplitButton';
import ManualPlanAssignment from '../../components/adminComponents/ManualPlanAssignment';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [mounted, setMounted] = useState(false);
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Client-side protection - additional layer of security
    useEffect(() => {
        if (status === 'loading') return; // Still loading
        
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/admin-dashboard');
            return;
        }
        
        if (session && !isAdmin(session)) {
            router.push('/?error=access-denied');
            return;
        }
    }, [session, status, router]);

    // Show loading while checking authentication
    if (status === 'loading' || !mounted) {
        return (
            <>
                <Head>
                    <title>Loading - PicFix AI</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    background: '#f8fafc',
                    fontFamily: 'Roboto, sans-serif'
                }}>
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
                            Checking access permissions...
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Show access denied if not admin (fallback)
    if (!isAdmin(session)) {
        return (
            <>
                <Head>
                    <title>Access Denied - PicFix AI</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    background: '#f8fafc',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        border: '1px solid rgba(58, 28, 113, 0.1)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            fontSize: '1.5rem',
                            color: '#ef4444',
                            fontFamily: 'Roboto, sans-serif',
                            marginBottom: '1rem'
                        }}>
                            Access Denied
                        </div>
                        <div style={{
                            fontSize: '1rem',
                            color: '#6b7280',
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            You don't have permission to access this page.
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div>
                        <AdminStats />
                        {/* Quick overview cards */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '2rem',
                            marginBottom: '2rem'
                        }}>
                        
                        </div>
                    </div>
                );
            case 'users':
                return <UsersManagement />;
            case 'payments':
                return <PaymentHistory />;
            case 'analytics':
                return (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                        gap: '2rem'
                    }}>
                        <UserAnalytics />
                        <LocationAnalytics />
                    </div>
                );
            case 'manage-admins':
                return <AdminManagement />;
            case 'assign-plans':
                return <ManualPlanAssignment />;
            case 'settings':
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
                            color: '#000',
                            marginBottom: '1rem',
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            Admin Settings
                        </h2>
                        <p style={{
                            fontSize: '1rem',
                            color: '#6b7280',
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            Settings panel coming soon...
                        </p>
                    </div>
                );
            default:
                return <AdminStats />;
        }
    };

    return (
        <>
            <Head>
                <title>Admin Dashboard - PicFix AI</title>
                <meta name="description" content="PicFix AI Admin Dashboard - Manage users, payments, and analytics" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div style={{
                display: 'flex',
                minHeight: '100vh',
                background: '#f8fafc',
                fontFamily: 'Roboto, sans-serif'
            }}>
                <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} session={session} />

                {/* Main Content */}
                <div style={{
                    flex: 1,
                    marginLeft: '280px',
                    padding: '2rem',
                    minHeight: '100vh'
                }}>
                    {/* Header */}
                    <div style={{
                        marginBottom: '2rem',
                        padding: '1.5rem 2rem',
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        border: '1px solid rgba(58, 28, 113, 0.1)',
                        background: 'linear-gradient(135deg, rgba(58, 28, 113, 0.05) 0%, rgba(215, 109, 119, 0.05) 50%, rgba(255, 175, 123, 0.05) 100%)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h1 style={{
                                    fontSize: '2rem',
                                    fontWeight: '700',
                                    margin: 0,
                                    marginBottom: '0.5rem',
                                    background: 'linear-gradient(45deg, #3a1c71, #d76d77, #ffaf7b)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    fontFamily: 'Roboto, sans-serif'
                                }}>
                                    Admin Dashboard
                                </h1>
                                <p style={{
                                    fontSize: '1rem',
                                    color: '#6b7280',
                                    margin: 0,
                                    fontFamily: 'Roboto, sans-serif'
                                }}>
                                    Monitor and manage your PicFix AI platform
                                </p>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                {/* User Profile Section */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    background: 'white',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(58, 28, 113, 0.1)',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                                }}>
                                    {/* User Avatar */}
                                    {/* <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: isSuperAdmin(session) 
                                            ? 'linear-gradient(45deg, #dc2626, #ef4444)' 
                                            : 'linear-gradient(45deg, #3a1c71, #d76d77)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        fontFamily: 'Roboto, sans-serif'
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
                                    </div> */}
                                    
                                    {/* User Info */}
                                    {/* <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                                        <div style={{
                                            fontSize: '0.7rem',
                                            color: isSuperAdmin(session) ? '#dc2626' : '#3b82f6',
                                            fontWeight: '600',
                                            fontFamily: 'Roboto, sans-serif'
                                        }}>
                                            {isSuperAdmin(session) ? 'Super Admin' : 'Admin'}
                                        </div>
                                    </div> */}
                                </div>

                                {/* Admin Navigation Split Button */}
                                <div style={{ minWidth: '200px' }}>
                                    <AdminSplitButton />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Content */}
                    {mounted ? renderContent() : (
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
                                Loading dashboard...
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;

// Server-side authentication and authorization check
export async function getServerSideProps(context) {
    try {
        const session = await getServerSession(context.req, context.res, authOptions);
        
        // Check if user is authenticated
        if (!session || !session.user) {
            return {
                redirect: {
                    destination: '/login?callbackUrl=/admin-dashboard',
                    permanent: false,
                }
            };
        }
        
        // Check if user has admin role (admin or super_admin)
        if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
            return {
                redirect: {
                    destination: '/?error=access-denied',
                    permanent: false,
                }
            };
        }
        
        return {
            props: {
                session,
            }
        };
    } catch (error) {
        console.error('Admin dashboard auth error:', error);
        return {
            redirect: {
                destination: '/login?error=auth-error',
                permanent: false,
            }
        };
    }
}
