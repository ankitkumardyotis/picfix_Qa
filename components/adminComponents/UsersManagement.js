import React, { useState } from 'react';
import { List, BarChart, ViewList, Analytics } from '@mui/icons-material';
import UsersTable from './UsersTable';
import UserRegistrationChart from './UserRegistrationChart';

const UsersManagement = () => {
    const [activeView, setActiveView] = useState('list');

    const tabs = [
        {
            id: 'list',
            label: 'List View',
            icon: <ViewList sx={{ fontSize: '1.25rem' }} />,
            description: 'Table view of all users'
        },
        {
            id: 'chart',
            label: 'Analytics',
            icon: <Analytics sx={{ fontSize: '1.25rem' }} />,
            description: 'User registration analytics'
        }
    ];

    const renderContent = () => {
        switch (activeView) {
            case 'list':
                return <UsersTable />;
            case 'chart':
                return <UserRegistrationChart />;
            default:
                return <UsersTable />;
        }
    };

    return (
        <div style={{ width: '100%' }}>
            {/* Tab Navigation */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(58, 28, 113, 0.1)',
                marginBottom: '2rem',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '1.5rem 2rem',
                    borderBottom: '1px solid rgba(58, 28, 113, 0.1)',
                    background: 'linear-gradient(135deg, rgba(58, 28, 113, 0.05) 0%, rgba(215, 109, 119, 0.05) 50%, rgba(255, 175, 123, 0.05) 100%)'
                }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        color: '#000',
                        margin: '0 0 0.5rem 0',
                        fontFamily: 'Roboto, sans-serif'
                    }}>
                        User Management
                    </h2>
                    <p style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        margin: 0,
                        fontFamily: 'Roboto, sans-serif'
                    }}>
                        Manage users and view registration analytics
                    </p>
                </div>

                {/* Tab Buttons */}
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid rgba(58, 28, 113, 0.1)'
                }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveView(tab.id)}
                            style={{
                                flex: 1,
                                padding: '1rem 1.5rem',
                                border: 'none',
                                background: activeView === tab.id 
                                    ? 'linear-gradient(135deg, rgba(58, 28, 113, 0.1) 0%, rgba(215, 109, 119, 0.1) 50%, rgba(255, 175, 123, 0.1) 100%)'
                                    : 'transparent',
                                borderBottom: activeView === tab.id ? '3px solid #3a1c71' : '3px solid transparent',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                textAlign: 'center',
                                position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                                if (activeView !== tab.id) {
                                    e.currentTarget.style.background = 'rgba(58, 28, 113, 0.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeView !== tab.id) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            <div style={{
                                color: activeView === tab.id ? '#3a1c71' : '#6b7280',
                                transition: 'color 0.3s ease'
                            }}>
                                {tab.icon}
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '0.875rem',
                                    fontWeight: activeView === tab.id ? '600' : '500',
                                    color: activeView === tab.id ? '#3a1c71' : '#374151',
                                    marginBottom: '0.125rem',
                                    fontFamily: 'Roboto, sans-serif',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {tab.label}
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#6b7280',
                                    fontFamily: 'Roboto, sans-serif'
                                }}>
                                    {tab.description}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div style={{
                transition: 'opacity 0.3s ease',
                opacity: 1
            }}>
                {renderContent()}
            </div>
        </div>
    );
};

export default UsersManagement;
