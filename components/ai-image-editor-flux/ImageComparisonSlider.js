import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Fade,
  styled,
  alpha,
  useTheme
} from '@mui/material';
import CompareIcon from '@mui/icons-material/Compare';
import CloseIcon from '@mui/icons-material/Close';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const ComparisonContainer = styled(Box)(({ theme, className }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  background: 'linear-gradient(145deg, #f0f2f5, #ffffff)',
  border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  [theme.breakpoints.down('sm')]: {
    maxWidth: '100%',
    margin: '0',
    borderRadius: theme.spacing(1),
  },
  // Modal-specific styles
  ...(className === 'modal-comparison' && {
    maxWidth: '100%',
    height: '100%',
    maxHeight: '100%',
    margin: 0,
    borderRadius: theme.spacing(1),
    background: 'rgba(0, 0, 0, 0.1)',
    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column',
  }),
}));

const ImageContainer = styled(Box)(({ theme, className }) => ({
  position: 'relative',
  width: '100%',
  height: '400px',
  overflow: 'hidden',
  cursor: 'grab',
  '&:active': {
    cursor: 'grabbing',
  },
  [theme.breakpoints.down('sm')]: {
    height: '300px',
  },
  [theme.breakpoints.down('xs')]: {
    height: '250px',
  },
  // Modal-specific styles
  ...(className === 'modal-comparison' && {
    height: '100%',
    maxHeight: '100%',
    minHeight: '300px',
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  }),
}));

const Image = styled('img')(({ className }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: className === 'modal-comparison' ? 'contain' : 'cover',
  userSelect: 'none',
  pointerEvents: 'none',
  WebkitUserDrag: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
}));

const SliderHandle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  bottom: 0,
  width: '4px',
  backgroundColor: theme.palette.primary.main,
  cursor: 'ew-resize',
  zIndex: 10,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '40px',
    height: '40px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '50%',
    border: `3px solid ${theme.palette.background.paper}`,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '16px',
    height: '16px',
    backgroundColor: theme.palette.background.paper,
    borderRadius: '2px',
    maskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\'%3E%3Cpath d=\'M8 6l4-4 4 4M8 18l4 4 4-4M3 12h18\'/%3E%3C/svg%3E")',
    maskSize: 'contain',
    maskRepeat: 'no-repeat',
    maskPosition: 'center',
  },
}));

const ControlsOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  display: 'flex',
  gap: theme.spacing(1),
  zIndex: 20,
}));

const LabelOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  padding: theme.spacing(1, 2),
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  zIndex: 15,
}));

const HoverPrompt = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  padding: theme.spacing(2, 3),
  backgroundColor: alpha(theme.palette.background.paper, 0.95),
  backdropFilter: 'blur(20px)',
  borderRadius: theme.spacing(3),
  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  textAlign: 'center',
  zIndex: 25,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
}));

const ImageComparisonSlider = ({ 
  beforeImage, 
  afterImage, 
  beforeLabel = "Before",
  afterLabel = "After", 
  onClose,
  className 
}) => {
  const theme = useTheme();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [showHoverPrompt, setShowHoverPrompt] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      // Mouse events
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      
      // Touch events for mobile
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  const handleStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setIsActive(true);
    setShowHoverPrompt(false);
  };

  const handleContainerClick = () => {
    if (!isActive) {
      setIsActive(true);
      setShowHoverPrompt(false);
    }
  };

  const handleSwapImages = () => {
    // This would swap the before and after images
    // For now, we'll just animate the slider
    setSliderPosition(sliderPosition > 50 ? 25 : 75);
  };

  if (!beforeImage || !afterImage) {
    return null;
  }

  return (
    <ComparisonContainer className={className}>
      <ImageContainer
        className={className}
        ref={containerRef}
        onClick={handleContainerClick}
        onMouseEnter={() => !isActive && setShowHoverPrompt(true)}
        onMouseLeave={() => !isActive && setShowHoverPrompt(false)}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Before Image */}
        <Image 
          src={beforeImage} 
          alt={beforeLabel} 
          className={className} 
          referrerPolicy="no-referrer"
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        />
        
        {/* After Image with clip-path */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            clipPath: `polygon(${sliderPosition}% 0%, 100% 0%, 100% 100%, ${sliderPosition}% 100%)`,
            transition: isDragging ? 'none' : 'clip-path 0.3s ease',
          }}
        >
          <Image 
            src={afterImage} 
            alt={afterLabel} 
            className={className} 
            referrerPolicy="no-referrer"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
        </Box>

        {/* Slider Handle */}
        {isActive && (
          <SliderHandle
            sx={{
              left: `calc(${sliderPosition}% - 2px)`,
              transition: isDragging ? 'none' : 'left 0.3s ease',
            }}
            onMouseDown={handleStart}
            onTouchStart={handleStart}
          />
        )}

        {/* Hover Prompt */}
        {/* <Fade in={showHoverPrompt && !isActive}>
          <HoverPrompt>
            <CompareIcon sx={{ fontSize: 32, color: theme.palette.primary.main, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              Click to Compare
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Click and drag to see the difference
            </Typography>
          </HoverPrompt>
        </Fade> */}

        {/* Labels */}
        {/* {isActive && ( */}
          <>
            <LabelOverlay sx={{ 
              left: theme.spacing(2),
              ...(className === 'modal-comparison' && {
                backgroundColor: alpha(theme.palette.background.paper, 0.95),
                backdropFilter: 'blur(10px)',
              })
            }}>
              <Typography variant="caption" sx={{ 
                fontWeight: 600, 
                color: className === 'modal-comparison' ? theme.palette.text.primary : theme.palette.text.primary 
              }}>
                {beforeLabel}
              </Typography>
            </LabelOverlay>
            <LabelOverlay sx={{ 
              right: theme.spacing(className === 'modal-comparison' ? 2 : 6),
              ...(className === 'modal-comparison' && {
                backgroundColor: alpha(theme.palette.background.paper, 0.95),
                backdropFilter: 'blur(10px)',
              })
            }}>
              <Typography variant="caption" sx={{ 
                fontWeight: 600, 
                color: className === 'modal-comparison' ? theme.palette.text.primary : theme.palette.text.primary 
              }}>
                {afterLabel}
              </Typography>
            </LabelOverlay>
          </>
        {/* )} */}

        {/* Controls */}
        {className !== 'modal-comparison' && (
          <ControlsOverlay>
            <Tooltip title="Swap Images">
              <IconButton
                onClick={handleSwapImages}
                sx={{
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.background.paper, 1),
                  },
                }}
              >
                <SwapHorizIcon />
              </IconButton>
            </Tooltip>
            {onClose && (
              <Tooltip title="Close Comparison">
                <IconButton
                  onClick={onClose}
                  sx={{
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.main,
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            )}
          </ControlsOverlay>
        )}
        
        {/* Modal-specific controls */}
        {className === 'modal-comparison' && (
          <ControlsOverlay>
            <Tooltip title="Swap Images">
              <IconButton
                onClick={handleSwapImages}
                sx={{
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  color: theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  },
                }}
              >
                <SwapHorizIcon />
              </IconButton>
            </Tooltip>
          </ControlsOverlay>
        )}
      </ImageContainer>

      {/* Progress Indicator */}
      { className !== 'modal-comparison' && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: alpha(theme.palette.divider, 0.1),
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${sliderPosition}%`,
              backgroundColor: theme.palette.primary.main,
              transition: isDragging ? 'none' : 'width 0.3s ease',
            }}
          />
        </Box>
      )}
    </ComparisonContainer>
  );
};

export default ImageComparisonSlider; 