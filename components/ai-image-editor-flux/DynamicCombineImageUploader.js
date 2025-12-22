import React from 'react';
import {
  Box,
  Grid,
  IconButton,
  Typography,
  Tooltip,
  alpha,
  useTheme,
  Fade
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ImageUploader from './ImageUploader';

/**
 * Dynamic Combine Image Uploader Component
 * Supports 2-5 images for Pruna AI model, 2-10 images for other models
 * Includes add/remove functionality for supported models
 */
const DynamicCombineImageUploader = ({
  images,
  imageUrls,
  uploadingStates,
  onImageUpload,
  onImageRemove,
  onAddSlot,
  onRemoveSlot,
  uploadImageToR2,
  enqueueSnackbar,
  isDragging,
  isLoading,
  error,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  switchedModel
}) => {
  const theme = useTheme();

  // Show dynamic uploader for nano-banana, seedream-4, flux-kontext-pro (flux-2-pro), and pruna-ai models
  const isDynamicMode = switchedModel === 'nano-banana' || switchedModel === 'seedream-4' || switchedModel === 'flux-kontext-pro' || switchedModel === 'pruna-ai';
  // Pruna AI supports max 5 images, others support up to 10
  const maxImages = switchedModel === 'pruna-ai' ? 5 : 10;
  const minImages = 2;

  const handleImageUploadForIndex = (index) => async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target.result;
        // Let parent handle the upload logic
        onImageUpload(index, base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemoveForIndex = (index) => () => {
    onImageRemove(index);
  };

  const handleRemoveSlot = (index) => () => {
    onRemoveSlot(index);
  };

  if (!isDynamicMode) {
    // Return static 2-image uploader (no longer used, kept for legacy support)
    return (
      <Grid container spacing={2}>
        {/* First Image Upload */}
        <Grid item xs={12} md={6}>
          <ImageUploader
            title="Upload First Image"
            uploadedImage={images[0]}
            uploadingImage={uploadingStates[0]}
            placeholderText="Click to upload first image"
            height="120px"
            onImageUpload={handleImageUploadForIndex(0)}
            onImageRemove={handleImageRemoveForIndex(0)}
            isDragging={isDragging}
            isLoading={isLoading}
            error={error}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
          />
        </Grid>

        {/* Second Image Upload */}
        <Grid item xs={12} md={6}>
          <ImageUploader
            title="Upload Second Image"
            uploadedImage={images[1]}
            uploadingImage={uploadingStates[1]}
            placeholderText="Click to upload second image"
            height="120px"
            borderColor="secondary"
            onImageUpload={handleImageUploadForIndex(1)}
            onImageRemove={handleImageRemoveForIndex(1)}
            isDragging={isDragging}
            isLoading={isLoading}
            error={error}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
          />
        </Grid>
      </Grid>
    );
  }

  // Dynamic uploader for nano-banana model
  return (
    <Box>
      {/* Dynamic Image Grid */}
      <Grid container spacing={2}>
        {images.map((image, index) => (
          <Fade in={true} key={index} timeout={300}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Box sx={{ position: 'relative' }}>
                <ImageUploader
                  title={`Image ${index + 1}`}
                  uploadedImage={image}
                  uploadingImage={uploadingStates[index]}
                  placeholderText={`Upload image ${index + 1}`}
                  height="120px"
                  borderColor={index % 2 === 0 ? 'primary' : 'secondary'}
                  onImageUpload={handleImageUploadForIndex(index)}
                  onImageRemove={handleImageRemoveForIndex(index)}
                  isDragging={isDragging}
                  isLoading={isLoading}
                  error={error}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                />
                
                {/* Remove button for slots beyond minimum */}
                {images.length > minImages && (
                  <Tooltip title="Remove this image slot">
                    <IconButton
                      onClick={handleRemoveSlot(index)}
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        backgroundColor: theme.palette.error.main,
                        color: 'white',
                        width: 24,
                        height: 24,
                        '&:hover': {
                          backgroundColor: theme.palette.error.dark,
                        },
                        zIndex: 10
                      }}
                      size="small"
                    >
                      <RemoveIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Grid>
          </Fade>
        ))}

        {/* Add More Button */}
        {images.length < maxImages && (
          <Fade in={true} timeout={300}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Box
                onClick={onAddSlot}
                sx={{
                  height: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                  borderRadius: theme.spacing(2),
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  color: theme.palette.primary.main,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  marginTop: '2.1rem',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                  },
                }}
              >
                <AddIcon sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="body2" sx={{ textAlign: 'center', px: 1 }}>
                  Add Image
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    {switchedModel === 'pruna-ai' ? `(Max ${maxImages})` : `(Max ${maxImages})`}
                  </Typography>
                </Typography>
              </Box>
            </Grid>
          </Fade>
        )}
      </Grid>

      {/* Validation Messages */}
      {images.length < minImages && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="warning.main">
            ⚠️ Please upload at least {minImages} images to proceed
          </Typography>
        </Box>
      )}
      
      {images.filter(img => img !== null).length >= minImages && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="success.main">
            ✅ Ready to combine {images.filter(img => img !== null).length} images
            {switchedModel === 'pruna-ai' && (
              <Typography variant="caption" display="block" color="info.main">
                Using Pruna AI model (supports up to 5 images)
              </Typography>
            )}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DynamicCombineImageUploader;
