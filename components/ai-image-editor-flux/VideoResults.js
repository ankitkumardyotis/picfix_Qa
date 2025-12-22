import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Download,
  Refresh,
  Share,
  Fullscreen,
  AccessTime,
  AspectRatio as AspectRatioIcon
} from '@mui/icons-material';

const VideoResults = ({ 
  videoJobs, 
  loadingVideoJobs, 
  checkVideoStatus, 
  onRefresh 
}) => {
  const theme = useTheme();
  const [playingVideos, setPlayingVideos] = useState({});

  const handleVideoPlay = (jobId) => {
    setPlayingVideos(prev => ({ ...prev, [jobId]: true }));
  };

  const handleVideoPause = (jobId) => {
    setPlayingVideos(prev => ({ ...prev, [jobId]: false }));
  };

  const handleDownload = async (videoUrl, prompt) => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video-${prompt.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading video:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'succeeded': return 'success';
      case 'failed': return 'error';
      case 'running': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'succeeded': return 'Completed';
      case 'failed': return 'Failed';
      case 'running': return 'Generating...';
      default: return status;
    }
  };

  if (loadingVideoJobs) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 200,
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Loading your video generations...
        </Typography>
      </Box>
    );
  }

  if (!videoJobs || videoJobs.length === 0) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        py: 8,
        px: 4
      }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No video generations yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Start by entering a prompt and clicking "Generate Video" to create your first AI video.
        </Typography>
        <Alert severity="info" sx={{ maxWidth: 400, mx: 'auto' }}>
          Video generation costs 10 credits and typically takes 2-5 minutes to complete.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 2.5
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 1
      }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 700,
          background: 'linear-gradient(135deg, rgb(251,1,118) 0%, #d76d77 50%, #fbc901 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em'
        }}>
          Video Generations
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={onRefresh}
          size="small"
          variant="outlined"
          sx={{ 
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 600,
            px: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              border: `1px solid ${theme.palette.primary.main}`,
              backgroundColor: alpha(theme.palette.primary.main, 0.04)
            }
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Video Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: 'repeat(auto-fit, minmax(320px, 1fr))'
        },
        gap: 2.5
      }}>
        {videoJobs.map((job) => (
          <Card 
            key={job.id} 
            sx={{ 
              borderRadius: 4,
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.04)}`,
              position: 'relative',
              maxWidth: '320px',
            }}
          >
            {/* Video Player or Placeholder */}
            <Box sx={{ 
              position: 'relative', 
              width: '100%', 
             
              // aspectRatio: job.aspectRatio === '16:9' ? '16/9' : 
              //             job.aspectRatio === '9:16' ? '9/16' : '1/1',
              backgroundColor: alpha(theme.palette.common.black, 0.02),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {job.status === 'succeeded' && job.videoUrl ? (
                <video
                  width="100%"
                  height="100%"
                  controls
                  style={{ 
                    objectFit: 'cover',
                    borderRadius: '0'
                  }}
                  onPlay={() => handleVideoPlay(job.id)}
                  onPause={() => handleVideoPause(job.id)}
                >
                  <source src={job.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : job.status === 'running' ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: 2,
                  p: 3
                }}>
                  <Box sx={{ position: 'relative' }}>
                    <CircularProgress 
                      size={48} 
                      thickness={3}
                      sx={{ 
                        color: theme.palette.primary.main,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ fontWeight: 500 }}>
                    Generating video...
                  </Typography>
                  {job.progress && (
                    <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ fontWeight: 400 }}>
                      {job.progress}
                    </Typography>
                  )}
                  {job.estimatedTimeRemaining && (
                    <Chip 
                      icon={<AccessTime />}
                      label={job.estimatedTimeRemaining}
                      size="small"
                      variant="filled"
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        '& .MuiChip-icon': {
                          color: theme.palette.primary.main
                        }
                      }}
                    />
                  )}
                </Box>
              ) : job.status === 'failed' ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: 1.5,
                  p: 3
                }}>
                  <Typography variant="body2" color="error" textAlign="center" sx={{ fontWeight: 600 }}>
                    Generation Failed
                  </Typography>
                  {job.errorMessage && (
                    <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ 
                      maxWidth: '200px',
                      lineHeight: 1.4
                    }}>
                      {job.errorMessage}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Processing...
                </Typography>
              )}

              {/* Status Chip */}
              <Chip
                label={getStatusText(job.status)}
                // color={getStatusColor(job.status)}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  fontSize: '11px',
                  fontWeight: 600,
                  backdropFilter: 'blur(8px)',
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`
                }}
              />
            </Box>

            {/* Card Content */}
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2 }}>
                {/* Prompt */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.4,
                    color: theme.palette.text.primary
                  }}
                >
                  {job.prompt}
                </Typography>

                {/* Metadata */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 0.75, 
                  mb: 2, 
                  flexWrap: 'wrap' 
                }}>
                  <Chip 
                    icon={<AccessTime />}
                    label={`${job.duration}s`}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '11px',
                      fontWeight: 500,
                      height: 24,
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      color: theme.palette.primary.main,
                      '& .MuiChip-icon': {
                        color: theme.palette.primary.main,
                        fontSize: '14px'
                      }
                    }}
                  />
                  <Chip 
                    icon={<AspectRatioIcon />}
                    label={job.aspectRatio}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '11px',
                      fontWeight: 500,
                      height: 24,
                      borderColor: alpha(theme.palette.secondary.main, 0.3),
                      color: theme.palette.secondary.main,
                      '& .MuiChip-icon': {
                        color: theme.palette.secondary.main,
                        fontSize: '14px'
                      }
                    }}
                  />
                  <Chip 
                    label={job.model.replace('kwaivgi/', '').replace('-', ' ')}
                    size="small"
                    variant="filled"
                    sx={{
                      fontSize: '10px',
                      fontWeight: 600,
                      height: 24,
                      backgroundColor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                      textTransform: 'capitalize'
                    }}
                  />
                </Box>
              </Box>

              {/* Actions */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                px: 2,
                // pb: 2,
                // pt: 0,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.06)}`
              }}>
                <Typography variant="caption" color="text.secondary" sx={{ 
                  fontWeight: 500,
                  fontSize: '11px'
                }}>
                  {new Date(job.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Typography>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {job.status === 'running' && (
                    <Tooltip title="Check Status" arrow>
                      <IconButton 
                        size="small" 
                        onClick={() => checkVideoStatus(job.id)}
                        sx={{
                          width: 32,
                          // height: 32,
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                          color: theme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.16),
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Refresh fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {job.status === 'succeeded' && job.videoUrl && (
                    <Tooltip title="Download Video" arrow>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDownload(job.videoUrl, job.prompt)}
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: alpha(theme.palette.success.main, 0.08),
                          color: theme.palette.success.main,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.success.main, 0.16),
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Download fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default VideoResults;