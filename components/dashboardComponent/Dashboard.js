import React, { useContext } from 'react'
import MuiTable from './MuiTable'
import TabNavigation from '../mobileTabNavigation/TabNavigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button, Chip } from '@mui/material'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { isAdmin, isSuperAdmin } from '@/lib/adminAuth'
import AppContext from '../AppContext'

function Dashboard({ session, userPlan, createdAt, userHistory, renewAt, matches }) {
    const context = useContext(AppContext);
    if (matches) return (
        <div className="dashboard-desktop" style={{
            flex: 1,
            backgroundColor: '#f8fafc',
            padding: '2rem',
            minHeight: '100%'
        }}>
            {/* Welcome Section */}
            <div className="welcome-section" style={{
                marginBottom: '2rem',
                padding: '2rem',
                background: 'linear-gradient(135deg, rgba(58, 28, 113, 0.1) 0%, rgba(215, 109, 119, 0.1) 50%, rgba(255, 175, 123, 0.1) 100%)',
                borderRadius: '20px',
                border: '1px solid rgba(58, 28, 113, 0.2)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <h1 style={{
                                fontSize: '2.5rem',
                                fontWeight: '600',
                                margin: 0,
                                background: 'linear-gradient(45deg, #3a1c71, #d76d77, #ffaf7b)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                fontFamily: 'Roboto, sans-serif'
                            }}>
                                Hello, {session?.user.name} 👋
                            </h1>
                            {/* Admin Badge */}
                            {isAdmin(session) && (
                                <Chip
                                    icon={<AdminPanelSettingsIcon />}
                                    label={isSuperAdmin(session) ? "Super Admin" : "Admin"}
                                    color="primary"
                                    variant="filled"
                                    sx={{
                                        background: isSuperAdmin(session)
                                            ? 'linear-gradient(45deg, #dc2626 30%, #ef4444 90%)'
                                            : 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                                        color: 'white',
                                        fontWeight: '600',
                                        fontSize: '0.75rem',
                                        '& .MuiChip-icon': {
                                            color: 'white'
                                        }
                                    }}
                                />
                            )}
                        </div>
                        <p style={{
                            fontSize: '1.1rem',
                            color: '#000',
                            fontWeight: '400',
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            Welcome back! {isAdmin(session) && "You have administrative privileges."}
                        </p>
                    </div>
                    <div>
                        {/* Upgrade Plan Button */}
                        <Link href="/pricing" passHref legacyBehavior>
                            <Button
                                variant="contained"
                                sx={{
                                    background: 'linear-gradient(135deg,rgb(251,1,118) 0%, #d76d77 50%, #fbc901 100%)',
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    boxShadow: '0 2px 8px rgba(58,28,113,0.08)',
                                    px: 3,
                                    py: 1.2,
                                    fontSize: '1rem',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #2d0e5e 0%, #b94e5e 50%, #e68a4a 100%)',
                                        boxShadow: '0 4px 16px rgba(58,28,113,0.12)',
                                    },
                                }}
                            >
                                Upgrade Plan ↗
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Credits Section */}
            <div className="credits-section" style={{
                display: 'flex',
                gap: '2rem',
                marginBottom: '2rem'
            }}>
                <div className="credits-card" style={{
                    flex: 1,
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '20px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: '1px solid rgba(58, 28, 113, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)'
                    }}></div>
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#000',
                        marginBottom: '1rem',
                        fontFamily: 'Roboto, sans-serif'
                    }}>
                        Credits Remaining
                    </h3>
                    <div style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '0.5rem',
                        marginBottom: '1rem'
                    }}>
                        <span style={{
                            fontSize: '3.5rem',
                            fontWeight: '600',
                            color: userPlan?.remainingPoints > 10 ? '#3a1c71' : '#ef4444',
                            lineHeight: '1',
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            {userPlan?.remainingPoints ? userPlan?.remainingPoints : 0}
                        </span>
                        <span style={{
                            fontSize: '1.5rem',
                            color: '#000',
                            fontWeight: '400',
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            credits
                        </span>
                    </div>
                    {userPlan?.remainingPoints && <p style={{
                        fontSize: '0.875rem',
                        color: '#000',
                        fontWeight: '400',
                        fontFamily: 'Roboto, sans-serif'
                    }}>
                        Renews on: <span style={{ fontWeight: '600', color: '#000' }}>{userPlan && renewAt}</span>
                    </p>}
                </div>

                {/* Daily Usage Section */}
                {/* Only show daily usage for users without plans */}
                {context?.dailyUsage && (!userPlan || userPlan.length === 0) && (
                    <div className="credits-card" style={{
                        flex: 1,
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '20px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        border: '1px solid rgba(58, 28, 113, 0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 50%, #ff6b6b 100%)'
                        }}></div>
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#000',
                            marginBottom: '1rem',
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            Daily Usage
                        </h3>
                        <div style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '0.5rem',
                            marginBottom: '1rem'
                        }}>
                            <span style={{
                                fontSize: '3.5rem',
                                fontWeight: '600',
                                color: context.dailyUsage.canUseService ? '#3a1c71' : '#ef4444',
                                lineHeight: '1',
                                fontFamily: 'Roboto, sans-serif'
                            }}>
                                {context.dailyUsage.usageCount}
                            </span>
                            <span style={{
                                fontSize: '1.5rem',
                                color: '#000',
                                fontWeight: '400',
                                fontFamily: 'Roboto, sans-serif'
                            }}>
                                / {context.dailyUsage.dailyLimit} credits used
                            </span>
                        </div>
                        <p style={{
                            fontSize: '0.875rem',
                            color: '#000',
                            fontWeight: '400',
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            Resets at: <span style={{ fontWeight: '600', color: '#000' }}>{context.dailyUsage.resetTimeFormatted}</span>
                        </p>
                        {!context.dailyUsage.canUseService && (
                            <p style={{
                                fontSize: '0.875rem',
                                color: '#ef4444',
                                fontWeight: '500',
                                fontFamily: 'Roboto, sans-serif',
                                marginTop: '0.5rem'
                            }}>
                                Daily limit reached. Please upgrade your plan!
                            </p>
                        )}
                    </div>
                )}

                <div className="stats-card" style={{
                    flex: 1.5,
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '20px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: '1px solid rgba(58, 28, 113, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(135deg, #ffaf7b 0%, #d76d77 50%, #3a1c71 100%)'
                    }}></div>
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#000',
                        marginBottom: '1rem',
                        fontFamily: 'Roboto, sans-serif'
                    }}>
                        Quick Stats
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: '600',
                                color: '#3a1c71',
                                marginBottom: '0.25rem',
                                fontFamily: 'Roboto, sans-serif'
                            }}>
                                {userHistory.length}
                            </div>
                            <div style={{
                                fontSize: '0.875rem',
                                color: '#000',
                                fontWeight: '400',
                                fontFamily: 'Roboto, sans-serif'
                            }}>
                                Images Processed
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: '600',
                                color: '#d76d77',
                                marginBottom: '0.25rem',
                                fontFamily: 'Roboto, sans-serif'
                            }}>
                                {userPlan && userPlan.creditPoints - userPlan.remainingPoints}
                            </div>
                            <div style={{
                                fontSize: '0.875rem',
                                color: '#000',
                                fontWeight: '400',
                                fontFamily: 'Roboto, sans-serif'
                            }}>
                                {userPlan?.remainingPoints && "Total Credits Used"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Usage History Section */}
            {userHistory.length > 0 && (
                <div className="history-section" style={{
                    background: 'white',
                    borderRadius: '20px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: '1px solid rgba(58, 28, 113, 0.1)',
                    overflow: 'hidden',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        padding: '1.5rem 2rem',
                        borderBottom: '1px solid rgba(58, 28, 113, 0.1)',
                        background: 'linear-gradient(135deg, rgba(58, 28, 113, 0.05) 0%, rgba(215, 109, 119, 0.05) 50%, rgba(255, 175, 123, 0.05) 100%)'
                    }}>
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#000',
                            margin: 0,
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            Usage History
                        </h3>
                    </div>
                    <div style={{ padding: '1rem' }}>
                        <MuiTable userHistory={userHistory} createdAt={createdAt} />
                    </div>
                </div>
            )}
        </div>
    )

    if (!matches) return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)',
            paddingBottom: '3em'
        }}>
            <div style={{
                minHeight: '100vh',
                marginTop: '3.3em',
                fontFamily: 'Roboto, sans-serif',
                display: 'flex',
                flexDirection: 'column',
                padding: '1rem'
            }}>
                {/* Mobile Welcome Section */}
                <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: '1px solid rgba(58, 28, 113, 0.1)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1rem'
                    }}>
                        <div style={{
                            position: 'relative'
                        }}>
                            <Image
                                width={60}
                                height={60}
                                style={{
                                    borderRadius: "50%",
                                    border: "3px solid #3a1c71",
                                    objectFit: 'cover'
                                }}
                                src={session?.user.image ? session?.user.image : '/assets/user.png'}
                                alt="Profile"
                            />
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: '16px',
                                height: '16px',
                                backgroundColor: '#10b981',
                                borderRadius: '50%',
                                border: '2px solid white'
                            }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                    <h2 style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '600',
                                        margin: 0,
                                        background: 'linear-gradient(45deg, #3a1c71, #d76d77, #ffaf7b)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        fontFamily: 'Roboto, sans-serif'
                                    }}>
                                        Hello, {session?.user.name}
                                    </h2>
                                    {/* Mobile Admin Badge */}
                                    {isAdmin(session) && (
                                        <Chip
                                            icon={<AdminPanelSettingsIcon />}
                                            label={isSuperAdmin(session) ? "Super Admin" : "Admin"}
                                            size="small"
                                            sx={{
                                                background: isSuperAdmin(session)
                                                    ? 'linear-gradient(45deg, #dc2626 30%, #ef4444 90%)'
                                                    : 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                                                color: 'white',
                                                fontWeight: '600',
                                                fontSize: '0.7rem',
                                                '& .MuiChip-icon': {
                                                    color: 'white',
                                                    fontSize: '0.9rem'
                                                }
                                            }}
                                        />
                                    )}
                                </div>
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: '#000',
                                    fontWeight: '400',
                                    fontFamily: 'Roboto, sans-serif',
                                    margin: 0
                                }}>
                                    Welcome back! 👋 {isAdmin(session) && "You have admin privileges."}
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Mobile Credits Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: '1px solid rgba(58, 28, 113, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)'
                    }}></div>
                    <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#000',
                        marginBottom: '1rem',
                        fontFamily: 'Roboto, sans-serif'
                    }}>
                        Available Credits
                    </h3>
                    <div style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '0.5rem',
                        marginBottom: '1rem'
                    }}>
                        <span style={{
                            fontSize: '3rem',
                            fontWeight: '600',
                            color: userPlan?.remainingPoints > 10 ? '#3a1c71' : '#ef4444',
                            lineHeight: '1',
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            {userPlan?.remainingPoints}
                        </span>
                        <span style={{
                            fontSize: '1.25rem',
                            color: '#000',
                            fontWeight: '400',
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                            credits
                        </span>
                    </div>
                    <p style={{
                        fontSize: '0.875rem',
                        color: '#000',
                        fontWeight: '400',
                        fontFamily: 'Roboto, sans-serif'
                    }}>
                        Renews on: <span style={{ fontWeight: '600', color: '#000' }}>{userPlan && renewAt}</span>
                    </p>
                </div>

                {/* Mobile Usage History */}
                {userHistory.length > 0 && (
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        border: '1px solid rgba(58, 28, 113, 0.1)',
                        overflow: 'hidden',
                        marginBottom: '5rem'
                    }}>
                        <div style={{
                            padding: '1rem 1.5rem',
                            borderBottom: '1px solid rgba(58, 28, 113, 0.1)',
                            background: 'linear-gradient(135deg, rgba(58, 28, 113, 0.05) 0%, rgba(215, 109, 119, 0.05) 50%, rgba(255, 175, 123, 0.05) 100%)'
                        }}>
                            <h3 style={{
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                color: '#000',
                                margin: 0,
                                fontFamily: 'Roboto, sans-serif'
                            }}>
                                Usage History
                            </h3>
                        </div>
                        <div style={{ padding: '0.5rem' }}>
                            <MuiTable userHistory={userHistory} createdAt={createdAt} />
                        </div>
                    </div>
                )}
            </div>
            <TabNavigation />
        </div>
    )
}

export default Dashboard