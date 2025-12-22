import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Chip,
  useTheme,
  useMediaQuery,
  styled,
  alpha
} from '@mui/material';
import { motion } from 'framer-motion';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EditIcon from '@mui/icons-material/Edit';
import SpeedIcon from '@mui/icons-material/Speed';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import BrushIcon from '@mui/icons-material/Brush';
import Link from 'next/link';

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

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  borderRadius: 20,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  }
}));


const AnimatedChip = styled(Chip)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
  color: 'white',
  fontWeight: 'bold',
  animation: 'pulse 2s infinite',
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
    },
    '50%': {
      transform: 'scale(1.05)',
    },
    '100%': {
      transform: 'scale(1)',
    },
  }
}));


const AIImageEditingSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      icon: <EditIcon sx={{ fontSize: 40, color: '#FF6B6B' }} />,
      title: 'Text-to-Edit Magic',
      description: 'Simply describe what you want to change in plain English. "Make person taller", "Change shirt to red", "Remove background object"',
      benefit: 'No Photoshop skills needed'
    },
    {
      icon: <SmartToyIcon sx={{ fontSize: 40, color: '#4ECDC4' }} />,
      title: 'Google Nano Banana AI',
      description: 'Powered by Google\'s latest AI model that understands context and delivers professional-quality edits instantly',
      benefit: 'Enterprise-grade AI technology'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: '#FFD93D' }} />,
      title: 'Lightning Fast Results',
      description: 'Get professional edits in under 10 seconds. What used to take hours in Photoshop now happens instantly',
      benefit: 'Save 95% of your time'
    }
  ];


  return (
    <GradientBox sx={{ py: { xs: 8, md: 12 }, position: 'relative', zIndex: 2 }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Box textAlign="center" mb={8}>
            <AnimatedChip 
              label="🚀 NEW: AI Image Editing" 
              sx={{ mb: 3, fontSize: '14px', px: 2, py: 1 }}
            />
            
            <Typography 
              variant={isMobile ? "h3" : "h2"} 
              fontWeight={700}
              color="white"
              mb={3}
              sx={{ 
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                lineHeight: 1.2
              }}
            >
              Edit Photos with
              <Box component="span" sx={{ 
                background: 'linear-gradient(45deg, #FFD93D, #FF6B6B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'block',
                mt: 1
              }}>
                Plain English Commands
              </Box>
            </Typography>
            
            <Typography 
              variant="h5" 
              color="rgba(255,255,255,0.9)"
              mb={4}
              sx={{ maxWidth: '700px', mx: 'auto', lineHeight: 1.6 }}
            >
              Powered by Google's Nano Banana AI - Just type what you want changed and watch the magic happen in seconds
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
              <Chip label="✨ No Photoshop Required" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }} />
              <Chip label="⚡ 10 Second Results" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }} />
              <Chip label="🆓 Completely Free" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }} />
            </Box>
          </Box>
        </motion.div>

        {/* Features Grid */}
        <Grid container spacing={4} mb={8}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <FeatureCard
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  sx={{
                    transform: hoveredFeature === index ? 'translateY(-8px)' : 'translateY(0)',
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box mb={3}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" fontWeight={700} mb={2} color="text.primary">
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mb={3} lineHeight={1.6}>
                      {feature.description}
                    </Typography>
                    <Chip 
                      label={feature.benefit}
                      sx={{ 
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        fontWeight: 'bold'
                      }}
                    />
                  </CardContent>
                </FeatureCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </GradientBox>
  );
};

export default AIImageEditingSection;
