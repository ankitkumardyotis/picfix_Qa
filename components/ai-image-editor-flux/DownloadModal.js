import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Button,
  Grid,
  alpha,
  useTheme,
  styled,
  useMediaQuery,
  Divider,
  Stack,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import StarIcon from '@mui/icons-material/Star';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import DiamondIcon from '@mui/icons-material/Diamond';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: '90vw',
    maxHeight: '90vh',
    width: '800px',
    borderRadius: theme.spacing(3),
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    backdropFilter: 'blur(16px)',
    [theme.breakpoints.down('md')]: {
      width: '95vw',
      maxWidth: '95vw',
      maxHeight: '95vh',
      borderRadius: theme.spacing(2),
      margin: theme.spacing(1),
    },
  },
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(8px)',
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(3, 4),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(255,255,255,0.95) 100%)',
  backdropFilter: 'blur(20px)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2, 3),
  },
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(4),
  background: 'transparent',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
}));

const ImagePreviewContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(16px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  '& img': {
    width: '100%',
    height: 'auto',
    maxHeight: '400px',
    objectFit: 'contain',
    display: 'block',
  },
  [theme.breakpoints.down('md')]: {
    '& img': {
      maxHeight: '300px',
    },
  },
}));

const ActionButton = styled(Button)(({ theme, variant: buttonVariant }) => ({
  borderRadius: theme.spacing(2),
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  padding: theme.spacing(2, 3),
  minHeight: '56px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  ...(buttonVariant === 'watermark' && {
    background: 'linear-gradient(135deg, #64B5F6 0%, #42A5F5 50%, #2196F3 100%)',
    color: 'white',
    border: 'none',
    '&:hover': {
      background: 'linear-gradient(135deg, #42A5F5 0%, #2196F3 50%, #1976D2 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)',
    },
  }),
  ...(buttonVariant === 'premium' && {
    background: 'linear-gradient(135deg, rgb(251,1,118) 0%, #d76d77 50%, #fbc901 100%)',
    color: 'white',
    border: 'none',
    '&:hover': {
      background: 'linear-gradient(135deg, #2d0e5e 0%, #b94e5e 50%, #e68a4a 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(251, 1, 118, 0.3)',
    },
  }),
  [theme.breakpoints.down('md')]: {
    fontSize: '0.9rem',
    padding: theme.spacing(1.5, 2.5),
    minHeight: '48px',
  },
}));

const WatermarkChip = styled(Chip)(({ theme }) => ({
  background: 'linear-gradient(135deg, #FFE082 0%, #FFD54F 100%)',
  color: theme.palette.text.primary,
  fontWeight: 600,
  '& .MuiChip-icon': {
    color: '#FF8F00',
  },
}));

const PremiumChip = styled(Chip)(({ theme }) => ({
  background: 'linear-gradient(135deg, #E1BEE7 0%, #BA68C8 100%)',
  color: 'white',
  fontWeight: 600,
  '& .MuiChip-icon': {
    color: '#FFD700',
  },
}));

const DownloadModal = ({ 
  open, 
  onClose, 
  imageUrl, 
  filename = 'image.jpg',
  onDownloadWithWatermark,
  onUpgradePlan 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data: session } = useSession();
  const router = useRouter();
  const [userPlan, setUserPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('[DownloadModal] Props changed:', { open, imageUrl, filename });
  }, [open, imageUrl, filename]);

  // Check user plan status
  useEffect(() => {
    const fetchUserPlan = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/getPlan?userId=${session.user.id}`);
          if (response.ok) {
            const data = await response.json();
            setUserPlan(data.plan);
          }
        } catch (error) {
          console.error('Error fetching user plan:', error);
        }
      }
    };

    if (open && session) {
      fetchUserPlan();
    }
  }, [open, session]);

  // Check if user has premium plan
  const hasPremiumPlan = () => {
    if (!userPlan) return false;
    const premiumPlans = ['standard', 'premium', 'popular'];
    const cleanPlanName = userPlan.planName?.replace(/['"]/g, '').toLowerCase();
    const isExpired = userPlan.expiredAt && new Date(userPlan.expiredAt) < new Date();
    return premiumPlans.includes(cleanPlanName) && !isExpired;
  };

  const handleDownloadWithWatermark = async () => {
    setLoading(true);
    try {
      if (onDownloadWithWatermark) {
        await onDownloadWithWatermark();
      } else {
        // Default watermark download logic
        const downloadUrl = `/api/download-image?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(filename)}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      onClose();
    } catch (error) {
      console.error('Error downloading with watermark:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradePlan = () => {
    if (onUpgradePlan) {
      onUpgradePlan();
    } else {
      // Default upgrade logic - redirect to pricing page
      router.push('/pricing');
    }
    onClose();
  };

  // If user has premium plan, don't show this modal - download directly
  const isPremium = hasPremiumPlan();
  console.log('[DownloadModal] Render check:', { 
    open, 
    isPremium, 
    userPlan,
    willRender: !isPremium 
  });
  
  if (isPremium) {
    console.log('[DownloadModal] Not rendering - user has premium plan');
    return null;
  }

  console.log('[DownloadModal] Rendering modal...', { open, imageUrl });
  
  if (!open) {
    console.log('[DownloadModal] Modal is closed, returning null');
    return null;
  }
  
  return (
    <StyledDialog
      open={true}
      onClose={onClose}
      maxWidth={false}
      fullScreen={isMobile}
      sx={{ 
        zIndex: 10001,
        // '& .MuiBackdrop-root': {
        //   zIndex: 10000
        // }
      }}
    >
      <StyledDialogTitle>
        <Box
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            fontSize: '1.5rem',
          }}
        >
          <DownloadIcon  />
          Download Image
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              color: theme.palette.error.main,
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>

      <StyledDialogContent>
        <Grid container spacing={4} alignItems="center">
          {/* Image Preview */}
          <Grid item xs={12} md={6}>
            <Box sx={{pt: 2}}>
              <ImagePreviewContainer>
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  loading="lazy"
                />
              </ImagePreviewContainer>
            </Box>
          </Grid>

          {/* Download Options */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                }}
              >
                Download Options
              </Typography>

              <Stack spacing={3}>
                {/* Download with Watermark */}
                <Box>
                  {/* <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WatermarkChip
                      icon={<WaterDropIcon />}
                      label="Free Download"
                      size="small"
                    />
                  </Box> */}
                  <ActionButton
                    variant="watermark"
                    fullWidth
                    onClick={handleDownloadWithWatermark}
                    disabled={loading}
                    startIcon={<DownloadIcon />}
                  >
                    {loading ? 'Downloading...' : 'Download with Watermark'}
                  </ActionButton>
                </Box>

                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>

                {/* Upgrade Plan */}
                <Box>
                  {/* <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PremiumChip
                      icon={<StarIcon />}
                      label="Premium"
                      size="small"
                    />
                  </Box> */}
                  <ActionButton
                    variant="premium"
                    fullWidth
                    onClick={handleUpgradePlan}
                    startIcon={<DiamondIcon />}
                  >
                    Upgrade for Watermark-Free
                  </ActionButton>
                </Box>
              </Stack>

              {/* Benefits Box */}
              {/* <Box
                sx={{
                  mt: 4,
                  p: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                    mb: 1,
                  }}
                >
                  Premium Benefits:
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    • Unlimited watermark-free downloads
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Higher resolution outputs
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Priority processing
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Commercial usage rights
                  </Typography>
                </Stack>
              </Box> */}
            </Box>
          </Grid>
        </Grid>
      </StyledDialogContent>
    </StyledDialog>
  );
};

export default DownloadModal;
