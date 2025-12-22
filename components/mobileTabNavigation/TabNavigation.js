import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import HomeIcon from '@mui/icons-material/Home';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import PanoramaIcon from '@mui/icons-material/Panorama';
import { useRouter } from 'next/router';

export default function TabNavigation() {
    const router = useRouter();
    const [selectedTabIndex, setSelectedTabIndex] = React.useState(0);

    // Map current route to tab index
    React.useEffect(() => {
        const path = router.pathname;
        if (path === '/dashboard') {
            setSelectedTabIndex(1);
        } else if (path === '/ai-image-editor') {
            setSelectedTabIndex(2);
        } else {
            setSelectedTabIndex(0);
        }
    }, [router.pathname]);

    const handleChange = (_event, newValue) => {
        setSelectedTabIndex(newValue);
        if (newValue === 0) router.push('/');
        if (newValue === 1) router.push('/dashboard');
        if (newValue === 2) router.push('/ai-image-editor');
    };

    return (
        <Tabs
            value={selectedTabIndex}
            onChange={handleChange}
            aria-label="Primary navigation"
            textColor="inherit"
            TabIndicatorProps={{ style: { display: 'none' } }}
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                width: '100%',
                zIndex: 1200,
                // Glassmorphism bar styled to match landing gradients/feel
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                borderTop: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 -10px 30px rgba(0,0,0,0.08)',
                pb: 'env(safe-area-inset-bottom)',
                // Tab root styles
                '& .MuiTab-root': {
                    minHeight: 64,
                    height: 64,
                    flex: 1,
                    color: '#333',
                    fontWeight: 600,
                    textTransform: 'none',
                    gap: '4px',
                    borderRadius: 4,
                    mx: 0.5,
                    // Selected pill
                    '&.Mui-selected': {
                        color: '#fff',
                        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                        boxShadow: '0 8px 20px rgba(118,75,162,0.25)',
                    },
                },
                '& .MuiTabs-flexContainer': {
                    px: 1,
                    py: 0.5,
                    alignItems: 'center',
                },
            }}
        >
            <Tab
                disableRipple
                icon={<HomeIcon sx={{ fontSize: 22 }} />}
                label="Home"
            />
            <Tab
                disableRipple
                icon={<SpaceDashboardIcon sx={{ fontSize: 22 }} />}
                label="My Account"
            />
            <Tab
                disableRipple
                icon={<PanoramaIcon sx={{ fontSize: 22 }} />}
                label="AI Studio"
            />
        </Tabs>
    );
}