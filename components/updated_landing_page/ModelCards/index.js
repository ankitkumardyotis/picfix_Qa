import React, { useRef, useEffect, useState } from 'react';
import { Box, Card, Typography, Container, useTheme, styled, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SendIcon from '@mui/icons-material/Send';
// Sample data for AI models - replace with your actual data
const aiModels = [
    {
        id: 1,
        title: "AI Image Generator",
        description: "Generate images with AI precision",
        icon: "🎭",
        gradient: "linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)",
        image: "https://picfixcdn.com/picfix-usecase-image/generate-image/A cyberpunk girl with glowing tattoos and a robotic arm in a rainy city.jpg",
        modelKey: "generate-image"
    },
    {
        id: 2,
        title: "Hair Style",
        description: "Change the color and style of the hair to blonde",
        icon: "✨",
        gradient: "linear-gradient(135deg, #6C5CE7 0%, #45B7D1 100%)",
        image: "https://picfixcdn.com/picfix-usecase-image/hair-style/female/Random.png",
        modelKey: "hair-style"
    },
    {
        id: 3,
        title: "Professional Headshot",
        description: "Convert photo to professional headshot",
        icon: "🎯",
        gradient: "linear-gradient(135deg, #FF8C00 0%, #FF2D55 100%)",
        image: "https://picfixcdn.com/picfix-usecase-image/headshot/professional-headshot-wb2igq.jpg",
        modelKey: "headshot"
    },

    {
        id: 5,
        title: "Text/Watermark Removal",
        description: "Remove text and watermarks from images",
        icon: "🎨",
        gradient: "linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)",
        image: "https://picfixcdn.com/picfix-usecase-image/text-removal/poster from jerry.jpeg",
        modelKey: "text-removal"
    },
    {
        id: 6,
        title: "Re-imagine",
        description: "Re-imagine yourself in a new",
        icon: "📝",
        gradient: "linear-gradient(135deg, #20BF55 0%, #01BAEF 100%)",
        image: "https://picfixcdn.com/picfix-usecase-image/re-imagine/reimagine-underwater-with-full-scuba-gear-surround-cznw15.jpg",
        modelKey: "reimagine"
    },
    {
        id: 7,
        title: "Combine Images",
        description: "Add both person in one frame where both should look natural.",
        icon: "📝",
        gradient: "linear-gradient(135deg, #20BF55 0%, #01BAEF 100%)",
        image: "https://picfixcdn.com/picfix-usecase-image/combine-image/add-both-person-in-one-frame-where-both-should-loo-bstca2.jpg",
        modelKey: "combine-image"
    },


    {
        id: 9,
        title: "Restore Image",
        description: "Restore old or damaged photos automatically",
        icon: "👤",
        gradient: "linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)",
        image: "/assets/girlImg.jpg",
        modelKey: "restore-image"
    },
    {
        id: 10,
        title: "Remove Background",
        description: "Remove background from images",
        icon: "👤",
        gradient: "linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)",
        image: "/assets/remove-background.jpg",
        modelKey: "remove-background"
    },
    {
        id: 11,
        title: "Home Designer",
        description: "Design your dream home with AI",
        icon: "👤",
        gradient: "linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)",
        image: "/assets/Dream-Room.jpg",
        modelKey: "home-designer"
    }

];

const ScrollContainer = styled(Box)(({ theme }) => ({
    overflowX: 'auto',
    overflowY: 'hidden',
    whiteSpace: 'nowrap',
    WebkitOverflowScrolling: 'touch',
    scrollBehavior: 'smooth',
    padding: theme.spacing(4, 0),
    msOverflowStyle: 'none', // Hide scrollbar IE and Edge
    scrollbarWidth: 'none', // Hide scrollbar Firefox
    '&::-webkit-scrollbar': {
        display: 'none', // Hide scrollbar Chrome, Safari, Opera
    },
    // CSS Animation for auto-scroll
    '&:hover .scroll-content': {
        animationPlayState: 'paused',
    },
}));

const ScrollContent = styled(Box)({
    display: 'inline-flex',
    gap: '32px', // Consistent spacing between cards
    // Animation applied to content, not container
    animation: 'autoScroll 40s linear infinite',
    // Define the keyframes for auto-scroll
    '@keyframes autoScroll': {
        '0%': {
            transform: 'translateX(0)',
        },
        '100%': {
            transform: 'translateX(calc(-250px * 11 - 32px * 10))', // Move by exact width of all original cards plus gaps
        },
    },
});

const NavigationContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '2rem',
    position: 'relative',
});

const ArrowButton = styled(IconButton)(({ theme, disabled }) => ({
    width: '50px',
    height: '50px',
    background: 'linear-gradient(135deg,rgb(251,1,118) 0%, #d76d77 50%, #fbc901 100%)',
    borderRadius: '50%',
    transition: 'all 0.5s ease',
    cursor: disabled ? 'not-allowed' : 'pointer',
    color: 'white',

    '&:hover': {
        background: 'linear-gradient(135deg, #2d0e5e 0%, #b94e5e 50%, #e68a4a 100%)',
        boxShadow: '0 4px 16px rgba(58,28,113,0.12)',
    },
    '&:active': {
        transform: disabled ? 'none' : 'translateY(0px)',
    },

    '& .MuiSvgIcon-root': {
        fontSize: '1.2rem',
    },
}));

