import { motion } from 'framer-motion';
import { Box, Typography, Button, Link, styled, alpha } from '@mui/material';


const CTAButton = styled(Button)(({ theme }) => ({
    background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold',
    padding: '15px 40px',
    borderRadius: '50px',
    textTransform: 'none',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    transition: 'all 0.3s ease',
    '&:hover': {
        background: 'linear-gradient(45deg, #FF5252, #26C6DA)',
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
    }
}));
// Styled Components
const GradientBox = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        zIndex: 1,
    }
}));

const UseCaseCard = styled(Box)(({ theme }) => ({
    background: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(10px)',
    borderRadius: 16,
    padding: theme.spacing(3),
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
    }
}));

function CTA() {
    return (
        <GradientBox>
            {/* CTA Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <Box
                    textAlign="center"
                    sx={{
                        bgcolor: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 4,
                        p: 6,
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}
                >
                    <Typography
                        variant="h4"
                        fontWeight={700}
                        color="white"
                        mb={2}
                        sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                    >
                        Ready to Transform Your Photos?
                    </Typography>
                    <Typography
                        variant="h6"
                        color="rgba(255,255,255,0.9)"
                        mb={4}
                        sx={{ maxWidth: '500px', mx: 'auto' }}
                    >
                        Join thousands who are already creating amazing edits with simple text commands
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/ai-image-editor?model=edit-image" passHref>
                            <CTAButton size="large">
                                🚀 Try AI Image Editor Free
                            </CTAButton>
                        </Link>
                        <Button
                            variant="outlined"
                            size="large"
                            sx={{
                                color: 'white',
                                borderColor: 'rgba(255,255,255,0.5)',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                padding: '12px 30px',
                                borderRadius: '50px',
                                textTransform: 'none',
                                '&:hover': {
                                    borderColor: 'white',
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                }
                            }}
                        >
                            📖 Read Blog Post
                        </Button>
                    </Box>

                    <Typography
                        variant="body2"
                        color="rgba(255,255,255,0.7)"
                        mt={3}
                    >
                        ✅ No signup required • ✅ Unlimited edits • ✅ Professional results in 10 seconds
                    </Typography>
                </Box>
            </motion.div>
        </GradientBox>
    )
}

export default CTA;