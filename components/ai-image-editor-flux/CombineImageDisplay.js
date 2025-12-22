import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  IconButton,
  Tooltip,
  Grid,
  alpha,
  useTheme,
  styled,
  Fade
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EnhancedLoader from './EnhancedLoader';

const StyledContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
}));

const ImageCard = styled(Card)(({ theme, variant }) => ({
  position: 'relative',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  boxShadow: variant === 'output' 
    ? '0 12px 40px rgba(102, 126, 234, 0.2)' 
    : '0 8px 24px rgba(0,0,0,0.1)',
  border: variant === 'output' 
    ? `2px solid ${theme.palette.primary.main}` 
    : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: variant === 'output' 
      ? '0 16px 48px rgba(102, 126, 234, 0.3)' 
      : '0 12px 32px rgba(0,0,0,0.15)',
    '& .image-overlay': {
      opacity: 1,
    },
  },
  [theme.breakpoints.down('sm')]: {
    '& .image-overlay': {
      opacity: 0.8,
    },
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
  backgroundColor: 'rgba(255,255,255,0.2)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.1)',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.3)',
    transform: 'scale(1.1)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
}));

const ArrowContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  minHeight: '200px',
  [theme.breakpoints.down('md')]: {
    minHeight: '60px',
    transform: 'rotate(90deg)',
  },
}));

const ArrowIcon = styled(ArrowForwardIcon)(({ theme }) => ({
  fontSize: '3rem',
  color: theme.palette.primary.main,
  opacity: 0.7,
  animation: 'pulse 2s infinite',
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
      opacity: 0.7,
    },
    '50%': {
      transform: 'scale(1.1)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(1)',
      opacity: 0.7,
    },
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '2rem',
  },
}));

const ImageLabel = styled(Typography)(({ theme, variant }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  left: theme.spacing(1),
  backgroundColor: variant === 'output' 
    ? theme.palette.primary.main 
    : 'rgba(0,0,0,0.7)',
  color: 'white',
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.spacing(1),
  fontSize: '0.75rem',
  fontWeight: 600,
  backdropFilter: 'blur(10px)',
  zIndex: 2,
}));

const PlaceholderCard = styled(Box)(({ theme }) => ({
  height: '250px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
  borderRadius: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.5),
  color: alpha(theme.palette.text.secondary, 0.7),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    color: theme.palette.primary.main,
  },
}));

