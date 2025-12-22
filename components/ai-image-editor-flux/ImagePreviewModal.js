import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  IconButton,
  Typography,
  Chip,
  Stack,
  Divider,
  Button,
  alpha,
  useTheme,
  useMediaQuery,
  Paper,
  Tooltip,
  Fade
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DownloadIcon from '@mui/icons-material/Download';
// import ShareIcon from '@mui/icons-material/Share';
import InfoIcon from '@mui/icons-material/Info';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CompareIcon from '@mui/icons-material/Compare';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import modelConfigurations from '@/constant/ModelConfigurations';
import ImageComparisonSlider from './ImageComparisonSlider';
import DownloadModal from './DownloadModal';
import { useDownloadHandler } from './useDownloadHandler';

const ImagePreviewModal = ({
  open,
  onClose,
  images,
  currentIndex,
  onImageChange,
  selectedModel,
  imageInfo = null,
  // Comparison props
  canCompare = false,
  beforeImage = null,
  afterImage = null,
  beforeLabel = "Before",
  afterLabel = "After",
  autoOpenComparison = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [zoom, setZoom] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);

  // Download handler
  const downloadHandler = useDownloadHandler();

  // Reset zoom and comparison mode when image changes or modal opens
  useEffect(() => {
    if (open) {
      setZoom(1);
      if (autoOpenComparison && canCompare && beforeImage && afterImage) {
        setComparisonMode(true);
      } else {
        setComparisonMode(false);
      }
    }
  }, [open, currentIndex, autoOpenComparison, canCompare, beforeImage, afterImage]);

  // Filter out null images and get valid images with their original indices
  const validImages = images
    .map((img, idx) => ({ image: img, originalIndex: idx }))
    .filter(item => item.image !== null);

  const currentImageData = validImages[currentIndex];
  const currentImage = currentImageData?.image;
  const totalImages = validImages.length;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      onImageChange(newIndex);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalImages - 1) {
      const newIndex = currentIndex + 1;
      onImageChange(newIndex);
    }
  };

  // Utility function to generate intelligent filename for preview modal
  const generatePreviewFileName = (model, imageInfo, originalIndex) => {
    const config = modelConfigurations[model];
    const usesPrompts = config?.type === 'prompts';

    // Generate random string
    const randomString = Math.random().toString(36).substring(2, 8);

    if (usesPrompts && imageInfo?.prompt && imageInfo.prompt.trim()) {
      // Use prompt for filename
      const cleanPrompt = imageInfo.prompt
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .substring(0, 50); // Limit length to 50 characters

      return `${cleanPrompt}-${randomString}.jpg`;
    } else if (model === 'hair-style' && imageInfo?.selectedHairStyle && imageInfo.selectedHairStyle !== 'No change') {
      // Use selected hair style for hair-style model
      const cleanStyle = imageInfo.selectedHairStyle
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .substring(0, 30); // Limit length to 30 characters

      return `hair-style-${cleanStyle}-${randomString}.jpg`;
    } else if (model === 'reimagine' && imageInfo?.selectedScenario && imageInfo.selectedScenario !== 'Random') {
      // Use selected scenario for reimagine model
      const cleanScenario = imageInfo.selectedScenario
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .substring(0, 40); // Limit length to 40 characters

      return `reimagine-${cleanScenario}-${randomString}.jpg`;
    } else if (imageInfo?.title && imageInfo.title.trim() && !imageInfo.title.includes('Generated Image')) {
      // Use title for filename (but not generic "Generated Image" titles)
      const cleanTitle = imageInfo.title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .substring(0, 30); // Limit length to 30 characters

      return `${cleanTitle}-${randomString}.jpg`;
    } else {
      // Use model name with random string
      const modelName = getModelDisplayName(model);
      const cleanModelName = modelName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');

      return `${cleanModelName}-${randomString}.jpg`;
    }
  };

  const handleDownload = () => {
    if (currentImage) {
      // Generate intelligent filename
      const filename = generatePreviewFileName(selectedModel, imageInfo, currentImageData.originalIndex);

      // For base64 images, download directly (no watermark needed for base64)
      if (currentImage.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = currentImage;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For regular URLs, use the new download handler that checks user plan
        downloadHandler.handleDownload(currentImage, filename);
      }
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const toggleComparisonMode = () => {
    if (canCompare && beforeImage && afterImage) {
      setComparisonMode(!comparisonMode);
      setZoom(1); // Reset zoom when switching modes
    }
  };

  const getModelDisplayName = (model) => {
    const names = {
      'generate-image': 'AI Image Generator',
      'hair-style': 'Hair Style Changer',
      'headshot': 'Professional Headshot',
      'restore-image': 'Image Restoration',
      'text-removal': 'Text/Watermark Removal',
      'reimagine': 'ReImagine Scenarios',
      'combine-image': 'Image Combiner',
      'background-removal': 'Background Removal',
      'remove-object': 'Object Removal',
      'gfp-restore': 'Free Image Restoration',
      'home-designer': 'Home Designer',
      'restore-image': 'Image Restoration',
      'text-removal': 'Text/Watermark Removal',
      'reimagine': 'ReImagine Scenarios',
      'edit-image': 'AI Image Editor',
    };
    return names[model] || model;
  };

  // Function to generate detailed configuration display from modelParams
  const generateDetailedConfigDisplay = (model, modelParams) => {
    if (!modelParams) return null;

    const configParts = [];

    switch (model) {
      case 'hair-style':
        if (modelParams.hair_style && modelParams.hair_style !== 'No change' && modelParams.hair_style !== 'Random') {
          configParts.push(`Hair Style: ${modelParams.hair_style}`);
        }
        if (modelParams.hair_color && modelParams.hair_color !== 'No change') {
          configParts.push(`Hair Color: ${modelParams.hair_color}`);
        }
        if (modelParams.gender && modelParams.gender !== 'None') {
          configParts.push(`Gender: ${modelParams.gender}`);
        }
        break;

      case 'headshot':
        if (modelParams.background && modelParams.background !== 'None') {
          configParts.push(`Background: ${modelParams.background}`);
        }
        if (modelParams.gender && modelParams.gender !== 'None') {
          configParts.push(`Gender: ${modelParams.gender}`);
        }
        break;

      case 'reimagine':
        if (modelParams.scenario && modelParams.scenario !== 'Random') {
          configParts.push(`Scenario: ${modelParams.scenario}`);
        }
        if (modelParams.gender && modelParams.gender !== 'None') {
          configParts.push(`Gender: ${modelParams.gender}`);
        }
        break;

      case 'text-removal':
        configParts.push('Text and Watermark Removal');
        break;


      case 'restore-image':
        configParts.push('Image Restoration and Enhancement');
        break;

      case 'gfp-restore':
        configParts.push('GFP Image Restoration');
        break;

      case 'home-designer':
        configParts.push('Interior Design Transformation');
        break;

      case 'background-removal':
        configParts.push('AI Background Removal');
        break;

      case 'remove-object':
        configParts.push('AI Object Removal');
        break;

      case 'combine-image':
        configParts.push('Image Combination');
        break;

      default:
        configParts.push(getModelDisplayName(model));
    }

    // Add aspect ratio if available and not default
    if (modelParams.aspect_ratio && modelParams.aspect_ratio !== 'match_input_image') {
      configParts.push(`Aspect Ratio: ${modelParams.aspect_ratio}`);
    }

    return configParts.length > 0 ? configParts.join('\n') : null;
  };

  const formatImageInfo = () => {
    if (imageInfo) {
      return {
        ...imageInfo,
        model: imageInfo.model ? getModelDisplayName(imageInfo.model) : getModelDisplayName(selectedModel),
        // Format created date properly if it exists
        createdAt: imageInfo.createdAt ? imageInfo.createdAt : null
      };
    }

    return {
      // title: `Generated Image ${(currentImageData?.originalIndex || 0) + 1}`,
      model: getModelDisplayName(selectedModel),
      resolution: 'High Quality',
      createdAt: new Date().toISOString(),
      format: 'JPEG'
    };
  };

  const info = formatImageInfo();

  if (!currentImage) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      fullScreen={isMobile}
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          overflow: 'hidden',
          margin: isMobile ? 0 : 2,
          maxHeight: isMobile ? '100vh' : 'calc(100vh - 32px)',
        },
      }}
    >
      <DialogContent
        sx={{
          padding: 0,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: isMobile ? 0 : 3,
          overflow: 'hidden',
          position: 'relative',
          height: isMobile ? '100vh' : 'auto',
        }}
      >
        {/* Navigation Arrows */}
        {totalImages > 1 && (
          <>
            <IconButton
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1000,
                backgroundColor: alpha(theme.palette.background.paper, 0.9),
                color: theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: theme.palette.background.paper,
                  transform: 'translateY(-50%) scale(1.1)',
                },
                '&.Mui-disabled': {
                  backgroundColor: alpha(theme.palette.background.paper, 0.3),
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ArrowBackIosIcon />
            </IconButton>

            <IconButton
              onClick={handleNext}
              disabled={currentIndex === totalImages - 1}
              sx={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1000,
                backgroundColor: alpha(theme.palette.background.paper, 0.9),
                color: theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: theme.palette.background.paper,
                  transform: 'translateY(-50%) scale(1.1)',
                },
                '&.Mui-disabled': {
                  backgroundColor: alpha(theme.palette.background.paper, 0.3),
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </>
        )}

        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1001,
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.9),
              color: 'white',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Image Section */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            minHeight: isMobile ? '100vh' : '80vh',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            width: isMobile ? '100%' : 'auto',
          }}
        >


          {comparisonMode ? (
            /* Comparison Slider View */
            <Box
              sx={{
                width: '100%',
                height: '100%',
                maxHeight: '100%',
                display: 'flex',
                alignItems: 'stretch',
                justifyContent: 'center',
                padding: 1,
                overflow: 'hidden',
                position: 'relative',
              }}
              onContextMenu={(e) => e.preventDefault()}
            >
              <ImageComparisonSlider
                beforeImage={beforeImage}
                afterImage={afterImage}
                beforeLabel={beforeLabel}
                afterLabel={afterLabel}
                className="modal-comparison"
              />

              {/* Exit Comparison Button - Top Left Corner */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 25,
                  right: 80,
                  zIndex: 1000,
                }}
              >
                <Tooltip title="Exit Comparison Mode">
                  <IconButton
                    onClick={toggleComparisonMode}
                    sx={{
                      backgroundColor: alpha(theme.palette.background.paper, 0.9),
                      color: theme.palette.text.primary,
                      '&:hover': {
                        backgroundColor: theme.palette.background.paper,
                      },
                    }}
                  >
                    <ViewModuleIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ) : (
            /* Normal Image View */
            <>
              {/* Toolbar - Top Right Corner */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: isMobile ? 60 : 16,
                  display: 'flex',
                  gap: 1,
                  zIndex: 1000,
                }}
              >
                {/* Download Button - First */}
                <Tooltip title="Download Image">
                  <IconButton
                    onClick={handleDownload}
                    sx={{
                      backgroundColor: 'white',
                      color: 'black',
                      '&:hover': {
                        backgroundColor: 'gray',
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>

                {/* Comparison Mode Toggle */}
                {canCompare && beforeImage && afterImage && (
                  <Tooltip title={comparisonMode ? "Switch to Normal View" : "Switch to Comparison View"}>
                    <IconButton
                      onClick={toggleComparisonMode}
                      sx={{
                        backgroundColor: comparisonMode
                          ? alpha(theme.palette.primary.main, 0.9)
                          : alpha(theme.palette.background.paper, 0.9),
                        color: comparisonMode
                          ? 'white'
                          : theme.palette.text.primary,
                        '&:hover': {
                          backgroundColor: comparisonMode
                            ? theme.palette.primary.dark
                            : theme.palette.background.paper,
                        },
                      }}
                    >
                      {comparisonMode ? <ViewModuleIcon /> : <CompareIcon />}
                    </IconButton>
                  </Tooltip>
                )}

                {/* Zoom Controls */}
                <Tooltip title="Zoom In">
                  <IconButton
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    sx={{
                      backgroundColor: alpha(theme.palette.background.paper, 0.9),
                      color: theme.palette.text.primary,
                      '&:hover': {
                        backgroundColor: theme.palette.background.paper,
                      },
                    }}
                  >
                    <ZoomInIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Zoom Out">
                  <IconButton
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.25}
                    sx={{
                      backgroundColor: alpha(theme.palette.background.paper, 0.9),
                      color: theme.palette.text.primary,
                      '&:hover': {
                        backgroundColor: theme.palette.background.paper,
                      },
                    }}
                  >
                    <ZoomOutIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reset Zoom">
                  <IconButton
                    onClick={handleResetZoom}
                    disabled={zoom === 1}
                    sx={{
                      backgroundColor: alpha(theme.palette.background.paper, 0.9),
                      color: theme.palette.text.primary,
                      '&:hover': {
                        backgroundColor: theme.palette.background.paper,
                      },
                    }}
                  >
                    <RestartAltIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Zoom Level Indicator */}
              <Chip
                label={`${Math.round(zoom * 100)}%`}
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  color: theme.palette.text.primary,
                }}
              />

              {/* Image Counter */}
              {totalImages > 1 && (
                <Chip
                  label={`${currentIndex + 1} / ${totalImages}`}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                    color: theme.palette.text.primary,
                  }}
                />
              )}

              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: isMobile ? 1 : 2,
                }}
              >
                <img
                  src={currentImage}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  style={{
                    maxWidth: isMobile ? '95%' : '100%',
                    maxHeight: isMobile ? '95%' : '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    transform: `scale(${zoom})`,
                    transition: 'transform 0.2s ease',
                    cursor: zoom > 1 ? 'grab' : 'default',
                    userSelect: 'none',
                    WebkitUserDrag: 'none',
                    pointerEvents: 'auto',
                  }}
                />
              </Box>
            </>
          )}
        </Box>

        {/* Info Panel - Hidden on Mobile */}
        {!isMobile && (
          <Paper
            elevation={0}
            sx={{
              width: 300,
              backgroundColor: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(10px)',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 0,
            }}
          >
          {/* Header */}
          <Box sx={{ p: 3, pb: 2 }}>
            {/* <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {info.title}
            </Typography> */}
            <Chip
              label={info.model}
              size="small"
              color="primary"
              sx={{ mb: 2 }}
            />
          </Box>

          <Divider />

          {/* Image Details */}
          <Box sx={{ p: 3, flex: 1 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                  Resolution
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {info.resolution}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                  Format
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {info.format}
                </Typography>
              </Box>

              {info.createdAt && (
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                    Created
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {new Date(info.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
              )}

              {info.prompt && (
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                    Prompt Used
                  </Typography>
                  <Typography variant="body2" sx={{
                    fontWeight: 400,
                    fontStyle: 'italic',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    padding: 1,
                    borderRadius: 1,
                    fontSize: '0.8rem'
                  }}>
                    "{info.prompt.replace(".jpg", "").replace(".png", "")}"
                  </Typography>
                </Box>
              )}

              {/* Show model configuration when there's no prompt */}
              {/* {!info.prompt && (info.modelConfig || info.modelParams) && (
                <Box>
                  {info.modelParams && (<>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                      Configuration Used
                    </Typography>
                    <Typography variant="body2" sx={{
                      fontWeight: 400,
                      fontStyle: 'italic',
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                      padding: 1,
                      borderRadius: 1,
                      fontSize: '0.8rem',
                      whiteSpace: 'pre-line'
                    }}>
                      {info.modelConfig}
                    </Typography>
                  </>
                  )}
                </Box>
              )} */}
            </Stack>
          </Box>

          <Divider />

          {/* Action Buttons */}
          <Box sx={{ p: 3, pt: 2 }}>
            <Stack spacing={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Download Image
              </Button>
            </Stack>
          </Box>
        </Paper>
        )}
      </DialogContent>

      {/* Download Modal */}
      <DownloadModal {...downloadHandler.modalProps} />
    </Dialog>
  );
};

export default ImagePreviewModal; 