import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  alpha,
  useTheme
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { useSnackbar } from 'notistack';

/**
 * A reusable image uploader component for the AI Image Editor
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Title for the upload section
 * @param {string} props.uploadedImage - Base64 or URL of the uploaded image
 * @param {boolean} props.uploadingImage - Whether the image is currently uploading
 * @param {function} props.onImageUpload - Function to handle image upload event
 * @param {function} props.onImageRemove - Function to handle image removal
 * @param {string} props.height - Height of the upload box (default: '200px')
 * @param {string} props.borderColor - Theme color for the border (default: 'primary')
 * @param {string} props.placeholderText - Text to display when no image is uploaded
 * @param {Object} props.sx - Additional styles to apply to the container
 */
const ImageUploader = ({
  // Required props
  title,
  uploadedImage,
  uploadingImage,
  onImageUpload,
  onImageRemove,
  
  // Optional props with defaults
  height = '200px',
  borderColor = 'primary',
  placeholderText = "Click to upload an image",
  sx = {},
  
  // Props to maintain compatibility with existing code
  // These are not used in this simplified version
  uploadedImageUrl,
  isDragging: externalIsDragging,
  isLoading,
  error,
  aspectRatio,
  qualityMode,
  handleImageUpload,
  handleRemoveImage,
  onImagePreview,
  onImageDownload,
  handlePreviewClose,
  handleDownload,
  handleDragOver: externalHandleDragOver,
  handleDragLeave: externalHandleDragLeave,
  handleDrop: externalHandleDrop,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const uniqueId = `image-upload-${Math.random().toString(36).substring(2, 9)}`;
  const [isDragging, setIsDragging] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const dropAreaRef = useRef(null);

  // Handle the image upload event
  const handleUpload = (e) => {
    // Pass the original event directly to the parent component
    if (onImageUpload) {
      onImageUpload(e);
    } else if (handleImageUpload) {
      handleImageUpload(e);
    }
  };

  // Handle image removal
  const handleRemove = (e) => {
    e.preventDefault();
    if (onImageRemove) {
      onImageRemove();
    } else if (handleRemoveImage) {
      handleRemoveImage(0);
    }
  };

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    if (externalHandleDragOver) {
      externalHandleDragOver(e);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (externalHandleDragLeave) {
      externalHandleDragLeave(e);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    // Process the dropped files
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Check if the dropped file is an image
      if (!file.type.startsWith('image/')) {
        enqueueSnackbar('Only image files are supported', { variant: 'warning' });
        return;
      }
      
      // Create a synthetic event object similar to input onChange
      const fileInputEvent = {
        target: {
          files: e.dataTransfer.files
        }
      };
      
      // Call the upload handler with our synthetic event
      if (onImageUpload) {
        onImageUpload(fileInputEvent);
      } else if (handleImageUpload) {
        handleImageUpload(fileInputEvent);
      }
    }
    
    if (externalHandleDrop) {
      externalHandleDrop(e);
    }
  };

  // Handle clipboard paste
  const handlePaste = (e) => {
    // Check if we're already uploading or if there's an image
    if (uploadingImage || isLoading || uploadedImage) {
      return;
    }

    // Show paste indicator briefly
    setIsPasting(true);
    setTimeout(() => setIsPasting(false), 300);

    const clipboardItems = e.clipboardData.items;
    const items = Array.from(clipboardItems).filter(item => {
      // Filter for image items
      return item.type.indexOf('image') !== -1;
    });

    if (items.length === 0) {
      // Show notification when non-image content is pasted
      if (clipboardItems.length > 0) {
        enqueueSnackbar('Only image files can be pasted here', { 
          variant: 'warning',
          autoHideDuration: 3000
        });
      }
      return;
    }

    // Get the first image from clipboard
    const item = items[0];
    const blob = item.getAsFile();
    
    // Create a synthetic event object similar to input onChange
    const fileInputEvent = {
      target: {
        files: [blob]
      }
    };
    
    // Call the upload handler with our synthetic event
    if (onImageUpload) {
      onImageUpload(fileInputEvent);
    } else if (handleImageUpload) {
      handleImageUpload(fileInputEvent);
    }
  };

  // Add and remove paste event listener
  useEffect(() => {
    const dropArea = dropAreaRef.current;
    if (dropArea) {
      dropArea.addEventListener('paste', handlePaste);
      
      // Also add a global paste event listener
      document.addEventListener('paste', handlePaste);
      
      return () => { 
        dropArea.removeEventListener('paste', handlePaste);
        document.removeEventListener('paste', handlePaste);
      };
    }
  }, [uploadingImage, isLoading, uploadedImage]);

  return (
    <Box sx={sx}>
      {title && (
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          {title}
        </Typography>
      )}
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        id={uniqueId}
        onChange={(e) => {
          const file = e.target.files && e.target.files[0];
          if (file && !file.type.startsWith('image/')) {
            enqueueSnackbar('Only image files are supported', { variant: 'warning' });
            return;
          }
          handleUpload(e);
        }}
      />
      <label htmlFor={uniqueId}>
        <Box
          ref={dropAreaRef}
          tabIndex={0} // Make it focusable for keyboard events
          sx={{
            width: '100%',
            height: uploadedImage ? 'auto' : height,
            border: `2px dashed ${alpha(theme.palette[borderColor].main, isDragging || isPasting ? 0.8 : 0.3)}`,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            bgcolor: alpha(theme.palette[borderColor].main, isDragging || isPasting ? 0.1 : 0.05),
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: theme.palette[borderColor].main,
              bgcolor: alpha(theme.palette[borderColor].main, 0.08),
            },
            '&:focus': {
              outline: 'none',
              borderColor: theme.palette[borderColor].main,
              boxShadow: `0 0 0 2px ${alpha(theme.palette[borderColor].main, 0.25)}`,
            },
            ...(isDragging && {
              borderColor: theme.palette[borderColor].main,
              bgcolor: alpha(theme.palette[borderColor].main, 0.15),
              boxShadow: `0 0 10px ${alpha(theme.palette[borderColor].main, 0.3)}`,
            }),
            ...(isPasting && {
              borderColor: theme.palette.success.main,
              bgcolor: alpha(theme.palette.success.main, 0.1),
              boxShadow: `0 0 10px ${alpha(theme.palette.success.main, 0.3)}`,
            }),
            ...(externalIsDragging && {
              borderColor: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            }),
          }}
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {uploadedImage ? (
            <Box sx={{ position: 'relative', width: '100%' }}>
              <img
                src={uploadedImage}
                alt="Uploaded"
                style={{
                  width: '100%',
                  maxHeight: '300px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  opacity: uploadingImage || isLoading ? 0.5 : 1,
                }}
              />
              {(uploadingImage || isLoading) && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <CircularProgress />
                </Box>
              )}
              <IconButton
                onClick={handleRemove}
                disabled={uploadingImage || isLoading}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.7)',
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'rgba(0,0,0,0.3)',
                    color: 'rgba(255,255,255,0.5)',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              {isDragging ? (
                <FileUploadIcon sx={{ fontSize: 50, color: theme.palette[borderColor].main, mb: 1 }} />
              ) : isPasting ? (
                <ContentPasteIcon sx={{ fontSize: 50, color: theme.palette.success.main, mb: 1 }} />
              ) : (
                <CloudUploadIcon sx={{ fontSize: 40, color: theme.palette[borderColor].main, mb: 1 }} />
              )}
              <Typography variant="body2" color="textSecondary">
                {isDragging ? "Drop image here" : isPasting ? "Pasting..." : placeholderText}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                {isDragging || isPasting ? "" : "or drag and drop image here or paste from clipboard (Ctrl+V)"}
              </Typography>
              {error && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {error.message || "Error uploading image"}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </label>
    </Box>
  );
};

export default ImageUploader; 