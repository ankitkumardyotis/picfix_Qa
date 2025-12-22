import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box,
    Typography,
    Button,
    Paper,
    Chip,
    Container,
    Grid,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';
const prompts = [
    "A futuristic city at sunset with neon lights.",
    "Change the color of the hair to blonde.",
    "Convert photo to professional headshot.",
    "Imagine Yourself as a bungee jumper from a helicopter."
];

const images = [
    "https://picfixcdn.com/picfix-usecase-image/generate-image/A futuristic city at sunset with neon lights.jpg",
    "https://picfixcdn.com/picfix-usecase-image/hair-style/female/Random.png",
    "https://picfixcdn.com/picfix-usecase-image/generate-image/A well-groomed man in his 30s, wearing a tailored navy blue suit, standing confidently with a soft smile in a modern office, natural lighting, professional portrait style.jpg",
    "https://picfixcdn.com/picfix-usecase-image/re-imagine/Floating in space as an astronaut.png"
];
const model_name = [
    "Generate Image",
    "Hair Style",
    "Headshot",
    "Reimagine",
]

// Styled components
const HeroContainer = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    padding: theme.spacing(4, 0),
    paddingTop: '70px',
}));

const BackgroundDecoration = styled(Box)({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
    '&::before': {
        content: '""',
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(255, 165, 0, 0.6) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(0, 255, 255, 0.6) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(80px)',
    },
});

const MiddleDecoration = styled(Box)({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(255, 192, 203, 0.4) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(100px)',
});

const InputBox = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    marginBottom: theme.spacing(2.5),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
}));

const ImageContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.spacing(3),
    overflow: 'hidden',
    aspectRatio: '4/3',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
    // backgroundColor: '#2d7d32',
    // background: 'linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)',
    color: 'white',
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(1),
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    width: '40%',
    boxShadow: '0 10px 30px rgba(45, 125, 50, 0.3)',
    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
    color: 'white',
    '&:hover': {
        background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
        transform: 'scale(1.1)',
    },
    transition: 'all 0.3s ease',
}));

const TypewriterText = styled(Box)(({ theme }) => ({
    fontFamily: 'monospace',
    fontSize: '1.1rem',
    color: '#666',
    border: '1px solid #ececec',
    borderRadius: '10px',
    padding: '10px',
    minHeight: '28px',
    display: 'flex',
    alignItems: 'center',
}));

const EnhancedChip = styled(Chip)(({ theme }) => ({
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: '#333',
    fontWeight: 600,
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
}));

const StatusIndicator = styled(Box)(({ theme }) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    marginRight: theme.spacing(1),
    animation: 'blink 2s infinite',
    '@keyframes blink': {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.5 },
    },
}));

const BlinkingCursor = styled(Box)(({ theme }) => ({
    width: 2,
    height: 20,
    backgroundColor: '#333',
    marginLeft: theme.spacing(0.5),
    animation: 'blink 1s infinite',
    '@keyframes blink': {
        '0%, 50%': { opacity: 1 },
        '51%, 100%': { opacity: 0 },
    },
}));

