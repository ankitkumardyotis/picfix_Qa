import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  alpha,
  useTheme,
  Container,
  Skeleton,
  IconButton,
  Tooltip
} from '@mui/material';
import Masonry from '@mui/lab/Masonry';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LoginIcon from '@mui/icons-material/Login';
import CompareIcon from '@mui/icons-material/Compare';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useSnackbar } from 'notistack';
import modelConfigurations from '../constant/ModelConfigurations';

const CommunityGallery = () => {
  const theme = useTheme();
  const router = useRouter();
  const { data: session } = useSession();
  const { enqueueSnackbar } = useSnackbar();
  const [communityImages, setCommunityImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalImages, setTotalImages] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Image loading states for skeleton loaders
  const [imageLoadingStates, setImageLoadingStates] = useState({});

  // Infinite scroll refs
  const loadMoreTriggerRef = useRef(null);
  const isLoadingRef = useRef(false);
  const scrollPositionRef = useRef(0);
  const containerRef = useRef(null);

  const IMAGES_PER_PAGE = 12;

  // Fetch community images with server-side pagination
  const fetchCommunityImages = async (page = 1, append = false) => {
    try {
      setLoading(true);

      // Use the unified API with proper pagination
      const response = await fetch('/api/images/getUnifiedGallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: page,
          limit: IMAGES_PER_PAGE, // Only fetch 12 images per page
          sortBy: 'createdAt'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const newImages = data.images;
          console.log(data);

    

          // Update images (append for pagination, replace for initial load)
          if (append) {
            // For infinite scroll, preserve scroll position
            const currentScrollY = window.scrollY;
            const documentHeight = document.documentElement.scrollHeight;

            setCommunityImages(prev => [...prev, ...newImages]);

            // Use requestAnimationFrame to ensure DOM has updated
            requestAnimationFrame(() => {
              // Calculate how much the document grew
              const newDocumentHeight = document.documentElement.scrollHeight;
              const heightIncrease = newDocumentHeight - documentHeight;

              // Only adjust scroll if content was added and user is still near the bottom
              if (heightIncrease > 0 && currentScrollY > 0) {
                // Maintain relative position
                window.scrollTo({
                  top: currentScrollY,
                  behavior: 'instant'
                });
              }
            });
          } else {
            setCommunityImages(newImages);
            setTotalImages(data.total || newImages.length);
          }

          // Update pagination state
          setHasMore(data.hasMore || (page * IMAGES_PER_PAGE < (data.total || newImages.length)));

          // Initialize loading states for new images - only for images that will be visible
          const loadingStates = {};
          newImages.forEach((image, index) => {
            const imageId = `community-${image.id || index}`;
            loadingStates[imageId] = true; // Start with loading = true
          });

          if (append) {
            setImageLoadingStates(prev => ({ ...prev, ...loadingStates }));
          } else {
            setImageLoadingStates(loadingStates);
          }

          // Reduced timeout to 5 seconds (prevents infinite loading)
          setTimeout(() => {
            setImageLoadingStates(prev => {
              const updated = { ...prev };
              Object.keys(loadingStates).forEach(imageId => {
                if (updated[imageId] === true) {
                  updated[imageId] = false;
                }
              });
              return updated;
            });
          }, 5000);
        } else {
          console.error('Error fetching community images:', data.error);
          if (!append) {
            setCommunityImages([]);
            setTotalImages(0);
          }
        }
      } else {
        console.error('Failed to fetch community images');
        if (!append) {
          setCommunityImages([]);
          setTotalImages(0);
        }
      }

    } catch (error) {
      console.error('Error fetching community images:', error);
      if (!append) {
        setCommunityImages([]);
        setTotalImages(0);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load more images from server (optimized for infinite scroll)
  const loadMoreImages = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isLoadingRef.current || !hasMore) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoadingMore(true);

    try {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      await fetchCommunityImages(nextPage, true); // append = true (scroll preservation handled inside)
    } catch (error) {
      console.error('Error loading more images:', error);
    } finally {
      isLoadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMore]);

  useEffect(() => {
    fetchCommunityImages(1, false); // page = 1, append = false
  }, []);

  // Infinite scroll effect with Intersection Observer
  useEffect(() => {
    const currentTrigger = loadMoreTriggerRef.current;

    if (!currentTrigger) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        // Load more when trigger element is visible and we have more images
        if (entry.isIntersecting && hasMore && !loading && !isLoadingMore) {
          loadMoreImages();
        }
      },
      {
        // Trigger when element is 100px away from being visible
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    observer.observe(currentTrigger);

    return () => {
      if (currentTrigger) {
        observer.unobserve(currentTrigger);
      }
    };
  }, [hasMore, loading, isLoadingMore, loadMoreImages]);



  // Generate slug from title and ID for URL routing
  const generateSlug = (title, id) => {
    const cleanTitle = (title || 'image')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    return `${cleanTitle}-${id}`;
  };

  // Image click handler - Navigate to full-page view
  const handleCommunityImageClick = (imageData) => {
    // Generate unique ID from publishedImageId, exampleImageId, or fallback to id
    const imageId = imageData.publishedImageId || imageData.exampleImageId || imageData.id;
    const slug = generateSlug(imageData.title || imageData.prompt, imageId);
    
    // Navigate to the full-page preview
    router.push(`/gallery/${slug}`);
  };


  // Handle prompt use (navigate to AI editor)
  const handlePromptUse = (prompt, model) => {
    const modelRoutes = {
      'generate-image': '/ai-image-editor',
      'hair-style': '/ai-image-editor',
      'headshot': '/ai-image-editor',
      'restore-image': '/restorePhoto',
      'text-removal': '/ai-image-editor',
      'reimagine': '/ai-image-editor',
      'combine-image': '/ai-image-editor'
    };

    const route = modelRoutes[model] || '/ai-image-editor';
    router.push(route);
  };

  // Image loading state handlers (optimized with useCallback)
  const handleImageLoad = useCallback((imageId) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [imageId]: false
    }));
  }, []);

  const handleImageError = useCallback((imageId) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [imageId]: false
    }));
  }, []);


  // Handle like/unlike functionality for community images only
  const handleLikeToggle = async (image, currentlyLiked) => {
    // Only allow liking community images
    if (!image.isCommunity) {
      enqueueSnackbar('You can only like community images', { variant: 'info' });
      return;
    }

    if (!session) {
      enqueueSnackbar('Please log in to like images', { variant: 'warning' });
      router.push('/login');
      return;
    }

    try {
      const action = currentlyLiked ? 'unlike' : 'like';

      const requestBody = {
        action: action,
        publishedImageId: image.publishedImageId
      };

      const response = await fetch('/api/images/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();

        // Update the community image in the state
        const updateFunction = (img) => {
          return img.publishedImageId === image.publishedImageId
            ? { ...img, likes: data.likes, userLiked: data.userLiked }
            : img;
        };

        setCommunityImages(prev => prev.map(updateFunction));

        enqueueSnackbar(
          action === 'like' ? '❤️ Liked!' : '💔 Unliked',
          { variant: 'success' }
        );
      } else {
        const errorData = await response.json();
        enqueueSnackbar(errorData.error || 'Failed to update like', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      enqueueSnackbar('Failed to update like', { variant: 'error' });
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

  if (communityImages.length === 0 && !loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <AutoAwesomeIcon sx={{ fontSize: 64, color: theme.palette.grey[400], mb: 2 }} />
          <Typography variant="h5" color="textSecondary" gutterBottom>
            No images in gallery yet
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
            Be the first to share your AI-generated creations!
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 4, fontStyle: 'italic' }}>
            💡 Create images in the AI editor and click the "Publish" button to share them here. You'll also see curated example images!
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/ai-image-editor')}
            sx={{
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              borderRadius: 3,
              px: 4,
              py: 1.5
            }}
          >
            Start Creating & Publishing
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" ref={containerRef}>
      <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Typography
          variant="h3"
          component="h2"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg,rgb(244,0,123) 0%, #d76d77 50%, #ff8418 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          AI Gallery
        </Typography>
        <Typography
          variant="h6"
          color="textSecondary"
          sx={{ mb: 2, maxWidth: 600, mx: 'auto' }}
        >
          Discover amazing AI-generated images from our community and curated examples
        </Typography>

        {totalImages > 0 && (
          <Chip
            label={`${totalImages} total images`}
            variant="outlined"
            sx={{
              fontSize: '0.9rem',
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main
            }}
          />
        )}
      </Box>

      {/* Show loading indicator when loading more images */}
      {loading && communityImages && communityImages.length > 0 && (
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="textSecondary">
              Loading more images...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Community Images Masonry (optimized for scroll stability) */}
      <Masonry
        columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
        spacing={0.5}
        sx={{
          width: '100%',
          margin: 0,
          opacity: loading && communityImages.length === 0 ? 0.7 : 1,
          transition: 'opacity 0.3s ease',
          // Prevent layout shifts during loading
          minHeight: communityImages.length > 0 ? 'auto' : '400px',
        }}
      >
        {communityImages.map((image, index) => {
          const imageId = `community-${image.id || index}`;
          const isLoading = imageLoadingStates[imageId] !== false;

          return (
            <Box
              key={imageId}
              sx={{
                position: 'relative',
                borderRadius: 1,
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                // Prevent layout shifts
                contain: 'layout style paint',
                willChange: 'transform',
                // Reserve space for the image
                minHeight: `${image.height || 280}px`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  '& .image-actions': {
                    opacity: 1,
                  }
                },
              }}
              onClick={() => handleCommunityImageClick({
                ...image,
                index,
                images: communityImages
              })}
              onContextMenu={(e) => e.preventDefault()}
            >
              {/* Loading skeleton overlay */}
              {isLoading && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1,
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height="100%"
                    animation="wave"
                    sx={{
                      borderRadius: 1,
                      backgroundColor: alpha(theme.palette.grey[300], 0.3)
                    }}
                  />
                </Box>
              )}

              {/* Model and Type Badges */}
              <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2, display: 'flex', gap: 0.5, flexDirection: 'column' }}>
                <Chip
                  label={getModelDisplayName(image.model)}
                  size="small"
                  sx={{
                    backgroundColor: getModelColor(image.model),
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 600,
                    height: 20,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                />
                {/* {image.isExample && (
                  <Chip 
                    label="Example"
                    size="small"
                    sx={{
                      backgroundColor: alpha('#ff9800', 0.9),
                      color: 'white',
                      fontSize: '9px',
                      fontWeight: 600,
                      height: 18,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                )}
                {image.isCommunity && (
                  <Chip 
                    label="Community"
                    size="small"
                    sx={{
                      backgroundColor: alpha('#4caf50', 0.9),
                      color: 'white',
                      fontSize: '9px',
                      fontWeight: 600,
                      height: 18,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                )} */}
              </Box>

              <img
                src={image.url}
                alt={image.title || 'Community creation'}
                referrerPolicy="no-referrer"
                loading="lazy"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                style={{
                  width: '100%',
                  height: `${image.height || 280}px`,
                  objectFit: 'cover',
                  display: 'block',
                  borderRadius: '8px',
                  // Prevent layout shift by maintaining aspect ratio
                  aspectRatio: 'auto',
                  userSelect: 'none',
                  WebkitUserDrag: 'none',
                  pointerEvents: 'auto',
                }}
                onLoad={() => {
                  handleImageLoad(imageId);
                }}
                onError={() => {
                  handleImageError(imageId);
                }}
              />

              {/* Like button overlay (top-right) - Only for community images */}
              {image.isCommunity && (
                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 3 }}>
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
                    <Tooltip title={!session ? "Login to like" : image.userLiked ? "Unlike" : "Like"}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLikeToggle(image, image.userLiked);
                        }}
                        sx={{
                          color: image.userLiked ? '#ff4757' : '#ffffff',
                          p: 0.5,
                          '&:hover': {
                            transform: 'scale(1.3)',
                            color: '#ff4757',
                            backgroundColor: alpha('#ffffff', 0.1)
                          },
                          transition: 'all 0.2s ease',
                          borderRadius: 2
                        }}
                      >
                        {!session ? (
                          <FavoriteBorderIcon fontSize="medium" />
                        ) : image.userLiked ? (
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
                        minWidth: '16px',
                        textAlign: 'center'
                      }}
                    >
                      {image.likes || 0}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* View count for platform/example images (optional) */}
              {/* {image.isExample && (
                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 3 }}>
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
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 600,
                        textAlign: 'center'
                      }}
                    >
                      Created By PicFix.ai
                    </Typography>
                  </Box>
                </Box>
              )} */}

              {/* Action overlay with comparison support */}
              <Box
                className="image-actions"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                {/* Top actions (comparison button) */}
                {image.hasComparison && image.inputUrls && image.inputUrls.length > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, p: 1 }}>
                    <Tooltip title="Compare Before/After">
                      <IconButton
                        size="small"
                        sx={{
                          backgroundColor: alpha(theme.palette.primary.main, 0.9),
                          color: 'white',
                          '&:hover': {
                            backgroundColor: theme.palette.primary.main,
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCommunityImageClick({
                            ...image,
                            index,
                            images: communityImages
                          });
                        }}
                      >
                        <CompareIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}

                {/* Bottom content */}
                <Box sx={{ p: 1 }}>
                  {/* Author info for community images */}
                  {image.author && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: alpha('#ffffff', 0.8),
                        fontSize: '10px',
                        mb: 1,
                        display: 'block'
                      }}
                    >
                      by {image.author}
                    </Typography>
                  )}

                  {image.prompt && (
                    <Chip
                      label="Use this prompt"
                      size="small"
                      clickable
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.9),
                        color: 'white',
                        fontSize: '10px',
                        height: 24,
                        '&:hover': {
                          backgroundColor: theme.palette.primary.main,
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePromptUse(image.prompt, image.model);
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          );
        })}

        {/* Loading Skeletons */}
        {loading && communityImages.length === 0 && (
          Array(IMAGES_PER_PAGE).fill(null).map((_, index) => (
            <Box key={`skeleton-${index}`} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={Math.floor(Math.random() * 100) + 200}
                animation="wave"
              />
            </Box>
          ))
        )}
      </Masonry>

      {/* Infinite Scroll Trigger and Loading Indicator */}
      {hasMore && (
        <Box sx={{ textAlign: 'center', mt: 6, mb: 4 }}>
          {/* Invisible trigger element for intersection observer */}
          <Box
            ref={loadMoreTriggerRef}
            sx={{
              height: '20px',
              width: '100%',
              // Uncomment below line to visualize the trigger (for debugging)
              // backgroundColor: 'rgba(255, 0, 0, 0.1)'
            }}
          />

          {/* Loading indicator for infinite scroll */}
          {(loading || isLoadingMore) && (
            <Box sx={{ mt: 2 }}>
              <CircularProgress size={32} />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Loading more amazing images...
              </Typography>
            </Box>
          )}

          {/* Progress indicator */}
          {!loading && !isLoadingMore && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Showing {communityImages.length} of {totalImages} images
            </Typography>
          )}
        </Box>
      )}

      {/* End of content message */}
      {!hasMore && communityImages.length > 0 && (
        <Box sx={{ textAlign: 'center', mt: 6, mb: 4 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            ✨ You've reached the end! Showing all {totalImages} images
          </Typography>

          <Box sx={{ p: 4, borderRadius: 3, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
            <Typography variant="h6" gutterBottom>
              🎨 Ready to create your own masterpiece?
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
              Join our community and share your AI-generated creations alongside curated examples!
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/ai-image-editor')}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              }}
            >
              Start Creating Now
            </Button>
          </Box>
        </Box>
      )}

    </Container>
  );
};

export default CommunityGallery; 