import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  alpha,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PublishIcon from '@mui/icons-material/Publish';

const PublishDialog = ({
  open,
  onClose,
  imageUrl,
  selectedModel,
  prompt,
  onPublish
}) => {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Auto-fill title with prompt or generate fallback when dialog opens
  useEffect(() => {
    if (open) {
      if (prompt && prompt.trim()) {
        // Use the prompt as title
        setTitle(prompt.trim());
      } else {
        // Generate fallback title based on model
        const fallbackTitle = generateFallbackTitle(selectedModel);
        setTitle(fallbackTitle);
      }
    }
  }, [open, prompt, selectedModel]);

  // Generate fallback title for models without prompts
  const generateFallbackTitle = (model) => {
    const modelTitles = {
      'hair-style': 'Hair Style Transformation',
      'text-removal': 'Text Removed from Image',
      'headshot': 'Professional Headshot',
      'restore-image': 'Restored Photo',
      'reimagine': 'Reimagined',
      'combine-image': 'Combined Image Creation',
      'generate-image': 'AI Generated Image'
    };

    const baseTitle = modelTitles[model] || `${"Enhanced by picfixai - " + Date.now()}`;

    return `${baseTitle}`;
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      return; // Title is required (should be auto-filled with prompt)
    }

    setIsPublishing(true);
    try {
      await onPublish({
        title: title.trim(),
        description: description.trim()
      });

      // Reset form and close dialog on success
      handleSubmitSuccess();
    } catch (error) {
      console.error('Error publishing:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleClose = () => {
    if (!isPublishing) {
      // Reset form fields
      setTitle('');
      setDescription('');
      onClose();
    }
  };

  const handleSubmitSuccess = () => {
    // Reset form and close dialog on successful publish
    setTitle('');
    setDescription('');
    onClose();
  };

  // Get model display name
  const getModelDisplayName = () => {
    const modelNames = {
      'generate-image': 'AI Image Generator',
      'hair-style': 'Hair Style Changer',
      'headshot': 'Professional Headshot',
      'restore-image': 'Image Restoration',
      'text-removal': 'Text/Watermark Removal',
      'reimagine': 'ReImagine Scenarios',
      'combine-image': 'Image Combiner',
      'edit-image': 'AI Image Editor',
    };
    return modelNames[selectedModel] || selectedModel;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, rgb(232, 230, 218) 100%)',
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PublishIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Publish to Community
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={isPublishing}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Image Preview */}
        {imageUrl && (
          <Box
            sx={{
              mb: 3,
              borderRadius: 2,
              overflow: 'hidden',
              maxHeight: 200,
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: alpha(theme.palette.grey[300], 0.3)
            }}
          >
            <img
              src={imageUrl}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                objectFit: 'contain'
              }}
            />
          </Box>
        )}

        {/* Model Info */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="textSecondary">
            Generated with: <strong>{getModelDisplayName()}</strong>
          </Typography>
        </Box>

        {/* Title Field - Auto-filled but editable */}
        <TextField
          fullWidth
          label="Title"
          placeholder="Enter a title for your creation..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isPublishing}
          required
          sx={{ mb: 2 }}
          inputProps={{ maxLength: 100 }}
          helperText={`${title.length}/100 characters ${prompt ? '(Auto-filled from prompt)' : '(Auto-generated)'}`}
        />

        {/* Description Field */}
        <TextField
          fullWidth
          label="Description (Optional)"
          placeholder="Tell the community about your creation..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isPublishing}
          multiline
          rows={3}
          inputProps={{ maxLength: 500 }}
          helperText={`${description.length}/500 characters`}
          sx={{ mb: 2 }}
        />


      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          disabled={isPublishing}
          sx={{ mr: 1 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!title.trim() || isPublishing}
          startIcon={isPublishing ? <CircularProgress size={20} color="inherit" /> : <PublishIcon />}
          sx={{
            borderRadius: 2,
            px: 3,
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
            },
            '&.Mui-disabled': {
              background: theme.palette.action.disabledBackground,
            }
          }}
        >
          {isPublishing ? 'Publishing...' : 'Publish'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PublishDialog; 