const ModelCard = styled(motion(Card))(({ theme, gradient }) => ({
    display: 'inline-block',
    width: '250px',
    height: '300px',
    margin: 0, // Remove margin, use gap instead
    padding: theme.spacing(0),
    background: gradient,
    borderRadius: theme.spacing(2),
    whiteSpace: 'normal',
    verticalAlign: 'top',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    flexShrink: 0, // Prevent cards from shrinking

    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
        zIndex: 1,
    },

    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 15px 30px rgba(0,0,0,0.2)',
        '& .card-content': {
            transform: 'translateY(-10px)',
        },
    },
}));

const CardImage = styled('img')({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
});

const CardContent = styled(Box)({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '1rem',
    zIndex: 2,
    transition: 'transform 0.3s ease',
});



const ModelCards = () => {
    const router = useRouter();
    const scrollContainerRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const handleModelClick = (modelKey) => {
        router.push(`/ai-image-editor?model=${modelKey}`);
    };

    const checkScrollability = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const { scrollLeft, scrollWidth, clientWidth } = container;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    };

    const scrollLeft = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const cardWidth = 250 + 32; // card width + margin
        const scrollAmount = cardWidth * 2; // scroll 2 cards at a time
        container.scrollLeft -= scrollAmount;
    };

    const scrollRight = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const cardWidth = 250 + 32; // card width + margin
        const scrollAmount = cardWidth * 2; // scroll 2 cards at a time
        container.scrollLeft += scrollAmount;
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleWheel = (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                container.scrollLeft += e.deltaY;
            }
        };

        const handleScroll = () => {
            checkScrollability();
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        container.addEventListener('scroll', handleScroll);

        // Initial check
        checkScrollability();

        return () => {
            container.removeEventListener('wheel', handleWheel);
            container.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Check scrollability on resize
    useEffect(() => {
        const handleResize = () => {
            setTimeout(checkScrollability, 100);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <Box sx={{ py: 8, background: '#f5f5f5' }}>
            <Container maxWidth="lg">
                <Typography
                    variant="h2"
                    sx={{
                        fontSize: { xs: '2rem', md: '2.5rem' },
                        fontWeight: 700,
                        textAlign: 'center',
                        // mb: 2,
                        color: '#333',
                        textTransform: 'uppercase',
                        letterSpacing: '0.01em',
                        fontFamily: 'sans-serif',
                    }}
                >
                    Our AI Models
                </Typography>

                <Typography
                    variant="h6"
                    sx={{
                        textAlign: 'center',
                        // mb: 2,
                        color: '#666',
                        maxWidth: '800px',
                        mx: 'auto',
                        fontSize: '1.2rem',
                        lineHeight: 1.8,
                    }}
                >
                    Discover our powerful AI models that transform your photos in seconds.

                </Typography>

                <ScrollContainer ref={scrollContainerRef}>
                    <ScrollContent className="scroll-content">
                        {/* First set of cards */}
                        {aiModels.map((model) => (
                            <ModelCard
                                key={model.id}
                                gradient={model.gradient}
                                component={motion.div}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleModelClick(model.modelKey)}
                            >
                                <CardImage
                                    src={model.image}
                                    alt={model.title}
                                    loading="lazy"
                                    referrerPolicy='no-referrer'
                                />
                                <CardContent className="card-content">
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: 'white',
                                            // mb: 2,
                                            fontWeight: 600,
                                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                        }}
                                    >
                                        {model.title}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            color: 'rgba(255,255,255,0.8)',
                                            fontSize: '.9rem',
                                            lineHeight: 1.4,
                                            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                        }}
                                    >
                                        {model.description}
                                    </Typography>
                                </CardContent>
                            </ModelCard>
                        ))}
                        {/* Duplicate set for seamless loop */}
                        {aiModels.map((model) => (
                            <ModelCard
                                key={`duplicate-${model.id}`}
                                gradient={model.gradient}
                                component={motion.div}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleModelClick(model.modelKey)}
                            >
                                <CardImage
                                    src={model.image}
                                    alt={model.title}
                                    loading="lazy"
                                    referrerPolicy='no-referrer'
                                />
                                <CardContent className="card-content">
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: 'white',
                                            // mb: 2,
                                            fontWeight: 600,
                                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                        }}
                                    >
                                        {model.title}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            color: 'rgba(255,255,255,0.8)',
                                            fontSize: '.9rem',
                                            lineHeight: 1.4,
                                            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                        }}
                                    >
                                        {model.description}
                                    </Typography>
                                </CardContent>
                            </ModelCard>
                        ))}
                    </ScrollContent>
                </ScrollContainer>

                <NavigationContainer>
                    <ArrowButton
                        onClick={scrollLeft}
                        disabled={!canScrollLeft}
                        component={motion.button}
                        whileHover={{ scale: !canScrollLeft ? 1 : 1.1 }}
                        whileTap={{ scale: !canScrollLeft ? 1 : 0.95 }}

                    >
                        <SendIcon sx={{ transform: 'rotate(180deg)' }} />
                    </ArrowButton>

                    <ArrowButton
                        onClick={scrollRight}
                        disabled={!canScrollRight}
                        component={motion.button}
                        whileHover={{ scale: !canScrollRight ? 1 : 1.1 }}
                        whileTap={{ scale: !canScrollRight ? 1 : 0.95 }}
                    >
                        <SendIcon />
                    </ArrowButton>
                </NavigationContainer>
            </Container>
        </Box>
    );
};

export default ModelCards;