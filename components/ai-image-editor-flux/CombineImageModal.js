import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Card,
  CardMedia,
  Tooltip,
  Grid,
  alpha,
  useTheme,
  styled,
  Fade,
  useMediaQuery,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import EnhancedLoader from './EnhancedLoader';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: '95vw',
    maxHeight: '95vh',
    width: '1400px',
    borderRadius: theme.spacing(3),
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    backdropFilter: 'blur(16px)',
    [theme.breakpoints.down('md')]: {
      width: '100vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      borderRadius: 0,
      margin: 0,
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
  overflow: 'visible',
  background: 'transparent',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
}));

const ImageCard = styled(Card)(({ theme, variant }) => ({
  position: 'relative',
  borderRadius: theme.spacing(3),
  width: '80%',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: variant === 'output'
    ? '0 20px 25px -5px rgba(99, 102, 241, 0.1), 0 10px 10px -5px rgba(99, 102, 241, 0.04)'
    : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  border: variant === 'output'
    ? `2px solid ${theme.palette.primary.main}`
    : `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(16px)',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: variant === 'output'
      ? '0 25px 50px -12px rgba(99, 102, 241, 0.25)'
      : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '& .image-overlay': {
      opacity: 1,
    },
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
    '&:hover': {
      transform: 'none',
    },
    '& .image-overlay': {
      opacity: 0.9,
    },
  },
  [theme.breakpoints.down('sm')]: {
    borderRadius: theme.spacing(2),
  },
}));

const ImageOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  opacity: 0,
  transition: 'opacity 0.3s ease',
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  color: 'white',
  backgroundColor: 'rgba(99, 102, 241, 0.8)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.2)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
  [theme.breakpoints.down('md')]: {
    width: '40px',
    height: '40px',
    '& .MuiSvgIcon-root': {
      fontSize: '1.2rem',
    },
  },
  [theme.breakpoints.down('sm')]: {
    width: '36px',
    height: '36px',
    '& .MuiSvgIcon-root': {
      fontSize: '1rem',
    },
  },
  // '&:hover': {
  //   backgroundColor: 'rgba(99, 102, 241, 1)',
  //   transform: 'scale(1.15)',
  //   boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
  // },
}));

const ArrowContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  minHeight: '400px',
  [theme.breakpoints.down('md')]: {
    minHeight: '60px',
    transform: 'rotate(90deg)',
    margin: theme.spacing(2, 0),
  },
  [theme.breakpoints.down('sm')]: {
    minHeight: '40px',
    margin: theme.spacing(1, 0),
  },
}));

const PlusIcon = styled(AddIcon)(({ theme }) => ({
  fontSize: '4rem',
  color: theme.palette.primary.main,
  opacity: 0.8,
  filter: 'drop-shadow(0 4px 6px rgba(99, 102, 241, 0.2))',
  animation: 'pulse 3s ease-in-out infinite',
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
      opacity: 0.8,
    },
    '50%': {
      transform: 'scale(1.15)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(1)',
      opacity: 0.8,
    },
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '2rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.5rem',
  },
}));

const EqualsIcon = styled(DragHandleIcon)(({ theme }) => ({
  fontSize: '4rem',
  color: theme.palette.secondary.main,
  opacity: 0.8,
  rotate: '90deg',
  filter: 'drop-shadow(0 4px 6px rgba(156, 163, 175, 0.2))',
  transform: 'rotate(45deg)',
  animation: 'glow 3s ease-in-out infinite',
  '@keyframes glow': {
    '0%': {
      transform: 'rotate(90deg) scale(1)',
      opacity: 0.8,
    },
    '50%': {
      transform: 'rotate(90deg) scale(1.1)',
      opacity: 1,
    },
    '100%': {
      transform: 'rotate(90deg) scale(1)',
      opacity: 0.8,
    },
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '2rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.5rem',
  },
}));

const ImageLabel = styled(Typography)(({ theme, variant }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(2),
  backgroundColor: 'rgba(15, 23, 42, 0.8)',
  color: 'white',
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(2),
  fontSize: '0.9rem',
  fontWeight: 700,
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  zIndex: 2,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
    padding: theme.spacing(0.5, 1.5),
    top: theme.spacing(1),
    left: theme.spacing(1),
  },
}));

const PlaceholderCard = styled(Box)(({ theme }) => ({
  height: '400px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
  borderRadius: theme.spacing(3),
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(16px)',
  color: alpha(theme.palette.text.secondary, 0.8),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  [theme.breakpoints.down('md')]: {
    height: '250px',
  },
  [theme.breakpoints.down('sm')]: {
    height: '200px',
    borderRadius: theme.spacing(2),
  },
}));

const CombineImageModal = ({
  open,
  onClose,
  inputImage1,
  inputImage2,
  inputImages = [], // New prop for multiple images
  outputImage,
  onDownload,
  isLoading = false,
  switchedModel = 'flux-kontext-pro' // New prop to determine display mode
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Add global mouse event listeners for dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDragging && zoom > 1) {
        const newPanX = e.clientX - dragStart.x;
        const newPanY = e.clientY - dragStart.y;
        const maxPan = 200 * zoom;
        setPanX(Math.max(-maxPan, Math.min(maxPan, newPanX)));
        setPanY(Math.max(-maxPan, Math.min(maxPan, newPanY)));
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragStart, zoom]);

  // Determine if we're in multi-image mode (including flux-kontext-pro which is now flux-2-pro)
  const isMultiImageMode = switchedModel === 'nano-banana' || switchedModel === 'seedream-4' || switchedModel === 'flux-kontext-pro';
  
  // Placeholder images from Unsplash
  const placeholderImages = [
    'https://images.unsplash.com/photo-1494790108755-2616c6d1a1b6?w=400&h=300&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=300&fit=crop'
  ];
  const placeholderOutput = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop';

  // Prepare display images based on mode
  let displayImages;
  if (isMultiImageMode) {
    // Use inputImages array for multi-image models
    displayImages = inputImages.length > 0 
      ? inputImages.map((img, index) => img || placeholderImages[index % placeholderImages.length])
      : [placeholderImages[0], placeholderImages[1]]; // Default to 2 placeholders
  } else {
    // Legacy mode for flux-kontext-pro
    displayImages = [
      inputImage1 || placeholderImages[0],
      inputImage2 || placeholderImages[1]
    ];
  }
  
  const displayOutput = outputImage || placeholderOutput;

  // Preview handlers
  const handlePreviewOpen = (image, title) => {
    setPreviewImage(image);
    setPreviewTitle(title);
    setZoom(1); // Reset zoom when opening preview
    setPanX(0); // Reset pan when opening preview
    setPanY(0);
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
    setPreviewImage(null);
    setPreviewTitle('');
    setZoom(1); // Reset zoom when closing preview
    setPanX(0); // Reset pan when closing preview
    setPanY(0);
    setIsDragging(false);
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPanX(0); // Reset pan when resetting zoom
    setPanY(0);
  };

  // Pan handlers
  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - panX,
        y: e.clientY - panY
      });
      e.preventDefault();
    }
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    if (zoom > 1 && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panX,
        y: e.touches[0].clientY - panY
      });
      e.preventDefault();
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging && zoom > 1 && e.touches.length === 1) {
      const newPanX = e.touches[0].clientX - dragStart.x;
      const newPanY = e.touches[0].clientY - dragStart.y;

      // Limit pan to reasonable bounds
      const maxPan = 200 * zoom;
      setPanX(Math.max(-maxPan, Math.min(maxPan, newPanX)));
      setPanY(Math.max(-maxPan, Math.min(maxPan, newPanY)));
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <>
      <StyledDialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        fullScreen={isMobile}
      >
        <StyledDialogTitle>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Image Combination Process
          </Typography>
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
          <Grid container spacing={{ xs: 2, md: 4 }} alignItems="center">
            {/* Dynamic Input Images */}
            {isMultiImageMode ? (
              // Multi-image layout for Nano Banana and See Dreams
              <>
                {/* Input Images Section - Clean Grid Layout */}
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary, textAlign: 'center' }}>
                    Input Images ({displayImages.length})
                  </Typography>
                  <Grid container spacing={0} justifyContent="center">
                    {displayImages.map((image, index) => (
                      <Grid item xs={6} sm={4} md={displayImages.length <= 4 ? 3 : 2.4} key={index} sx={{ padding: '0 !important' }}>
                        <ImageCard variant="input" sx={{ 
                          height: isMobile ? '120px' : '160px',
                          borderRadius: 0,
                          overflow: 'hidden',
                          margin: 0,
                          padding: 0,
                          border: 'none',
                          boxShadow: 'none',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                          }
                        }}>
                          <ImageLabel variant="input" sx={{ 
                            fontSize: '0.75rem',
                            margin: 0,
                            padding: '4px 8px',
                            borderRadius: 0
                          }}>
                            {index + 1}
                          </ImageLabel>
                          <CardMedia
                            component="img"
                            height={isMobile ? "120" : "160"}
                            image={image}
                            referrerPolicy='no-referrer'
                            alt={`Input image ${index + 1}`}
                            sx={{
                              objectFit: 'cover',
                              backgroundColor: '#f8fafc',
                              transition: 'all 0.3s ease',
                              margin: 0,
                              padding: 0,
                              display: 'block'
                            }}
                          />
                          <ImageOverlay className="image-overlay">
                            <Tooltip title="Preview Image">
                              <ActionButton onClick={() => handlePreviewOpen(image, `Input Image ${index + 1}`)}>
                                <VisibilityIcon />
                              </ActionButton>
                            </Tooltip>
                            {inputImages[index] && (
                              <Tooltip title="Download Image">
                                <ActionButton onClick={() => onDownload && onDownload(image, index)}>
                                  <DownloadIcon />
                                </ActionButton>
                              </Tooltip>
                            )}
                          </ImageOverlay>
                          {!inputImages[index] && (
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 4,
                                left: 4,
                                right: 4,
                                backgroundColor: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                padding: 0.3,
                                borderRadius: 1,
                                fontSize: '0.65rem',
                                textAlign: 'center',
                              }}
                            >
                              Sample
                            </Box>
                          )}
                        </ImageCard>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>

                {/* Equals Icon */}
                <Grid item xs={12} md={1} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minHeight: '200px'
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}>
                    =
                  </Box>
                </Grid>
              </>
            ) : (
              // Legacy two-image layout for Flux Kontext Pro
              <>
                {/* First Input Image */}
                <Grid item xs={12} md={3}>
                  <ImageCard variant="input">
                    <ImageLabel variant="input">Input 1</ImageLabel>
                    <CardMedia
                      component="img"
                      height={isMobile ? "200" : "300"}
                      image={displayImages[0]}
                      referrerPolicy='no-referrer'
                      alt="First input image"
                      sx={{
                        objectFit: 'contain',
                        backgroundColor: '#f8fafc',
                        transition: 'all 0.3s ease',
                        [theme.breakpoints.down('md')]: {
                          height: '200px',
                        },
                        [theme.breakpoints.down('sm')]: {
                          height: '150px',
                        },
                      }}
                    />
                    <ImageOverlay className="image-overlay">
                      <Tooltip title="Preview Image">
                        <ActionButton onClick={() => handlePreviewOpen(displayImages[0], 'Input Image 1')}>
                          <VisibilityIcon />
                        </ActionButton>
                      </Tooltip>
                      {inputImage1 && (
                        <Tooltip title="Download Image">
                          <ActionButton onClick={() => onDownload && onDownload(displayImages[0], 0)}>
                            <DownloadIcon />
                          </ActionButton>
                        </Tooltip>
                      )}
                    </ImageOverlay>
                  </ImageCard>
                </Grid>

                {/* Plus Icon */}
                <Grid item xs={12} md={1} sx={{ display: { xs: 'none', md: 'block' } }}>
                  <ArrowContainer>
                    <AddIcon />
                  </ArrowContainer>
                </Grid>

                {/* Second Input Image */}
                <Grid item xs={12} md={3}>
                  <ImageCard variant="input">
                    <ImageLabel variant="input">Input 2</ImageLabel>
                    <CardMedia
                      component="img"
                      height={isMobile ? "200" : "300"}
                      image={displayImages[1]}
                      referrerPolicy='no-referrer'
                      alt="Second input image"
                      sx={{
                        objectFit: 'contain',
                        backgroundColor: '#f8fafc',
                        transition: 'all 0.3s ease',
                        [theme.breakpoints.down('md')]: {
                          height: '200px',
                        },
                        [theme.breakpoints.down('sm')]: {
                          height: '150px',
                        },
                      }}
                    />
                    <ImageOverlay className="image-overlay">
                      <Tooltip title="Preview Image">
                        <ActionButton onClick={() => handlePreviewOpen(displayImages[1], 'Input Image 2')}>
                          <VisibilityIcon />
                        </ActionButton>
                      </Tooltip>
                      {inputImage2 && (
                        <Tooltip title="Download Image">
                          <ActionButton onClick={() => onDownload && onDownload(displayImages[1], 1)}>
                            <DownloadIcon />
                          </ActionButton>
                        </Tooltip>
                      )}
                    </ImageOverlay>
                    {!inputImage2 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 12,
                          left: 12,
                          right: 12,
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          padding: 1.5,
                          borderRadius: 1,
                          fontSize: '0.875rem',
                          textAlign: 'center',
                          [theme.breakpoints.down('sm')]: {
                            fontSize: '0.75rem',
                            padding: 1,
                            bottom: 8,
                            left: 8,
                            right: 8,
                          },
                        }}
                      >
                        Sample Image - Upload your own
                      </Box>
                    )}
                  </ImageCard>
                </Grid>

                {/* Equals Icon */}
                <Grid item xs={12} md={1} sx={{ display: { xs: 'none', md: 'block' } }}>
                  <ArrowContainer>
                    <EqualsIcon />
                  </ArrowContainer>
                </Grid>
              </>
            )}

            {/* Output Image */}
            <Grid item xs={12} md={isMultiImageMode ? 3 : 4}>
              {isLoading ? (
                <PlaceholderCard sx={{ 
                  height: isMultiImageMode ? (isMobile ? '200px' : '300px') : (isMobile ? '200px' : '300px'),
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <EnhancedLoader
                    selectedModel="combine-image"
                    size="large"
                  />
                </PlaceholderCard>
              ) : (
                <Fade in={!!outputImage} timeout={800}>
                  <ImageCard variant="output" sx={{
                    height: isMultiImageMode ? (isMobile ? '200px' : '300px') : (isMobile ? '200px' : '300px'),
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    border: `3px solid ${theme.palette.primary.main}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
                    }
                  }}>
                    <ImageLabel variant="output" sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      padding: '8px 16px',
                      borderRadius: '0 0 12px 12px'
                    }}>
                      Combined Result
                    </ImageLabel>
                    <CardMedia
                      component="img"
                      height={isMultiImageMode ? (isMobile ? "200" : "300") : (isMobile ? "200" : "300")}
                      image={displayOutput}
                      referrerPolicy='no-referrer'
                      alt="Combined output image"
                      sx={{
                        objectFit: 'cover',
                        backgroundColor: '#f8fafc',
                        transition: 'all 0.3s ease',
                      }}
                    />
                    <ImageOverlay className="image-overlay">
                      <Tooltip title="Preview Result">
                        <ActionButton onClick={() => handlePreviewOpen(displayOutput, 'Combined Result')}>
                          <VisibilityIcon />
                        </ActionButton>
                      </Tooltip>
                      {outputImage && (
                        <Tooltip title="Download Result">
                          <ActionButton onClick={() => onDownload && onDownload(displayOutput, 0)}>
                            <DownloadIcon />
                          </ActionButton>
                        </Tooltip>
                      )}
                    </ImageOverlay>
                    {!outputImage && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 12,
                          left: 12,
                          right: 12,
                          backgroundColor: 'rgba(102, 126, 234, 0.9)',
                          color: 'white',
                          padding: 1.5,
                          borderRadius: 1,
                          fontSize: '0.875rem',
                          textAlign: 'center',
                          [theme.breakpoints.down('sm')]: {
                            fontSize: '0.75rem',
                            padding: 1,
                            bottom: 8,
                            left: 8,
                            right: 8,
                          },
                        }}
                      >
                        Sample Result - Generate your own
                      </Box>
                    )}
                  </ImageCard>
                </Fade>
              )}
            </Grid>
          </Grid>

          {/* Mobile Arrow Indicators */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mt: 2, gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PlusIcon sx={{ fontSize: '1.5rem' }} />
              <Typography variant="body2" color="text.secondary">Combine</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EqualsIcon sx={{ fontSize: '1.5rem' }} />
              <Typography variant="body2" color="text.secondary">Result</Typography>
            </Box>
          </Box>


        </StyledDialogContent>
      </StyledDialog>

      {/* Image Preview Modal */}
      <Dialog
        open={previewOpen}
        onClose={handlePreviewClose}
        maxWidth={false}
        fullScreen
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            margin: 0,
          },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={handlePreviewClose}
            sx={{
              position: 'absolute',
              top: { xs: 10, md: 20 },
              right: { xs: 10, md: 20 },
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              zIndex: 1000,
              width: { xs: '40px', md: '48px' },
              height: { xs: '40px', md: '48px' },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            <CloseIcon sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }} />
          </IconButton>

          {/* Image Title */}
          {/* <Typography
            variant="h4"
            sx={{
              position: 'absolute',
              top: 20,
              left: 20,
              color: 'white',
              fontWeight: 600,
              zIndex: 1000,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
            }}
          >
            {previewTitle}
          </Typography> */}

          {/* Preview Image */}
          {previewImage && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
              }}
            >
              <Box
                component="img"
                src={previewImage}
                alt={previewTitle}
                sx={{
                  maxWidth: zoom > 1 ? 'none' : '90%',
                  maxHeight: zoom > 1 ? 'none' : '90%',
                  objectFit: 'contain',
                  borderRadius: 2,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease-in-out',
                  cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                  userSelect: 'none',
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
            </Box>
          )}

          {/* Zoom Controls */}
          <Box
            sx={{
              position: 'absolute',
              bottom: { xs: 10, md: 20 },
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.5, md: 1 },
              zIndex: 1000,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              padding: { xs: '6px 8px', md: '8px 12px' },
              borderRadius: 2,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Tooltip title="Zoom Out">
              <span>
                <IconButton
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.25}
                  size="small"
                  sx={{
                    color: 'white',
                    width: { xs: '32px', md: '40px' },
                    height: { xs: '32px', md: '40px' },
                    '&.Mui-disabled': {
                      color: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  <ZoomOutIcon sx={{ fontSize: { xs: '1rem', md: '1.5rem' } }} />
                </IconButton>
              </span>
            </Tooltip>
            <Chip
              label={`${Math.round(zoom * 100)}%`}
              size="small"
              sx={{
                color: 'white',
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: { xs: '0.7rem', md: '0.75rem' },
                fontWeight: 600,
                minWidth: { xs: '50px', md: '60px' },
                height: { xs: '28px', md: '32px' },
              }}
            />
            <Tooltip title="Reset Zoom">
              <span>
                <IconButton
                  onClick={handleResetZoom}
                  disabled={zoom === 1}
                  size="small"
                  sx={{
                    color: 'white',
                    width: { xs: '32px', md: '40px' },
                    height: { xs: '32px', md: '40px' },
                    '&.Mui-disabled': {
                      color: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  <RestartAltIcon sx={{ fontSize: { xs: '1rem', md: '1.5rem' } }} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Zoom In">
              <span>
                <IconButton
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  size="small"
                  sx={{
                    color: 'white',
                    width: { xs: '32px', md: '40px' },
                    height: { xs: '32px', md: '40px' },
                    '&.Mui-disabled': {
                      color: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  <ZoomInIcon sx={{ fontSize: { xs: '1rem', md: '1.5rem' } }} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          {/* Instructions */}
          <Typography
            variant="body1"
            sx={{
              position: 'absolute',
              bottom: { xs: 60, md: 80 },
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
              fontSize: { xs: '0.8rem', md: '0.9rem' },
              maxWidth: '90%',
              px: 2,
              [theme.breakpoints.down('sm')]: {
                fontSize: '0.75rem',
                bottom: 50,
              },
            }}
          >
            {isMobile ? 'Pinch to zoom • Tap and drag to pan • Tap close to exit' : 'Use zoom controls to inspect details • Click and drag to pan when zoomed • Press ESC or click close to exit'}
          </Typography>
        </Box>
      </Dialog>
    </>
  );
};

export default CombineImageModal; 