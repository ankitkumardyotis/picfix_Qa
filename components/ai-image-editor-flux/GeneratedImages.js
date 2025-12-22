import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress,
  alpha,
  useTheme,
  styled
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import CompareIcon from '@mui/icons-material/Compare';
import PublishIcon from '@mui/icons-material/Publish';
import PublishDialog from './PublishDialog';
import EnhancedLoader from './EnhancedLoader';
import { Global } from '@emotion/react';
import { FaGlobe } from 'react-icons/fa';

// Styled components for responsive design
const ResponsiveImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '300px',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    '& .image-overlay': {
      opacity: 1,
    },
  },
  [theme.breakpoints.down('sm')]: {
    height: '250px',
    borderRadius: theme.spacing(1.5),
  },
}));

const ResponsiveImageOverlay = styled(Box)(({ theme }) => ({
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
  flexWrap: 'wrap',
  padding: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.5),
    // Show overlay on mobile by default with reduced opacity
    opacity: 0.8,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)',
  },
}));

const ResponsiveActionButton = styled(IconButton)(({ theme, variant }) => ({
  color: 'white',
  backgroundColor: variant === 'publish'
    ? 'rgba(102, 126, 234, 0.8)'
    : 'rgba(255,255,255,0.2)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.1)',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: variant === 'publish'
      ? 'rgba(102, 126, 234, 1)'
      : 'rgba(255,255,255,0.3)',
    transform: 'scale(1.1)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  [theme.breakpoints.down('sm')]: {
    width: 36,
    height: 36,
    '& .MuiSvgIcon-root': {
      fontSize: '1.1rem',
    },
  },
}));

const GeneratedImages = ({
  images,
  isLoading,
  numOutputs,
  selectedModel,
  handlePreview,
  handleDownload,
  removeImage,
  canCompare,
  handleComparePreview,
  // New props for publishing
  onPublish,
  inputPrompt,
  currentState
}) => {
  const theme = useTheme();
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedImageForPublish, setSelectedImageForPublish] = useState({ url: null, index: null });


  // Test image loading outside of the complex component structure
  React.useEffect(() => {
    const validImages = images.filter(img => img !== null);
    if (validImages.length > 0) {
      validImages.forEach((imageUrl, index) => {
        // Create a test image element
        const testImg = new Image();
      
        testImg.src = imageUrl;
      });
    }
  }, [images]);

  const handlePublishClick = (imageUrl, index) => {
    setSelectedImageForPublish({ url: imageUrl, index });
    setPublishDialogOpen(true);
  };

  const handlePublishSubmit = async (publishData) => {
    if (onPublish && selectedImageForPublish.url) {
      await onPublish({
        imageUrl: selectedImageForPublish.url,
        imageIndex: selectedImageForPublish.index,
        title: publishData.title,
        description: publishData.description
      });
    }
  };

  const handlePublishDialogClose = () => {
    setPublishDialogOpen(false);
    setSelectedImageForPublish({ url: null, index: null });
  };

  if (!isLoading && !images.some(img => img !== null)) {
    return null;
  }

  return (
    <>
      <Box sx={{ mt: 3, mb: 6 }}>
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 600,
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            color: theme.palette.text.primary
          }}
        >
          Generated Images
        </Typography>
        <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
          {isLoading ? (
            // Enhanced Loading placeholders
            Array(selectedModel === 'hair-style' || selectedModel === 'combine-image' || selectedModel === 'text-removal' || selectedModel === 'headshot' || selectedModel === 'restore-image' || selectedModel === 'reimagine' || selectedModel === 'gfp-restore' || selectedModel === 'background-removal' || selectedModel === 'remove-object' ? 1 : numOutputs).fill(null).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={`loading-${index}`}>
                <EnhancedLoader 
                  selectedModel={selectedModel}
                  size="medium"
                />
              </Grid>
            ))
          ) : (
            images.map((image, index) => (
              image && (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <ResponsiveImageContainer onContextMenu={(e) => e.preventDefault()}>
                    <img
                      key={`img-${image}-${index}`}
                      src={image}
                      alt={`Generated ${index + 1}`}
                      referrerPolicy="no-referrer"
                      onContextMenu={(e) => e.preventDefault()}
                      onDragStart={(e) => e.preventDefault()}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        userSelect: 'none',
                        WebkitUserDrag: 'none',
                        pointerEvents: 'auto',
                      }}
                    />
                    <ResponsiveImageOverlay className="image-overlay">
                      <Tooltip title="Preview Image">
                        <ResponsiveActionButton
                          onClick={() => handlePreview(image, index)}
                        >
                          <VisibilityIcon />
                        </ResponsiveActionButton>
                      </Tooltip>

                      {canCompare && handleComparePreview && (
                        <Tooltip title="Compare Images">
                          <ResponsiveActionButton
                            onClick={() => handleComparePreview(image, index)}
                          >
                            <CompareIcon />
                          </ResponsiveActionButton>
                        </Tooltip>
                      )}

                      <Tooltip title="Publish to Community">
                        <ResponsiveActionButton
                          variant="publish"
                          onClick={() => handlePublishClick(image, index)}
                        >
                          <FaGlobe />
                        </ResponsiveActionButton>
                      </Tooltip>

                      <Tooltip title="Download Image">
                        <ResponsiveActionButton
                          onClick={() => handleDownload(image, index)}
                        >
                          <DownloadIcon />
                        </ResponsiveActionButton>
                      </Tooltip>

                      <Tooltip title="Delete Image">
                        <ResponsiveActionButton
                          onClick={() => removeImage(index)}
                        >
                          <DeleteIcon />
                        </ResponsiveActionButton>
                      </Tooltip>
                    </ResponsiveImageOverlay>
                  </ResponsiveImageContainer>
                </Grid>
              )
            ))
          )}
        </Grid>
      </Box>

      {/* Publish Dialog */}
      <PublishDialog
        open={publishDialogOpen}
        onClose={handlePublishDialogClose}
        imageUrl={selectedImageForPublish.url}
        selectedModel={selectedModel}
        prompt={inputPrompt}
        onPublish={handlePublishSubmit}
      />
    </>
  );
};

export default GeneratedImages; 