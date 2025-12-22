import React from 'react';
import { Box, Container, Button, Typography, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import Masonry from '@mui/lab/Masonry';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Link from 'next/link';

const images = [
    "https://picfixcdn.com/picfix-usecase-image/generate-image/A futuristic city at sunset with flying cars and neon lights.jpg",
    "https://picfixcdn.com/picfix-usecase-image/generate-image/A fantasy castle floating above the clouds with dragons flying around.jpg",
    "https://picfixcdn.com/picfix-usecase-image/generate-image/A peaceful beach with crystal clear water, palm trees, and a hammock.jpg",
    "https://picfixcdn.com/picfix-usecase-image/headshot/a-girl-on-beach-wearing-hat-professional-headshot.jpg",
    "https://picfixcdn.com/picfix-usecase-image/headshot/a-girl-closeup-shot-professional-headshot.png",
    "https://picfixcdn.com/picfix-usecase-image/hair-style/male/high-ponytail.jpg",
    "https://picfixcdn.com/picfix-usecase-image/re-imagine/reimagine-underwater-with-full-scuba-gear-surround-cznw15.jpg",
    "https://picfixcdn.com/picfix-usecase-image/re-imagine/Floating in space as an astronaut.png"
];

// Responsive height arrays for different screen sizes
const getResponsiveHeights = (isMobile, isTablet) => {
    if (isMobile) {
        return [200, 180, 220, 180, 180, 240, 270, 240, 300]; 
    } else if (isTablet) {
        return [250, 220, 280, 220, 220, 300, 330, 300, 350]; 
    }
    return [350, 300, 390, 300, 300, 400, 450, 400, 500]; 
};

const GalleryContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(6, 0, 10, 0),
    position: 'relative',
    overflow: 'hidden',
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(4, 0, 8, 0),
    },
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(3, 0, 6, 0),
    },
}));

const StyledMasonry = styled(Masonry)({
    margin: 0,
});

const ImageWrapper = styled(motion.div)(({ theme }) => ({
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    '& img': {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
    },
    '&:hover': {
        '& .overlay': {
            opacity: 1,
        }
    },
    [theme.breakpoints.down('sm')]: {
        '&:active': {
            '& .overlay': {
                opacity: 1,
            }
        }
    }
}));

const ImageOverlay = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '20px',
    className: 'overlay',
    [theme.breakpoints.down('sm')]: {
        padding: '12px',
    },
}));

const StyledButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(4),
    // backgroundColor: 'rgba(255, 255, 255, 0.9)',
    background: 'linear-gradient(135deg,rgb(251,1,118) 0%, #d76d77 50%, #fbc901 100%)',
    '&:hover': {
        background: 'linear-gradient(135deg, #2d0e5e 0%, #b94e5e 50%, #e68a4a 100%)',
        boxShadow: '0 4px 16px rgba(58,28,113,0.12)',
    },
    color: 'white',
    fontWeight: 600,
    padding: theme.spacing(1.5, 4),
    borderRadius: theme.spacing(1),
    textTransform: 'none',
    fontSize: '1.1rem',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    // '&:hover': {
    //     backgroundColor: 'white',
    //     transform: 'translateY(-2px)',
    //     boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
    // },
    transition: 'all 0.3s ease',
    [theme.breakpoints.down('md')]: {
        fontSize: '1rem',
        padding: theme.spacing(1.25, 3),
        marginTop: theme.spacing(3),
    },
    [theme.breakpoints.down('sm')]: {
        fontSize: '0.9rem',
        padding: theme.spacing(1, 2.5),
        marginTop: theme.spacing(2.5),
    },
}));

const Gallery = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    
    // Get responsive columns based on screen size
    const getColumns = () => {
        if (isMobile) return 2;
        if (isTablet) return 3;
        return 4;
    };

    // Get responsive spacing based on screen size
    const getSpacing = () => {
        if (isMobile) return 0.25;
        if (isTablet) return 0.4;
        return 0.5;
    };

    const responsiveHeights = getResponsiveHeights(isMobile, isTablet);

    return (
        <GalleryContainer>
            <Container maxWidth="lg">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: { 
                                xs: '1.75rem', 
                                sm: '2rem', 
                                md: '2.25rem', 
                                lg: '2.5rem' 
                            },
                            fontWeight: 700,
                            textAlign: 'center',
                            mb: { xs: 3, sm: 3.5, md: 4 },
                            color: 'black',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            lineHeight: { xs: 1.2, sm: 1.3, md: 1.4 },
                        }}
                    >
                        Platform Creations
                    </Typography>
                </motion.div>

                <StyledMasonry 
                    columns={getColumns()} 
                    spacing={getSpacing()}
                    sx={{
                        px: { xs: 1, sm: 1.5, md: 2 },
                    }}
                >
                    {images.map((image, index) => (
                        <ImageWrapper
                            key={index}
                            component={motion.div}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <img
                                src={image}
                                alt={`Gallery image ${index + 1}`}
                                loading="lazy"
                                style={{
                                    borderRadius: 0,
                                    display: 'block',
                                    width: '100%',
                                    height: responsiveHeights[index] + 'px',
                                    objectFit: 'cover',
                                }}
                                referrerPolicy='no-referrer'
                            />
                            <ImageOverlay>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'white',
                                        fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                                        fontWeight: 500,
                                        lineHeight: 1.2,
                                    }}
                                >
                                    Created with PicFix.AI
                                </Typography>
                            </ImageOverlay>
                        </ImageWrapper>
                    ))}
                </StyledMasonry>
                <Link href="/gallery" style={{ textDecoration: 'none' }}>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    px: { xs: 2, sm: 3, md: 0 }
                }}>
                    <StyledButton
                        component={motion.button}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        View Full Gallery
                    </StyledButton>
                </Box>
                </Link>
            </Container>
        </GalleryContainer>
    );
};

export default Gallery;
