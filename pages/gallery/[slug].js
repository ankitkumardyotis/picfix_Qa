import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Chip,
  Stack,
  Button,
  alpha,
  useTheme,
  Tooltip,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DownloadIcon from '@mui/icons-material/Download';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CompareIcon from '@mui/icons-material/Compare';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useSnackbar } from 'notistack';
import Head from 'next/head';
import modelConfigurations from '@/constant/ModelConfigurations';
import ImageComparisonSlider from '@/components/ai-image-editor-flux/ImageComparisonSlider';
import DownloadModal from '@/components/ai-image-editor-flux/DownloadModal';
import { useDownloadHandler } from '@/components/ai-image-editor-flux/useDownloadHandler';

const GalleryImagePage = () => {
  const theme = useTheme();
  const router = useRouter();
  const { slug } = router.query;
  const { data: session } = useSession();
  const { enqueueSnackbar } = useSnackbar();

  const [imageData, setImageData] = useState(null);
  const [allImages, setAllImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [comparisonMode, setComparisonMode] = useState(false);
  const downloadHandler = useDownloadHandler();

  // Debug download modal state
  useEffect(() => {
    console.log('[GalleryPage] Download modal state:', {
      open: downloadHandler.downloadModalOpen,
      hasImageUrl: !!downloadHandler.currentDownloadData?.imageUrl
    });
  }, [downloadHandler.downloadModalOpen, downloadHandler.currentDownloadData]);

  // Parse slug to get image ID
  const extractImageId = (slug) => {
    if (!slug) return null;
    // Extract ID from slug format: "title-words-IMAGE_ID"
    const parts = slug.split('-');
    const lastPart = parts[parts.length - 1];
    return lastPart;
  };

  // Generate slug from title and ID
  const generateSlug = (title, id) => {
    const cleanTitle = (title || 'image')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0,150);
    return `${cleanTitle}-${id}`;
  };

  // Fetch all images and find current one
  useEffect(() => {
    const fetchImages = async () => {
      if (!slug) return;

      try {
        setLoading(true);

        // Fetch all gallery images
        const response = await fetch('/api/images/getUnifiedGallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: 1,
            limit: 1000, // Get all images for navigation
            sortBy: 'createdAt'
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.images) {
            setAllImages(data.images);

            // Find current image by ID from slug
            const imageId = extractImageId(slug);
            const index = data.images.findIndex(img => {
              // Match by publishedImageId or exampleImageId
              return img.publishedImageId === imageId ||
                img.exampleImageId === imageId ||
                img.id === imageId;
            });

            if (index !== -1) {
              setCurrentIndex(index);
              setImageData(data.images[index]);
            } else {
              // Image not found
              enqueueSnackbar('Image not found', { variant: 'error' });
              router.push('/gallery');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching images:', error);
        enqueueSnackbar('Failed to load image', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [slug, router, enqueueSnackbar]);

  // Navigate to previous image
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0 && allImages.length > 0) {
      const newIndex = currentIndex - 1;
      const prevImage = allImages[newIndex];
      const imageId = prevImage.publishedImageId || prevImage.exampleImageId || prevImage.id;
      const newSlug = generateSlug(prevImage.title || prevImage.prompt, imageId);
      router.push(`/gallery/${newSlug}`, undefined, { shallow: true });
      setCurrentIndex(newIndex);
      setImageData(prevImage);
      setZoom(1);
      setComparisonMode(false);
    }
  }, [currentIndex, allImages, router]);

  // Navigate to next image
  const handleNext = useCallback(() => {
    if (currentIndex < allImages.length - 1 && allImages.length > 0) {
      const newIndex = currentIndex + 1;
      const nextImage = allImages[newIndex];
      const imageId = nextImage.publishedImageId || nextImage.exampleImageId || nextImage.id;
      const newSlug = generateSlug(nextImage.title || nextImage.prompt, imageId);
      router.push(`/gallery/${newSlug}`, undefined, { shallow: true });
      setCurrentIndex(newIndex);
      setImageData(nextImage);
      setZoom(1);
      setComparisonMode(false);
    }
  }, [currentIndex, allImages, router]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        router.push('/gallery');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlePrevious, handleNext, router]);

  // Handle like/unlike
  const handleLikeToggle = async () => {
    if (!imageData.isCommunity) {
      enqueueSnackbar('You can only like community images', { variant: 'info' });
      return;
    }

    if (!session) {
      enqueueSnackbar('Please log in to like images', { variant: 'warning' });
      router.push('/login');
      return;
    }

    try {
      const action = imageData.userLiked ? 'unlike' : 'like';
      const response = await fetch('/api/images/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action,
          publishedImageId: imageData.publishedImageId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setImageData(prev => ({
          ...prev,
          likes: data.likes,
          userLiked: data.userLiked
        }));
        enqueueSnackbar(
          action === 'like' ? '❤️ Liked!' : '💔 Unliked',
          { variant: 'success' }
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      enqueueSnackbar('Failed to update like', { variant: 'error' });
    }
  };

  // Download handler
  const handleDownload = async () => {
    if (!imageData) {
      console.error('No image data available');
      enqueueSnackbar('Image data not available', { variant: 'error' });
      return;
    }

    console.log('Download clicked. Image data:', {
      url: imageData.url,
      hasSession: !!session,
      sessionUser: session?.user?.email
    });

    try {
      const filename = generateDownloadFilename();
      console.log('Generated filename:', filename);

      if (imageData.url.startsWith('data:')) {
        // Handle base64 images
        console.log('Downloading base64 image');
        const link = document.createElement('a');
        link.href = imageData.url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        enqueueSnackbar('Image downloaded successfully', { variant: 'success' });
      } else {
        // Handle regular URLs through download handler
        console.log('Calling downloadHandler.handleDownload with:', imageData.url, filename);
        await downloadHandler.handleDownload(imageData.url, filename);
        console.log('Download handler completed');
        // Don't show success here as the handler will either download or show modal
      }
    } catch (error) {
      console.error('Download error:', error);
      enqueueSnackbar('Failed to download image. Please try again.', { variant: 'error' });
    }
  };

  const generateDownloadFilename = () => {
    const randomString = Math.random().toString(36).substring(2, 8);
    const cleanTitle = (imageData.title || imageData.prompt || 'image')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    return `${cleanTitle}-${randomString}.jpg`;
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
  const handleResetZoom = () => setZoom(1);

  // Toggle comparison mode
  const toggleComparisonMode = () => {
    if (canCompare) {
      setComparisonMode(!comparisonMode);
      setZoom(1);
    }
  };

  // Get model display name
  const getModelDisplayName = (model) => {
    return modelConfigurations[model]?.name || model;
  };

  // Get model color
  const getModelColor = (model) => {
    const colors = {
      'generate-image': '#667eea',
      'hair-style': '#f093fb',
      'headshot': '#4facfe',
      'restore-image': '#fa709a',
      'text-removal': '#fee140',
      'reimagine': '#a8edea',
      'combine-image': '#d299c2'
    };
    return colors[model] || '#667eea';
  };

  // Check if comparison is available
  const canCompare = imageData?.hasComparison && imageData?.inputUrls && imageData.inputUrls.length > 0;
  const beforeImage = canCompare ? imageData.inputUrls[0].url : null;
  const afterImage = imageData?.url || null;

  // Get comparison labels
  const getComparisonLabels = (model) => {
    switch (model) {
      case 'headshot':
        return { before: 'Original Photo', after: 'Professional Headshot' };
      case 'text-removal':
        return { before: 'With Text', after: 'Text Removed' };
      case 'restore-image':
        return { before: 'Original Photo', after: 'Restored Photo' };
      case 'hair-style':
        return { before: 'Original Hair', after: 'New Hair Style' };
      case 're-imagine':
      case 'reimagine':
        return { before: 'Original Photo', after: 'Reimagined' };
      case 'background-removal':
        return { before: 'With Background', after: 'Background Removed' };
      case 'remove-object':
        return { before: 'With Object', after: 'Object Removed' };
      default:
        return { before: 'Before', after: 'After' };
    }
  };

  const labels = imageData ? getComparisonLabels(imageData.model) : { before: 'Before', after: 'After' };

  if (loading) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (!imageData) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{imageData.title || imageData.prompt || 'Gallery Image'} | PicFix.ai Gallery</title>
        <meta name="description" content={imageData.prompt || 'View this amazing AI-generated image'} />
        <meta property="og:title" content={imageData.title || imageData.prompt} />
        <meta property="og:image" content={imageData.url} />
        <meta property="og:type" content="website" />
      </Head>

      {/* Full-screen backdrop */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(20px)',
          zIndex: 9999,
          overflow: 'hidden',
          display: 'flex',
        }}
      >
        {/* Main Image Container */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            height: '100vh',
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={() => router.push('/gallery')}
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

          {/* Navigation Arrows */}
          {allImages.length > 1 && (
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
                disabled={currentIndex === allImages.length - 1}
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

          {/* Image Counter */}
          {allImages.length > 1 && (
            <Chip
              label={`${currentIndex + 1} / ${allImages.length}`}
              size="small"
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                backgroundColor: alpha(theme.palette.background.paper, 0.9),
                color: theme.palette.text.primary,
                zIndex: 1000,
              }}
            />
          )}

          {/* Model Badge */}
          <Box sx={{ position: 'absolute', top: 16, left: allImages.length > 1 ? 120 : 16, zIndex: 1000 }}>
            <Chip
              label={getModelDisplayName(imageData.model)}
              size="small"
              sx={{
                backgroundColor: getModelColor(imageData.model),
                color: 'white',
                fontSize: '12px',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            />
          </Box>

          {/* Like Button (for community images) */}
          {imageData.isCommunity && (
            <Box sx={{ position: 'absolute', top: 70, left: 16, zIndex: 1000 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: alpha('#000000', 0.75),
                  borderRadius: 3,
                  px: 1.5,
                  py: 1,
                  gap: 0.75,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <Tooltip title={!session ? "Login to like" : imageData.userLiked ? "Unlike" : "Like"}>
                  <IconButton
                    size="small"
                    onClick={handleLikeToggle}
                    sx={{
                      color: imageData.userLiked ? '#ff4757' : '#ffffff',
                      p: 0.5,
                      '&:hover': {
                        transform: 'scale(1.3)',
                        color: '#ff4757',
                        backgroundColor: alpha('#ffffff', 0.1)
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {!session ? (
                      <FavoriteBorderIcon fontSize="medium" />
                    ) : imageData.userLiked ? (
                      <FavoriteIcon fontSize="medium" />
                    ) : (
                      <FavoriteBorderIcon fontSize="medium" />
                    )}
                  </IconButton>
                </Tooltip>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {imageData.likes || 0}
                </Typography>
              </Box>
            </Box>
          )}

          {comparisonMode ? (
            /* Comparison Slider View */
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'stretch',
                justifyContent: 'center',
                padding: 2,
                overflow: 'hidden',
                position: 'relative',
              }}
              onContextMenu={(e) => e.preventDefault()}
            >
              <ImageComparisonSlider
                beforeImage={beforeImage}
                afterImage={afterImage}
                beforeLabel={labels.before}
                afterLabel={labels.after}
                className="modal-comparison"
              />

              {/* Exit Comparison Button */}
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
                  right: 70,
                  display: 'flex',
                  gap: 1,
                  zIndex: 1000,
                }}
              >
                {/* Download Button */}
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
                {canCompare && (
                  <Tooltip title="Switch to Comparison View">
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
                      <CompareIcon />
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
                  zIndex: 1000,
                }}
              />

              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 2,
                }}
              >
                <img
                  src={imageData.url}
                  alt={imageData.title || imageData.prompt || 'Gallery image'}
                  referrerPolicy="no-referrer"
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  style={{
                    maxWidth: '95%',
                    maxHeight: '95%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    transform: `scale(${zoom})`,
                    transition: 'transform 0.2s ease',
                    cursor: zoom > 1 ? 'grab' : 'default',
                    userSelect: 'none',
                    pointerEvents: 'auto',
                  }}
                />
              </Box>
            </>
          )}
        </Box>

        {/* Info Panel - Right Side */}
        <Paper
          elevation={0}
          sx={{
            width: 320,
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 0,
            overflowY: 'auto',
            '@media (max-width: 900px)': {
              display: 'none', // Hide on mobile
            }
          }}
        >
          {/* Header */}
          <Box sx={{ p: 3, pb: 2 }}>
            <Chip
              label={getModelDisplayName(imageData.model)}
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
                  High Quality
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                  Format
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  JPEG
                </Typography>
              </Box>

              {imageData.createdAt && (
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                    Created
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {new Date(imageData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
              )}

              {imageData.author && (
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                    Author
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {imageData.author}
                  </Typography>
                </Box>
              )}

              {imageData.prompt && (
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
                    "{imageData.prompt.replace(".jpg", "").replace(".png", "")}"
                  </Typography>
                </Box>
              )}

              {imageData.isCommunity && (
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                    Engagement
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {imageData.likes || 0}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Likes
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {imageData.views || 0}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Views
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}
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

              {imageData.isCommunity && (
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={imageData.userLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  onClick={handleLikeToggle}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    color: imageData.userLiked ? '#ff4757' : 'inherit',
                    borderColor: imageData.userLiked ? '#ff4757' : 'inherit',
                  }}
                >
                  {imageData.userLiked ? 'Unlike' : 'Like'} ({imageData.likes || 0})
                </Button>
              )}
            </Stack>
          </Box>
        </Paper>
      </Box>

      {/* Download Modal */}
      <DownloadModal {...downloadHandler.modalProps} />
    </>
  );
};

export default GalleryImagePage;