const CombineImageDisplay = ({ 
  inputImage1, 
  inputImage2, 
  inputImages = [], // New prop for multiple images
  outputImage, 
  onPreview, 
  onDownload,
  isLoading = false,
  switchedModel = 'flux-kontext-pro' // New prop to determine display mode
}) => {
  const theme = useTheme();

  // Determine if we're in multi-image mode
  const isMultiImageMode = switchedModel === 'nano-banana' || switchedModel === 'seedream-4';
  
  // Placeholder images from Unsplash
  const placeholderImages = [
    'https://images.unsplash.com/photo-1494790108755-2616c6d1a1b6?w=400&h=250&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=250&fit=crop'
  ];
  const placeholderOutput = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop';

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

  return (
    <StyledContainer>
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          textAlign: 'center', 
          mb: 3,
          color: theme.palette.text.primary,
          fontWeight: 600
        }}
      >
        Image Combination Process
      </Typography>

      <Grid container spacing={2} alignItems="center">
        {/* Dynamic Input Images */}
        {isMultiImageMode ? (
          // Multi-image layout for Nano Banana and See Dreams
          <>
            {/* Input Images Grid - Clean Layout */}
            <Grid item xs={12} md={8}>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary, textAlign: 'center' }}>
                Input Images ({displayImages.length})
              </Typography>
              <Grid container spacing={0} justifyContent="center">
                {displayImages.map((image, index) => (
                  <Grid item xs={6} sm={4} md={displayImages.length <= 4 ? 3 : 2.4} key={index} sx={{ padding: '0 !important' }}>
                    <ImageCard variant="input" sx={{ 
                      borderRadius: 0,
                      overflow: 'hidden',
                      margin: 0,
                      padding: 0,
                      border: 'none',
                      boxShadow: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      }
                    }}>
                      <ImageLabel variant="input" sx={{ 
                        fontSize: '0.7rem',
                        margin: 0,
                        padding: '2px 6px',
                        borderRadius: 0
                      }}>
                        {index + 1}
                      </ImageLabel>
                      <CardMedia
                        component="img"
                        height="120"
                        image={image}
                        alt={`Input image ${index + 1}`}
                        sx={{ 
                          objectFit: 'cover',
                          margin: 0,
                          padding: 0,
                          display: 'block'
                        }}
                      />
                      <ImageOverlay className="image-overlay">
                        <Tooltip title="Preview Image">
                          <ActionButton onClick={() => onPreview && onPreview(image, `input${index + 1}`)}>
                            <VisibilityIcon />
                          </ActionButton>
                        </Tooltip>
                        {(isMultiImageMode ? inputImages[index] : (index === 0 ? inputImage1 : inputImage2)) && (
                          <Tooltip title="Download Image">
                            <ActionButton onClick={() => onDownload && onDownload(image, index)}>
                              <DownloadIcon />
                            </ActionButton>
                          </Tooltip>
                        )}
                      </ImageOverlay>
                      {!(isMultiImageMode ? inputImages[index] : (index === 0 ? inputImage1 : inputImage2)) && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 2,
                            left: 2,
                            right: 2,
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            padding: 0.3,
                            borderRadius: 1,
                            fontSize: '0.6rem',
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
            
            {/* Equals Sign */}
            <Grid item xs={12} md={1} sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: '120px'
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}>
                =
              </Box>
            </Grid>
          </>
        ) : (
          // Legacy two-image layout for Flux Kontext Pro
          <>
            {/* First Input Image */}
            <Grid item xs={12} md={4}>
              <ImageCard variant="input">
                <ImageLabel variant="input">Input 1</ImageLabel>
                <CardMedia
                  component="img"
                  height="250"
                  image={displayImages[0]}
                  alt="First input image"
                  sx={{ objectFit: 'cover' }}
                />
                <ImageOverlay className="image-overlay">
                  <Tooltip title="Preview Image">
                    <ActionButton onClick={() => onPreview && onPreview(displayImages[0], 'input1')}>
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
                {!inputImage1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      right: 8,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: 1,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      textAlign: 'center',
                    }}
                  >
                    Sample Image - Upload your own
                  </Box>
                )}
              </ImageCard>
            </Grid>

            {/* Arrow */}
            <Grid item xs={12} md={1}>
              <ArrowContainer>
                <ArrowIcon />
              </ArrowContainer>
            </Grid>

            {/* Second Input Image */}
            <Grid item xs={12} md={3}>
              <ImageCard variant="input">
                <ImageLabel variant="input">Input 2</ImageLabel>
                <CardMedia
                  component="img"
                  height="250"
                  image={displayImages[1]}
                  alt="Second input image"
                  sx={{ objectFit: 'cover' }}
                />
                <ImageOverlay className="image-overlay">
                  <Tooltip title="Preview Image">
                    <ActionButton onClick={() => onPreview && onPreview(displayImages[1], 'input2')}>
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
                      bottom: 8,
                      left: 8,
                      right: 8,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: 1,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      textAlign: 'center',
                    }}
                  >
                    Sample Image - Upload your own
                  </Box>
                )}
              </ImageCard>
            </Grid>

            {/* Arrow */}
            <Grid item xs={12} md={1}>
              <ArrowContainer>
                <ArrowIcon />
              </ArrowContainer>
            </Grid>
          </>
        )}

        {/* Output Image */}
        <Grid item xs={12} md={isMultiImageMode ? 3 : 3}>
          {isLoading ? (
            <PlaceholderCard sx={{ 
              height: isMultiImageMode ? '200px' : '250px',
              borderRadius: 2,
            }}>
              <EnhancedLoader 
                selectedModel="combine-image"
                size="small"
              />
            </PlaceholderCard>
          ) : (
            <Fade in={!!outputImage} timeout={800}>
              <ImageCard variant="output" sx={{
                height: isMultiImageMode ? '200px' : '250px',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                border: `2px solid ${theme.palette.primary.main}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                }
              }}>
                <ImageLabel variant="output" sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  padding: '6px 12px',
                  borderRadius: '0 0 8px 8px'
                }}>
                  Combined Result
                </ImageLabel>
                <CardMedia
                  component="img"
                  height={isMultiImageMode ? "200" : "250"}
                  image={displayOutput}
                  alt="Combined output image"
                  sx={{ objectFit: 'cover' }}
                />
                                 <ImageOverlay className="image-overlay">
                   <Tooltip title="Preview Result">
                     <ActionButton onClick={() => onPreview && onPreview(displayOutput, 'output')}>
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
                      bottom: 8,
                      left: 8,
                      right: 8,
                      backgroundColor: 'rgba(102, 126, 234, 0.9)',
                      color: 'white',
                      padding: 1,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      textAlign: 'center',
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

      {/* Instructions */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          backgroundColor: alpha(theme.palette.info.main, 0.1),
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
        }}
      >
        <Typography variant="body2" color="info.main" sx={{ textAlign: 'center' }}>
          💡 Upload two images above and describe how you want them combined. 
          The AI will intelligently merge them based on your prompt.
        </Typography>
      </Box>
    </StyledContainer>
  );
};

export default CombineImageDisplay; 