const PhotoAIHero = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayText, setDisplayText] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const router = useRouter();
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % prompts.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setDisplayText('');
        setIsTyping(true);
        const currentPrompt = prompts[currentIndex];
        let index = 0;

        const typeInterval = setInterval(() => {
            if (index < currentPrompt.length) {
                setDisplayText(currentPrompt.substring(0, index + 1));
                index++;
            } else {
                setIsTyping(false);
                clearInterval(typeInterval);
            }
        }, 50);

        return () => clearInterval(typeInterval);
    }, [currentIndex]);

    return (
        <HeroContainer>
            <BackgroundDecoration />
            <MiddleDecoration />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                <Grid container spacing={6} alignItems="center">
                    {/* Left Section */}
                    <Grid item xs={12} md={6}>
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: '2rem', md: '3rem', lg: '3.5rem' },
                                    fontWeight: 800,
                                    lineHeight: 1,
                                    marginBottom: 1,
                                    color: 'white',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                }}
                            >
                                Transform Your{' '}
                                <Box component="span" sx={{
                                    background: 'linear-gradient(135deg,rgb(244,0,123) 0%, #d76d77 50%, #ff8418 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}>
                                    Photos
                                </Box>{' '}
                                with{' '}
                                <Box component="span" sx={{
                                    background: 'linear-gradient(135deg,rgb(254,198,0) 0%, #d76d77 100%,rgb(244,0,123) 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    fontWeight: 800,
                                }}>
                                    AI
                                </Box>
                            </Typography>

                            <Typography
                                variant="h6"
                                sx={{
                                    fontSize: { xs: '1.1rem', md: '1.3rem' },
                                    fontWeight: 400,
                                    color: 'white',
                                    opacity: 0.9,
                                    lineHeight: 1.2,
                                    marginBottom: 2,
                                    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                }}
                            >
                                Edit photos like a pro in seconds. Remove backgrounds, Create headshots, and Generate new photos using powerful AI studio tools.
                            </Typography>
                            <InputBox elevation={3}>
                                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                                    <StatusIndicator sx={{ backgroundColor: '#4ecdc4' }} />
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#4ecdc4',
                                            fontWeight: 600,
                                        }}
                                    >
                                        What would you like to do?
                                    </Typography>
                                </Box>

                                <TypewriterText>
                                    {displayText}
                                    {isTyping && <BlinkingCursor />}
                                </TypewriterText>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <StatusIndicator sx={{ backgroundColor: '#4caf50' }} />
                                        <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 600 }}>
                                            AI Processing
                                        </Typography>
                                    </Box>
                                    <Button 
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            color: theme => theme.palette.mode === 'dark' ? '#fff' : '#4caf50',
                                            borderColor: theme => theme.palette.mode === 'dark' ? '#fff' : '#4caf50',
                                            fontWeight: 600,
                                            textTransform: "none",
                                            borderRadius: "12px",
                                            px: 2,
                                            py: 0.5,
                                            minWidth: "90px",
                                            fontSize: "0.94rem",
                                            ml: 1,
                                            '&:hover': {
                                                borderColor: theme => theme.palette.mode === 'dark' ? '#8bc34a' : '#388e3c'
                                            }
                                        }}
                                        onClick={() => router.push('/ai-image-editor')}
                                    >
                                        Free to try
                                    </Button>
                                </Box>
                            </InputBox>
                            {!isMobile &&
                                <StyledButton
                                    variant="contained"
                                    size="medium"
                                    startIcon={<span style={{ fontSize: '1.2rem' }}>🎨</span>}
                                    component={motion.button}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.push('/ai-image-editor?model=gfp-restore')}
                                >
                                    Try PicFix AI Free
                                </StyledButton>}
                        </motion.div>
                    </Grid>

                    {/* Right Section */}
                    <Grid item xs={12} md={6} sx={{ marginTop: isMobile ? '-50px' : '0px' }}>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >

                            <ImageContainer>
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={currentIndex}
                                        src={images[currentIndex]}
                                        alt="AI Enhanced Photo"
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.5 }}
                                        style={{
                                            width: '100%',
                                            // height: '100%',
                                            // objectFit: 'cover',

                                        }}
                                        referrerPolicy='no-referrer'
                                    />
                                </AnimatePresence>

                                <EnhancedChip
                                    label={`✨  ${model_name[currentIndex]}`}
                                    size="small"
                                />
                            </ImageContainer>
                            {isMobile &&
                                <StyledButton

                                    sx={{ marginTop: '10px', width: '100%' }}
                                    variant="contained"
                                    size="medium"
                                    startIcon={<span style={{ fontSize: '1.2rem' }}>🎨</span>}
                                    component={motion.button}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.push('/ai-image-editor')}
                                >
                                    Try PicFix AI Free
                                </StyledButton>}
                        </motion.div>
                    </Grid>
                </Grid>
            </Container>
        </HeroContainer>
    );
};

export default PhotoAIHero;