import React, { useState, useRef, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Container, 
    useTheme, 
    useMediaQuery,
    Chip,
    Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { blogPosts } from '../../../data/blogPosts';

// Featured blog post (first one)
const featuredPost = blogPosts[0];
// Other posts for the mini section
const miniPosts = blogPosts.slice(1, 4);

const MiniBlogContainer = styled(Box)(({ theme }) => ({
    // background:  'linear-gradient(135deg,rgb(228, 217, 248) 0%,rgb(244, 172, 179) 50%,rgb(247, 214, 193) 100%)',
    background:  'linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)',
    position: 'relative',
    overflow: 'hidden',
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(10),
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.1)',
        zIndex: 1,
    }
}));

const FloatingDecoration = styled(Box)({
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    filter: 'blur(40px)',
    animation: 'float 6s ease-in-out infinite',
    '@keyframes float': {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-20px)' },
    },
});

const FeaturedArticle = styled(motion.div)(({ theme }) => ({
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: theme.spacing(3),
    overflow: 'hidden',
    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(20px)',
    cursor: 'pointer',
    zIndex: 3,
    // top: '30px',
}));

const FeaturedImageWrapper = styled(Box)({
    height: '300px',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6))',
        zIndex: 1,
    },
});

const StyledImage = styled(Image)({
    objectFit: 'cover',
});

const MiniPostContainer = styled(motion.div)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    cursor: 'pointer',
    overflow: 'hidden',
    position: 'relative',
    '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '4px',
        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
    }
}));

const MiniPostImage = styled(Box)({
    width: '80px',
    height: '80px',
    borderRadius: '12px',
    flexShrink: 0,
    marginRight: '16px',
    overflow: 'hidden',
    '& img': {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    }
});

const ScrollContainer = styled(Box)({
    maxHeight: '500px',
    overflowY: 'auto',
    paddingRight: '8px',
    msOverflowStyle: 'none', // Hide scrollbar IE and Edge
    scrollbarWidth: 'none', // Hide scrollbar Firefox
    '&::-webkit-scrollbar': {
        display: 'none', // Hide scrollbar Chrome, Safari, Opera
    },
});

const CategoryTag = styled(Chip)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(2),
    left: theme.spacing(2),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#333',
    fontWeight: 600,
    fontSize: '0.75rem',
    zIndex: 2,
}));

const MiniBlog = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [hoveredPost, setHoveredPost] = useState(null);

    return (
        <MiniBlogContainer>
            {/* Floating decorations */}
            <FloatingDecoration 
                sx={{ 
                    top: '20%', 
                    left: '10%', 
                    width: '100px', 
                    height: '100px',
                    animationDelay: '0s'
                }} 
            />
            <FloatingDecoration 
                sx={{ 
                    top: '60%', 
                    right: '15%', 
                    width: '150px', 
                    height: '150px',
                    animationDelay: '2s'
                }} 
            />
            <FloatingDecoration 
                sx={{ 
                    bottom: '30%', 
                    left: '20%', 
                    width: '80px', 
                    height: '80px',
                    animationDelay: '4s'
                }} 
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: { xs: '2rem', md: '2.5rem' },
                            fontWeight: 700,
                            textAlign: 'center',
                            mb: 1,
                            color: 'white',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        }}
                    >
                        Latest Insights
                    </Typography>
                    
                    <Typography
                        variant="h6"
                        sx={{
                            textAlign: 'center',
                            mb: 6,
                            color: 'rgba(255, 255, 255, 0.9)',
                            maxWidth: '600px',
                            mx: 'auto',
                            fontSize: '1.1rem',
                            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                        }}
                    >
                        Discover the latest trends and tips in AI photo enhancement
                    </Typography>
                </motion.div>

                <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
                    gap: 2,
                    alignItems: 'start'
                }}>
                    {/* Featured Article */}
                    <Link href={`/blog/${featuredPost.slug}`} style={{ textDecoration: 'none' }}>
                        <FeaturedArticle
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            viewport={{ once: true }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FeaturedImageWrapper>
                                <StyledImage
                                    src={featuredPost.image}
                                    alt={featuredPost.title}
                                    fill
                                    priority
                                    sizes="(max-width: 768px) 100vw, 66vw"
                                />
                                <CategoryTag label={featuredPost.category} sx={{ zIndex: 2 }} />
                                <Box sx={{ p: 3, width: '100%', position: 'relative', zIndex: 2 }}>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            color: 'white',
                                            fontWeight: 700,
                                            mb: 1,
                                            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                            fontSize: { xs: '1.5rem', md: '2rem' }
                                        }}
                                    >
                                        {featuredPost.title}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.9)',
                                            fontSize: '0.9rem',
                                            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                                        }}
                                    >
                                        {featuredPost.date}
                                    </Typography>
                                </Box>
                            </FeaturedImageWrapper>
                            
                            <Box sx={{ p: 3 }}>
                                <Typography
                                    sx={{
                                        color: '#666',
                                        fontSize: '1rem',
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {featuredPost.description}
                                </Typography>
                            </Box>
                        </FeaturedArticle>
                    </Link>

                    {/* Mini Posts Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        viewport={{ once: true }}
                    >
                        {/* <Typography
                            variant="h5"
                            sx={{
                                color: 'white',
                                fontWeight: 600,
                                // mb: 3,
                                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                            }}
                        >
                            More Articles
                        </Typography> */}
                        
                        <ScrollContainer>
                            {miniPosts.map((post, index) => (
                                <Link 
                                    key={post.slug} 
                                    href={`/blog/${post.slug}`} 
                                    style={{ textDecoration: 'none' }}
                                >
                                    <MiniPostContainer
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        whileHover={{ 
                                            scale: 1.02,
                                            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)'
                                        }}
                                        onHoverStart={() => setHoveredPost(post.slug)}
                                        onHoverEnd={() => setHoveredPost(null)}
                                    >
                                        <MiniPostImage>
                                            <img 
                                                src={post.image} 
                                                alt={post.title}
                                                loading="lazy"
                                            />
                                        </MiniPostImage>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Chip 
                                                label={post.category}
                                                size="small"
                                                sx={{ 
                                                    mb: 1, 
                                                    fontSize: '0.7rem',
                                                    height: '20px',
                                                    backgroundColor: 'rgba(78, 205, 196, 0.2)',
                                                    color: '#4ecdc4',
                                                }}
                                            />
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontSize: '0.95rem',
                                                    fontWeight: 600,
                                                    color: '#333',
                                                    mb: 0.5,
                                                    lineHeight: 1.3,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {post.title}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: '0.75rem',
                                                    color: '#888',
                                                }}
                                            >
                                                {post.date}
                                            </Typography>
                                        </Box>
                                    </MiniPostContainer>
                                </Link>
                            ))}
                        </ScrollContainer>

                        <Link href="/blog" style={{ textDecoration: 'none' }}>
                            <Button
                                variant="contained"
                                sx={{
                                    mt: 3,
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    color: '#333',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    px: 3,
                                    py: 1,
                                    backdropFilter: 'blur(10px)',
                                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                    '&:hover': {
                                        backgroundColor: 'white',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
                                    },
                                    transition: 'all 0.3s ease',
                                }}
                                component={motion.button}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                View All Articles
                            </Button>
                        </Link>
                    </motion.div>
                </Box>
            </Container>
        </MiniBlogContainer>
    );
};

export default MiniBlog;
