import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, useTheme, Snackbar, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import Image from 'next/image';
import { useRouter } from 'next/router';

const GradientBackground = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)',
    position: 'relative',
    overflow: 'hidden',
    padding: theme.spacing(4, 0),
}));

const CenterPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(6, 4),
    borderRadius: theme.spacing(4),
    backgroundColor: 'rgba(255,255,255,0.95)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.10)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: 620,
    width: '100%',
    zIndex: 2,
}));

const ThemedButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(3),
    background: 'linear-gradient(135deg,rgb(251,1,118) 0%, #d76d77 50%, #fbc901 100%)',
    color: 'white',
    fontWeight: 600,
    padding: theme.spacing(1.5, 4),
    borderRadius: theme.spacing(1.5),
    fontSize: '1.1rem',
    boxShadow: '0 10px 30px rgba(45, 125, 50, 0.15)',
    textTransform: 'none',
    '&:hover': {
        background: 'linear-gradient(135deg,rgb(251,1,118) 0%, #d76d77 50%, #fbc901 100%)',
        color: 'white',
    },
}));

export default function Custom404() {
    const router = useRouter();
    const theme = useTheme();
    const [countdown, setCountdown] = useState(3);
    const [openSnackbar, setOpenSnackbar] = useState(true);

    useEffect(() => {
        const countdownInterval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        const timeout = setTimeout(() => {
            router.push("/ai-image-editor");
        }, 3000);   

        return () => {
            clearTimeout(timeout);
            clearInterval(countdownInterval);
        };
    }, []);

    return (
        <GradientBackground>
            <Snackbar 
                open={openSnackbar} 
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{ mt: 2 }}
            >
                <Alert severity="info" sx={{ width: '100%', fontSize: '1rem' }}>
                    Redirecting to AI Studio in {countdown} second{countdown !== 1 ? 's' : ''}...
                </Alert>
            </Snackbar>
            <CenterPaper elevation={6}>
                <Image
                    src="/assets/PicFixAILogo.jpg"
                    alt="PicFix AI Logo"
                    width={120}
                    height={30}
                    style={{ marginBottom: 24, borderRadius: 4 }}
                />

                <Typography variant="h1" sx={{ fontSize: { xs: '3rem', md: '4rem' }, fontWeight: 800, color: '#3a1c71', mb: 1 }}>
                    404
                </Typography>
                <Typography variant="h5" sx={{ mb: 2, color: '#d76d77', fontWeight: 700 }}>
                    Oops! Page Not Found
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: '#333', fontWeight: 400 }}>
                    The page you are looking for doesn&apos;t exist or has been moved.<br />
                    Let&apos;s get you back to editing amazing photos!
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <ThemedButton
                        variant="contained"
                        onClick={() => router.push('/')}
                    >
                        Home
                    </ThemedButton>
                    <ThemedButton
                        variant="contained"
                        onClick={() => router.push('/ai-image-editor')}
                    >
                        AI Studio
                    </ThemedButton>
                </Box>
            </CenterPaper>
            {/* Soft background decorations for theme */}
            <Box sx={{
                position: 'absolute',
                top: '10%',
                left: '10%',
                width: 200,
                height: 200,
                background: 'radial-gradient(circle, rgba(255, 165, 0, 0.3) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(60px)',
                zIndex: 1,
            }} />
            <Box sx={{
                position: 'absolute',
                bottom: '10%',
                right: '10%',
                width: 300,
                height: 300,
                background: 'radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(80px)',
                zIndex: 1,
            }} />
        </GradientBackground>
    );
}
