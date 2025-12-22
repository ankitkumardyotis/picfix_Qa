import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, useMediaQuery } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import Link from 'next/link';
import { blogPosts } from '../../data/blogPosts';




export const metadata = {
    title: "AI Photo Enhancement & Restoration Blog | PicFix.AI",
    description: "Discover the latest in AI photo enhancement, restoration techniques, and tips for bringing your old photos back to life with PicFix.AI's advanced technology.",
    keywords: "ai photo enhancer, photo enhancer, restore old photos, photo quality enhancer, image enhancer ai",
};

export default function BlogPage() {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));


    const sortedPosts = [...blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    minHeight: '100vh',
                    // backgroundColor: '#f5f5f5',
                    // background: 'linear-gradient(to bottom right, #4fd1c5, #a7f3d0, #fde68a)',
                    py: 8,
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ maxWidth: '58rem', mx: 'auto', mb: 6, textAlign: 'center' }}>
                        <Typography variant={matches ? 'h4' : 'h5'} fontWeight={600} sx={{ lineHeight: '1em', mt: 4, mb: 1 }}>
                            Photo Enhancement & Restoration Blog
                        </Typography>
                        <Typography variant="h5" color="text.secondary">
                            Expert insights, tips, and tutorials on AI-powered photo enhancement and restoration
                        </Typography>
                    </Box>
                    <Grid container spacing={4}>
                        {sortedPosts.map((post) => (
                            <Grid item key={post.slug} xs={12} sm={6} md={4} p={0}>
                                <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                                    <Card sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 6 } }}>
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={post.image}
                                            alt={post.title}
                                        />
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Typography gutterBottom variant="overline" component="div" color="text.secondary">
                                                {post.category} • {post.date}
                                            </Typography>
                                            <Typography gutterBottom variant="h5" fontWeight={600} component="h2">
                                                {post.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {post.description}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>
        </ThemeProvider>
    );
}

