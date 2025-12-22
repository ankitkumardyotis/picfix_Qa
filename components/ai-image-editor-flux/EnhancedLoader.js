import React from 'react';
import {
  Box,
  useTheme,
  alpha,
  CircularProgress
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Brush as BrushIcon,
  Home as HomeIcon,
  RemoveCircle as RemoveCircleIcon,
  Restore as RestoreIcon,
  Portrait as PortraitIcon,
  Merge as MergeIcon,
  Edit as EditIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';

const getModelInfo = (selectedModel) => {
  const modelConfigs = {
    'generate-image': {
      icon: <AutoAwesomeIcon />,
      title: 'Generating Image',
      description: 'Creating your image with AI magic...',
      color: '#667eea',
      estimatedTime: '30-60 seconds'
    },
    'hair-style': {
      icon: <BrushIcon />,
      title: 'Changing Hair Style',
      description: 'Transforming your hairstyle...',
      color: '#667eea',
      estimatedTime: '20-40 seconds'
    },
    'text-removal': {
      icon: <EditIcon />,
      title: 'Removing Text',
      description: 'Intelligently removing text from image...',
      color: '#667eea',
      estimatedTime: '15-30 seconds'
    },
     'headshot': {
      icon: <PortraitIcon />,
      title: 'Creating Headshot',
      description: 'Generating professional headshot...',
      color: '#667eea',
      estimatedTime: '25-45 seconds'
    },
    'restore-image': {
      icon: <RestoreIcon />,
      title: 'Restoring Image',
      description: 'Enhancing and restoring image quality...',
      color: '#667eea',
      estimatedTime: '20-40 seconds'
    },
    'gfp-restore': {
      icon: <RestoreIcon />,
      title: 'GFP Restore',
      description: 'Advanced image restoration in progress...',
      color: '#667eea',
      estimatedTime: '25-50 seconds'
    },
    'home-designer': {
      icon: <HomeIcon />,
      title: 'Designing Interior',
      description: 'Creating your dream interior design...',
      color: '#667eea',
      estimatedTime: '30-60 seconds'
    },
    'background-removal': {
      icon: <RemoveCircleIcon />,
      title: 'Removing Background',
      description: 'Precisely removing background...',
      color: '#667eea',
      estimatedTime: '10-25 seconds'
    },
    'remove-object': {
      icon: <RemoveCircleIcon />,
      title: 'Removing Object',
      description: 'Intelligently removing selected object...',
      color: '#667eea',
      estimatedTime: '15-35 seconds'
    },
    'reimagine': {
      icon: <PsychologyIcon />,
      title: 'ReImagine Scenarios',
      description: 'Generating ReImagine Scenarios...',
      color: '#667eea',
      estimatedTime: '25-45 seconds'
    },
    'combine-image': {
      icon: <MergeIcon />,
      title: 'Combining Images',
      description: 'Intelligently merging your images...',
      color: '#667eea',
      estimatedTime: '20-40 seconds'
    },
    'edit-image': {
      icon: <EditIcon />,
      title: 'Editing Image',
      description: 'Editing your image...',
      color: '#667eea',
      estimatedTime: '15-30 seconds'
    }
  };

  return modelConfigs[selectedModel] || modelConfigs['generate-image'];
};

const EnhancedLoader = ({
  selectedModel,
  numOutputs = 1,
  size = 'medium',
  showProgress = false,
  showDetails = false
}) => {
  const theme = useTheme();
  const modelInfo = getModelInfo(selectedModel);

  const loaderSizes = {
    small: { spinner: 40, height: '200px' },
    medium: { spinner: 60, height: '280px' },
    large: { spinner: 80, height: '350px' }
  };

  const currentSize = loaderSizes[size];

  return (
    <Box
      sx={{
        width: '100%',
        height: currentSize.height,
        borderRadius: { xs: 1.5, sm: 2 },
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${alpha(modelInfo.color, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        position: 'relative'
      }}
    >
      {/* Spinning Progress Ring */}
      <CircularProgress
        size={currentSize.spinner}
        thickness={3}
        sx={{
          color: modelInfo.color,
          animation: 'spin 1.5s linear infinite',
          '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
          }
        }}
      />
    </Box>
  );
};

export default EnhancedLoader;