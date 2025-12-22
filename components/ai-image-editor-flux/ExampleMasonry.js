import React, { useEffect, useState, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Chip,
  alpha,
  useTheme,
  IconButton,
  Tooltip,
  Skeleton,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
  useMediaQuery
} from '@mui/material';
import Masonry from '@mui/lab/Masonry';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import CompareIcon from '@mui/icons-material/Compare';
import DeleteIcon from '@mui/icons-material/Delete';
import { getUseCaseImageUrl } from '@/constant/getUseCaseImageUrl';
import modelConfigurations from '@/constant/ModelConfigurations';
import ImagePreviewModal from './ImagePreviewModal';
import DownloadModal from './DownloadModal';
import { useDownloadHandler } from './useDownloadHandler';
import Image from 'next/image';
// Cache for images to avoid repeated API calls
const imageCache = new Map();

// Helper function to get user-friendly model display names and colors
const getModelDisplayInfo = (modelName) => {
  const modelMap = {
    // Generate Image Models
    'generate-image': { name: 'Flux Schnell', color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.9)' },
    'generate-image-qwen': { name: 'Qwen', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.9)' },
    'generate-image-gemini': { name: 'Gemini Flash', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.9)' },
    'generate-image-flux': { name: 'Flux Schnell', color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.9)' },
    
    // Edit Image Models
    'edit-image-qwen': { name: 'Qwen Edit', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.9)' },
    'edit-image-flux': { name: 'Flux Pro', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.9)' },
    'edit-image-nano': { name: 'Nano Banana', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.9)' },
    
    // Other Models
    'hair-style': { name: 'Hair Style', color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.9)' },
    'combine-image': { name: 'Image Combine', color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.9)' },
    'text-removal': { name: 'Text Removal', color: '#84cc16', bgColor: 'rgba(132, 204, 22, 0.9)' },
    'headshot': { name: 'Headshot', color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.9)' },
    'restore-image': { name: 'Image Restore', color: '#14b8a6', bgColor: 'rgba(20, 184, 166, 0.9)' },
    'gfp-restore': { name: 'GFP Restore', color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.9)' },
    'home-designer': { name: 'Home Design', color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.9)' },
    'background-removal': { name: 'BG Remove', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.9)' },
    'remove-object': { name: 'Object Remove', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.9)' },
    're-imagine': { name: 'Re-imagine', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.9)' },
    'reimagine': { name: 'Re-imagine', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.9)' }
  };

  return modelMap[modelName] || { name: modelName, color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.9)' };
};

const ExampleMasonry = forwardRef(({ selectedModel, selectedGender, onImageClick, onPromptUse }, ref) => {
  const theme = useTheme();
  const [s3Images, setS3Images] = useState([]);
  const [loadingS3Images, setLoadingS3Images] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState({});

  // Community images state
  const [communityImages, setCommunityImages] = useState([]);
  const [loadingCommunityImages, setLoadingCommunityImages] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);

  // History state
  const [historyImages, setHistoryImages] = useState([]);
  const [loadingHistoryImages, setLoadingHistoryImages] = useState(false);
  const [activeTab, setActiveTab] = useState('examples'); // 'examples', 'community', 'history'

  // Comparison modal states
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [comparisonImages, setComparisonImages] = useState([]);
  const [comparisonCurrentIndex, setComparisonCurrentIndex] = useState(0);

  // Delete confirmation dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Download handler
  const downloadHandler = useDownloadHandler();

  // Create cache key for current model and gender
  const cacheKey = useMemo(() => {
    return `${selectedModel}-${selectedGender || 'all'}`;
  }, [selectedModel, selectedGender]);

  // Create cache key for community images
  const communityCacheKey = useMemo(() => {
    return `community-${selectedModel}`;
  }, [selectedModel]);


  const fetchS3Images = useCallback(async () => {
    try {
      if (imageCache.has(cacheKey)) {
        const cachedImages = imageCache.get(cacheKey);
        setS3Images(cachedImages);
        setLoadingS3Images(false);
        return;
      }

      setLoadingS3Images(true);
      const useCaseImage = getUseCaseImageUrl.find((item) => item.model === selectedModel);

      if (!useCaseImage) {
        setS3Images([]);
        return;
      }

      // Filter images by gender for hair-style model
      let filteredUseCaseImage = { ...useCaseImage };
      if (selectedModel === 'hair-style' && selectedGender) {
        const genderPrefix = selectedGender.toLowerCase();
        filteredUseCaseImage.useCaseImages = useCaseImage.useCaseImages.filter(image =>
          image.outputImage.startsWith(`${genderPrefix}/`)
        );
      }
      const response = await fetch('/api/getS3ImageUrls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imagesPath: filteredUseCaseImage }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Cache the results
          imageCache.set(cacheKey, data.images);
          setS3Images(data.images);

          // Initialize loading states for new images
          const loadingStates = {};
          data.images.forEach(image => {
            loadingStates[image.id] = true;
          });
          setImageLoadingStates(loadingStates);
        } else {
          console.error('Error fetching S3 images:', data.error);
          setS3Images([]);
        }
      } else {
        console.error('Failed to fetch S3 images');
        setS3Images([]);
      }
    } catch (error) {
      console.error('Error fetching S3 images:', error);
      setS3Images([]);
    } finally {
      setTimeout(() => setLoadingS3Images(false), 100); // Small delay to prevent flicker
    }
  }, [selectedModel, selectedGender, cacheKey]);

  const fetchCommunityImages = useCallback(async () => {
    try {
      // Check cache first
      if (imageCache.has(communityCacheKey)) {
        const cachedImages = imageCache.get(communityCacheKey);
        setCommunityImages(cachedImages);
        setLoadingCommunityImages(false);
        return;
      }

      setLoadingCommunityImages(true);

      const response = await fetch('/api/images/getCommunityImages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          limit: 12
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Cache the results
          imageCache.set(communityCacheKey, data.images);
          setCommunityImages(data.images);

          // Initialize loading states for new images
          const loadingStates = {};
          data.images.forEach(image => {
            loadingStates[image.id] = true;
          });
          setImageLoadingStates(prev => ({ ...prev, ...loadingStates }));
        } else {
          console.error('Error fetching community images:', data.error);
          setCommunityImages([]);
        }
      } else {
        console.error('Failed to fetch community images');
        setCommunityImages([]);
      }
    } catch (error) {
      console.error('Error fetching community images:', error);
      setCommunityImages([]);
    } finally {
      setTimeout(() => setLoadingCommunityImages(false), 100);
    }
  }, [selectedModel, communityCacheKey]);

  // Helper function to group images by time periods
  const groupImagesByTime = (images) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const lastWeekStart = new Date(thisWeekStart.getTime() - (7 * 24 * 60 * 60 * 1000));
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      lastWeek: [],
      thisMonth: [],
      lastMonth: [],
      older: []
    };

    images.forEach(image => {
      const imageDate = new Date(image.createdAt);
      const imageDateOnly = new Date(imageDate.getFullYear(), imageDate.getMonth(), imageDate.getDate());

      if (imageDateOnly.getTime() === today.getTime()) {
        groups.today.push(image);
      } else if (imageDateOnly.getTime() === yesterday.getTime()) {
        groups.yesterday.push(image);
      } else if (imageDate >= thisWeekStart && imageDate < today) {
        groups.thisWeek.push(image);
      } else if (imageDate >= lastWeekStart && imageDate < thisWeekStart) {
        groups.lastWeek.push(image);
      } else if (imageDate >= thisMonthStart && imageDate < thisWeekStart) {
        groups.thisMonth.push(image);
      } else if (imageDate >= lastMonthStart && imageDate < thisMonthStart) {
        groups.lastMonth.push(image);
      } else {
        groups.older.push(image);
      }
    });

    // Sort each group by creation date (newest first)
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    });

    return groups;
  };

  const fetchUserHistory = useCallback(async () => {
    try {
      const historyCacheKey = `history-${selectedModel}`;

      // Check cache first
      if (imageCache.has(historyCacheKey)) {
        const cachedImages = imageCache.get(historyCacheKey);
        setHistoryImages(cachedImages);
        setLoadingHistoryImages(false);
        return;
      }

      setLoadingHistoryImages(true);

      const response = await fetch(`/api/user/history?model=${selectedModel}&limit=50`);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Transform history data to match masonry format
          const transformedHistory = data.history.map(record => ({
            id: `history-${record.id}`,
            url: record.url,
            outputUrl: record.url,
            inputUrl: record.inputImages?.[0]?.url || null,
            inputUrls: record.inputImages || [],
            title: record.prompt || `${record.model} Result`,
            prompt: record.prompt,
            height: 250 + Math.floor(Math.random() * 100), // Random height for masonry
            isCommunity: false,
            isHistory: true,
            isPublished: record.isPublished,
            author: 'You',
            hasComparison: record.hasComparison,
            modelParams: record.modelParams,
            aspectRatio: record.aspectRatio,
            createdAt: record.createdAt,
            historyId: record.id, // Store original history ID for publishing
            actualModel: record.model, // Store the actual model name from database
            // Add combine-image specific properties
            inputImage1: record.inputImage1 || null,
            inputImage2: record.inputImage2 || null,
            outputImage: record.url
          }));

          // Group images by time periods
          const groupedImages = groupImagesByTime(transformedHistory);

          // Cache the results
          imageCache.set(historyCacheKey, groupedImages);
          setHistoryImages(groupedImages);

          // Initialize loading states for new images
          const loadingStates = {};
          transformedHistory.forEach(image => {
            loadingStates[image.id] = true;
          });
          setImageLoadingStates(prev => ({ ...prev, ...loadingStates }));
        } else {
          console.error('Error fetching user history:', data.error);
          setHistoryImages([]);
        }
      } else {
        console.error('Failed to fetch user history');
        setHistoryImages([]);
      }
    } catch (error) {
      console.error('Error fetching user history:', error);
      setHistoryImages([]);
    } finally {
      setTimeout(() => setLoadingHistoryImages(false), 100);
    }
  }, [selectedModel]);

  useEffect(() => {
    if (activeTab === 'community') {
      fetchCommunityImages();
    } else if (activeTab === 'history') {
      fetchUserHistory();
    } else {
      fetchS3Images();
    }
  }, [activeTab, fetchS3Images, fetchCommunityImages, fetchUserHistory]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    refreshHistory: () => {
      const historyCacheKey = `history-${selectedModel}`;
      imageCache.delete(historyCacheKey);
      if (activeTab === 'history') {
        fetchUserHistory();
      }
    },
    refreshCommunity: () => {
      const communityCacheKey = `community-${selectedModel}`;
      imageCache.delete(communityCacheKey);
      if (activeTab === 'community') {
        fetchCommunityImages();
      }
    },
    // Add method to get total history count for debugging
    getHistoryCount: () => {
      if (activeTab === 'history' && historyImages && typeof historyImages === 'object') {
        return Object.values(historyImages).reduce((total, group) => {
          return total + (Array.isArray(group) ? group.length : 0);
        }, 0);
      }
      return Array.isArray(historyImages) ? historyImages.length : 0;
    }
  }), [selectedModel, activeTab, fetchUserHistory, fetchCommunityImages, historyImages]);

  // Handle individual image loading states
  const handleImageLoad = useCallback((imageId) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [imageId]: false
    }));
  }, []);

  const handleImageLoadStart = useCallback((imageId) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [imageId]: true
    }));
  }, []);

  // Helper function to generate model configuration text
  const generateModelConfigText = (model, image, modelParams) => {
    const config = modelConfigurations[model];
    if (!config) return null;

    const configParts = [];

    switch (model) {
      case 'hair-style':
        if (modelParams?.hair_style && modelParams.hair_style !== 'No change' && modelParams.hair_style !== 'Random') {
          configParts.push(`${modelParams.hair_style} hairstyle`);
        }
        if (modelParams?.hair_color && modelParams.hair_color !== 'No change') {
          configParts.push(`${modelParams.hair_color.toLowerCase()} hair color`);
        }
        if (modelParams?.gender && modelParams.gender !== 'None') {
          configParts.push(`${modelParams.gender.toLowerCase()} styling`);
        }
        break;

      case 'headshot':
        if (modelParams?.background && modelParams.background !== 'None') {
          configParts.push(`${modelParams.background.toLowerCase()} background`);
        }
        if (modelParams?.gender && modelParams.gender !== 'None') {
          configParts.push(`${modelParams.gender.toLowerCase()} professional headshot`);
        }
        break;

      case 're-imagine':
      case 'reimagine': // Handle both old and new model names
        if (modelParams?.scenario && modelParams.scenario !== 'Random') {
          configParts.push(modelParams.scenario);
        }
        if (modelParams?.gender && modelParams.gender !== 'None') {
          configParts.push(`${modelParams.gender.toLowerCase()} scenario`);
        }
        break;

      case 'text-removal':
        configParts.push('Text and watermark removal');
        break;

      case 'restore-image':
        configParts.push('Image restoration and enhancement');
        break;

      case 'gfp-restore':
        configParts.push('GFP image restoration');
        break;

      case 'home-designer':
        configParts.push('Interior design transformation');
        break;

      case 'background-removal':
        configParts.push('AI background removal');
        break;

      case 'remove-object':
        configParts.push('AI object removal');
        break;

      case 'combine-image':
        configParts.push('Image combination');
        break;

      default:
        if (config.name) {
          configParts.push(config.name);
        }
    }

    // Add aspect ratio if available
    if (modelParams?.aspect_ratio && modelParams.aspect_ratio !== 'match_input_image') {
      configParts.push(`${modelParams.aspect_ratio} aspect ratio`);
    }

    return configParts.length > 0 ? configParts.join(', ') : null;
  };

  const handleImagePreview = (image, index) => {
    if (onImageClick) {
      // Generate model configuration text for images without prompts
      const modelConfigText = !image.prompt && image.modelParams
        ? generateModelConfigText(selectedModel, image, image.modelParams)
        : null;

      // Check if comparison data is available for this image
      const hasComparison = image.hasComparison && image.inputUrl && image.outputUrl;

      // Get comparison labels if available
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
          case 'reimagine': // Handle both old and new model names
            return { before: 'Original Photo', after: 'Reimagined' };
          case 'upscale-image':
            return { before: 'Original', after: 'Upscaled' };
          default:
            return { before: 'Before', after: 'After' };
        }
      };

      const labels = hasComparison ? getComparisonLabels(selectedModel) : null;

      // Special handling for combine-image model
      const combineData = selectedModel === 'combine-image' && image.inputImage1 && image.inputImage2 ? {
        inputImage1: image.inputImage1,
        inputImage2: image.inputImage2,
        outputImage: image.outputImage || image.url
      } : null;

      // Get all images for navigation - handle both grouped and regular format
      let allImages = [];
      if (activeTab === 'history' && historyImages && typeof historyImages === 'object') {
        // Flatten grouped history images for navigation
        Object.values(historyImages).forEach(group => {
          if (Array.isArray(group)) {
            allImages = allImages.concat(group);
          }
        });
      } else {
        allImages = displayImages;
      }

      onImageClick({
        url: image.url,
        index: index,
        images: allImages.map(img => ({
          ...img,
          url: img.url
        })),
        imageInfo: {
          // title: image.title || (image.isCommunity ? 'Community Image' : `Example Image ${index + 1}`),
          prompt: image.prompt || null,
          modelConfig: modelConfigText,
          model: selectedModel,
          actualModel: image.actualModel || null, // Add actual model name
          modelDisplayName: image.actualModel ? getModelDisplayInfo(image.actualModel).name : null,
          modelParams: image.modelParams || null,
          createdAt: image.createdAt || null,
          resolution: 'High Quality',
          format: 'JPEG',
          type: image.isCommunity ? 'community' : (image.isHistory ? 'history' : 'example')
        },
        // Add comparison data if available
        canCompare: hasComparison,
        beforeImage: hasComparison ? image.inputUrl : null,
        afterImage: hasComparison ? image.outputUrl : null,
        beforeLabel: hasComparison ? labels.before : null,
        afterLabel: hasComparison ? labels.after : null,
        // Add combine data for combine-image model
        combineData: combineData
      });
    }
  };

  const handlePromptUse = (prompt) => {
    if (onPromptUse) {
      onPromptUse(prompt);
    }
  };

  const handlePublishFromHistory = async (historyId, title) => {
    try {
      const response = await fetch('/api/images/publishFromHistory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          historyId,
          title: title || 'My Creation'
        })
      });

      if (response.ok) {
        // Refresh history to update the published status
        const historyCacheKey = `history-${selectedModel}`;
        imageCache.delete(historyCacheKey); // Clear cache
        fetchUserHistory(); // Refresh history
      } else {
        const errorData = await response.json();
        console.error('Error publishing image:', errorData.error);
      }
    } catch (error) {
      console.error('Error publishing image:', error);
    }
  };

  // Handle delete history item
  const handleDeleteClick = (image) => {
    setItemToDelete(image);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete || !itemToDelete.historyId) return;

    setDeleting(true);
    try {
      const response = await fetch('/api/user/deleteHistory', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          historyId: itemToDelete.historyId
        })
      });

      if (response.ok) {
        const result = await response.json();

        // Remove the item from local state immediately - handle both grouped and flat structures
        if (typeof historyImages === 'object' && !Array.isArray(historyImages)) {
          // Grouped structure
          setHistoryImages(prev => {
            const newGroups = { ...prev };
            Object.keys(newGroups).forEach(period => {
              if (Array.isArray(newGroups[period])) {
                newGroups[period] = newGroups[period].filter(img => img.historyId !== itemToDelete.historyId);
              }
            });
            return newGroups;
          });
        } else {
          // Flat array structure (fallback)
          setHistoryImages(prev => prev.filter(img => img.historyId !== itemToDelete.historyId));
        }

        // Clear cache to ensure fresh data on next fetch
        const historyCacheKey = `history-${selectedModel}`;
        imageCache.delete(historyCacheKey);

        // Close dialog
        setDeleteDialogOpen(false);
        setItemToDelete(null);


      } else {
        const errorData = await response.json();
        console.error('Error deleting history item:', errorData.error);

        // Handle published image case
        if (errorData.published) {
          alert('Cannot delete published images. Please unpublish the image first.');
        } else {
          alert(errorData.error || 'Failed to delete history item');
        }
      }
    } catch (error) {
      console.error('Error deleting history item:', error);
      alert('Failed to delete history item. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleComparisonOpen = (image, index) => {
    if (image.hasComparison && image.inputUrl && image.outputUrl) {
      // Get model-specific labels
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
          case 'reimagine': // Handle both old and new model names
            return { before: 'Original Photo', after: 'Reimagined' };
          case 'upscale-image':
            return { before: 'Original', after: 'Upscaled' };
          default:
            return { before: 'Before', after: 'After' };
        }
      };

      const labels = getComparisonLabels(selectedModel);
      const modelConfig = modelConfigurations[selectedModel];
      const modelName = modelConfig?.name || selectedModel;

      // Set up images array for modal (just the output image for navigation)
      setComparisonImages([image.outputUrl]);
      setComparisonCurrentIndex(0);

      // Generate model configuration text for comparison
      const modelConfigText = !image.prompt && image.modelParams
        ? generateModelConfigText(selectedModel, image, image.modelParams)
        : null;

      // Set comparison data
      setComparisonData({
        beforeImage: image.inputUrl,
        afterImage: image.outputUrl,
        beforeLabel: labels.before,
        afterLabel: labels.after,
        title: `${modelName} - Before vs After`,
        imageInfo: {
          title: image.title || `${modelName} Result`,
          prompt: image.prompt || null,
          modelConfig: modelConfigText,
          model: selectedModel,
          createdAt: image.createdAt || null,
          resolution: 'High Quality',
          format: 'JPEG',
          type: image.isCommunity ? 'community-comparison' : 'example-comparison'
        }
      });

      setComparisonModalOpen(true);
    }
  };

  const handleComparisonClose = () => {
    setComparisonModalOpen(false);
    setComparisonData(null);
    setComparisonImages([]);
    setComparisonCurrentIndex(0);
  };

  const handleComparisonImageChange = (newIndex) => {
    setComparisonCurrentIndex(newIndex);
  };

  // Utility function to generate intelligent filename for examples
  const generateExampleFileName = (model, title, prompt) => {
    const config = modelConfigurations[model];
    const usesPrompts = config?.type === 'prompts';

    // Generate random string
    const randomString = Math.random().toString(36).substring(2, 8);

    if (usesPrompts && prompt && prompt.trim()) {
      // Use prompt for filename
      const cleanPrompt = prompt
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .substring(0, 50); // Limit length to 50 characters

      return `example-${cleanPrompt}-${randomString}.jpg`;
    } else if (title && title.trim()) {
      // Use title for filename
      const cleanTitle = title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .substring(0, 30); // Limit length to 30 characters

      return `example-${cleanTitle}-${randomString}.jpg`;
    } else {
      // Use model name with random string
      const modelName = config?.name || model;
      const cleanModelName = modelName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');

      return `example-${cleanModelName}-${randomString}.jpg`;
    }
  };

  const handleDownload = (image, title, prompt) => {
    const imageUrl = image.hasComparison && image.outputUrl ? image.outputUrl : (image.url || image);
    const isOutputImage = image.hasComparison && image.outputUrl;

    // Generate filename
    let filename = generateExampleFileName(selectedModel, title, prompt);

    // Add suffix for output images
    if (isOutputImage) {
      filename = filename.replace('.jpg', '-result.jpg');
    }

    // Use the new download handler that checks user plan
    downloadHandler.handleDownload(imageUrl, filename);
  };

  
  const displayImages = activeTab === 'community' ? communityImages :
    activeTab === 'history' ? historyImages :
      (s3Images.length > 0 ? s3Images : []);

  // Helper function to get time period label
  const getTimePeriodLabel = (period) => {
    switch (period) {
      case 'today': return 'Today';
      case 'yesterday': return 'Yesterday';
      case 'thisWeek': return 'This Week';
      case 'lastWeek': return 'Last Week';
      case 'thisMonth': return 'This Month';
      case 'lastMonth': return 'Last Month';
      case 'older': return 'Older';
      default: return period;
    }
  };

  // Helper function to check if history has any images
  const hasHistoryImages = () => {
    if (activeTab !== 'history' || !historyImages || typeof historyImages !== 'object') return false;
    return Object.values(historyImages).some(group => Array.isArray(group) && group.length > 0);
  };

  // Show loading skeleton when fetching images
  const isLoading = activeTab === 'community' ? loadingCommunityImages :
    activeTab === 'history' ? loadingHistoryImages :
      loadingS3Images;

  const isMobile = useMediaQuery('(max-width: 600px)');

  return (
    <Box sx={{ mt: 1 }}>
      {/* Toggle between Examples and Community */}
      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1rem' : '0px', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {activeTab === 'community' ? 'Community Images' :
            activeTab === 'history' ? 'My History' :
              'Example Images'}
        </Typography>

        <ToggleButtonGroup
          value={activeTab}
          exclusive
          onChange={(e, value) => {
            if (value) {
              setActiveTab(value);
            }
          }}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              px: 2,
              py: 0.5,
              fontSize: '12px',
              borderRadius: '20px',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              '&.Mui-selected': {
                // backgroundColor: theme.palette.primary.main,
                background: 'linear-gradient(135deg,rgb(251,1,118) 0%, #d76d77 50%, #fbc901 100%)',
                color: 'white',
                // '&:hover': {
                //   backgroundColor: theme.palette.primary.dark,
                // }
                '&:hover': {
                  background: 'linear-gradient(135deg, #2d0e5e 0%, #b94e5e 50%, #e68a4a 100%)',
                  boxShadow: '0 4px 16px rgba(58,28,113,0.12)',
                },
              }
            }
          }}
        >
          <ToggleButton value="examples">Examples</ToggleButton>
          {selectedModel !== "background-removal" && <ToggleButton value="history">My History</ToggleButton>}
          <ToggleButton value="community">Community</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Conditional Content Rendering */}
      {isLoading && (
        (activeTab === 'history' && !hasHistoryImages()) ||
        (activeTab !== 'history' && (!displayImages || displayImages.length === 0))
      ) ? (
        // Show loading skeleton when fetching images and no images exist
        <Box>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
              <Skeleton variant="circular" width={20} height={20} animation="wave" />
              <Skeleton
                variant="text"
                width={`${selectedModel === 'hair-style' && selectedGender ? 180 : 160}px`}
                height={24}
                animation="wave"
              />
            </Box>
          </Box>
          <Masonry
            columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
            sx={{ width: '100%', margin: 0 }}
          >
            {Array.from({ length: 12 }).map((_, index) => {
              // Create varied heights for more realistic masonry layout
              const heights = [220, 280, 320, 240, 300, 260, 350, 200, 290, 310, 270, 330];
              const height = heights[index % heights.length];

              return (
                <Card
                  key={`skeleton-${index}`}
                  sx={{
                    borderRadius: 2,
                    mb: 2,
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    height={height}
                    animation="wave"
                    sx={{
                      borderRadius: 0,
                      '&::after': {
                        background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.4)}, transparent)`,
                      }
                    }}
                  />
                  {/* Add overlay skeleton elements to mimic the overlay buttons */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      display: 'flex',
                      gap: 1,
                    }}
                  >
                    <Skeleton variant="circular" width={32} height={32} animation="wave" />
                    <Skeleton variant="circular" width={32} height={32} animation="wave" />
                  </Box>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      right: 8,
                    }}
                  >
                    <Skeleton variant="rounded" width="60%" height={24} animation="wave" />
                  </Box>
                </Card>
              );
            })}
          </Masonry>
        </Box>
      ) : (
        (activeTab === 'history' && !hasHistoryImages()) ||
        (activeTab !== 'history' && (!displayImages || displayImages.length === 0))
      ) ? (
        // Show empty state when no images and not loading
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            {activeTab === 'community' ? 'No community images available for this model' :
              activeTab === 'history' ? 'No history images available for this model' :
                'No example images available for this model'}
          </Typography>
        </Box>
      ) : (
        // Show images when available
        <>
          {/* Show loading indicator when switching between cached images */}
          {isLoading && (
            (activeTab === 'history' && hasHistoryImages()) ||
            (activeTab !== 'history' && displayImages && displayImages.length > 0)
          ) && (
              <Box sx={{ mb: 2, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Skeleton variant="circular" width={16} height={16} animation="wave" />
                  <Skeleton
                    variant="text"
                    width={`${selectedModel === 'hair-style' && selectedGender ? 140 : 120}px`}
                    height={20}
                    animation="wave"
                  />
                </Box>
              </Box>
            )}

          {/* Render grouped history images */}
          {activeTab === 'history' && historyImages && typeof historyImages === 'object' ? (
            Object.entries(historyImages).map(([period, images], periodIndex) => {
              if (!Array.isArray(images) || images.length === 0) return null;

              // Calculate the starting global index for this period
              let globalIndexOffset = 0;
              const periods = Object.entries(historyImages);
              for (let i = 0; i < periodIndex; i++) {
                const [, prevImages] = periods[i];
                if (Array.isArray(prevImages)) {
                  globalIndexOffset += prevImages.length;
                }
              }

              return (
                <Box key={period} sx={{ mb: 4 }}>
                  {/* Time period header */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: theme.palette.text.primary,
                      fontSize: '1.1rem'
                    }}
                  >
                    {getTimePeriodLabel(period)} ({images.length})
                  </Typography>

                  {/* Images masonry for this period */}
                  <Masonry
                    columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
                    sx={{
                      width: '100%',
                      margin: 0,
                      opacity: isLoading ? 0.7 : 1,
                      transition: 'opacity 0.3s ease',
                    }}
                  >
                    {images.map((image, index) => {
                      const globalIndex = globalIndexOffset + index;
                      return (
                      <Card
                        key={image.id}
                        sx={{
                          borderRadius: 2,
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          position: 'relative',
                          padding: 0,
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: theme.shadows[8],
                            '& .image-overlay': {
                              opacity: 1,
                            },
                          },
                        }}
                        onClick={() => handleImagePreview(image, globalIndex)}
                      >
                        <Box sx={{ position: 'relative' }}>
                          {imageLoadingStates[image.id] && (
                            <Skeleton
                              variant="rectangular"
                              width="100%"
                              height={image.height || 250}
                              animation="wave"
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                zIndex: 1,
                                borderRadius: 1,
                              }}
                            />
                          )}

                          {/* Community Badge */}
                          {image.isCommunity && (
                            <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}>
                              <Chip
                                label="Community"
                                size="small"
                                sx={{
                                  backgroundColor: alpha(theme.palette.primary.main, 0.9),
                                  color: 'white',
                                  fontSize: '10px',
                                  height: 20
                                }}
                              />
                            </Box>
                          )}

                          {/* History Badge */}
                          {image.isHistory && (
                            <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}>
                              <Chip
                                label={image.isPublished ? "Published" : "History"}
                                size="small"
                                sx={{
                                  backgroundColor: image.isPublished ?
                                    alpha(theme.palette.success.main, 0.9) :
                                    alpha(theme.palette.secondary.main, 0.9),
                                  color: 'white',
                                  fontSize: '10px',
                                  height: 20
                                }}
                              />
                            </Box>
                          )}

                          {/* Model Tag - Show for history images */}
                          {image.isHistory && image.actualModel && (
                            <Box sx={{ position: 'absolute', bottom: 8, right: 8, zIndex: 2 }}>
                              <Chip
                                label={getModelDisplayInfo(image.actualModel).name}
                                size="small"
                                sx={{
                                  backgroundColor: getModelDisplayInfo(image.actualModel).bgColor,
                                  color: 'white',
                                  fontSize: '9px',
                                  height: 18,
                                  fontWeight: 600,
                                  '& .MuiChip-label': {
                                    px: 1
                                  }
                                }}
                              />
                            </Box>
                          )}

                          <CardMedia
                            component="img"
                            image={selectedModel === 'combine-image' ? image.outputImage : image.url}
                            alt={image.title || `Example Image ${index + 1}`}
                            onLoad={() => handleImageLoad(image.id)}
                            onLoadStart={() => handleImageLoadStart(image.id)}
                            referrerPolicy="no-referrer"
                            sx={{
                              width: '100%',
                              height: image.height || 250,
                              objectFit: 'cover',
                              transition: 'opacity 0.3s ease',
                              opacity: imageLoadingStates[image.id] ? 0 : 1,
                            }}
                          />

                          {/* Overlay */}
                          <Box
                            className="image-overlay"
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
                            {/* Top actions */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, p: 2, }}>
                              <Tooltip title="Preview Image">
                                <IconButton
                                  size="small"
                                  sx={{
                                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                                    color: theme.palette.text.primary,
                                    '&:hover': {
                                      backgroundColor: theme.palette.background.paper,
                                    },
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleImagePreview(image, globalIndex);
                                  }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              {/* Comparison button - only show if comparison is available */}
                              {image.hasComparison && image.inputUrl && image.outputUrl && selectedModel !== 'combine-image' && (
                                <Tooltip title="Compare Before/After">
                                  <IconButton
                                    size="small"
                                    sx={{
                                      backgroundColor: alpha(theme.palette.primary.main, 0.9),
                                      color: 'white',
                                      '&:hover': {
                                        backgroundColor: theme.palette.primary.main,
                                      },
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleComparisonOpen(image, globalIndex);
                                    }}
                                  >
                                    <CompareIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}

                              <Tooltip title="Download Image">
                                <IconButton
                                  size="small"
                                  sx={{
                                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                                    color: theme.palette.text.primary,
                                    '&:hover': {
                                      backgroundColor: theme.palette.background.paper,
                                    },
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(image, image.title, image.prompt);
                                  }}
                                >
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              {/* Delete button - only show for history images */}
                              {image.isHistory && (
                                <Tooltip title="Delete from History">
                                  <IconButton
                                    size="small"
                                    sx={{
                                      backgroundColor: alpha(theme.palette.error.main, 0.9),
                                      color: 'white',
                                      '&:hover': {
                                        backgroundColor: theme.palette.error.main,
                                        transform: 'scale(1.1)',
                                      },
                                      transition: 'all 0.2s ease',
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(image);
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>

                            {/* Bottom content */}
                            <Box sx={{ p: 1 }}>
                              {/* Community image title */}
                              {image.isCommunity && image.title && (
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    color: 'white',
                                    fontWeight: 600,
                                    mb: 1,
                                    fontSize: '12px'
                                  }}
                                >
                                  {image.title}
                                </Typography>
                              )}

                              {/* Author info for community images */}
                              {image.isCommunity && image.author && (
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

                              {/* Prompt chip - Only show for models that use prompts */}
                              {image.prompt && ['generate-image','edit-image', 'combine-image', 'home-designer'].includes(selectedModel) && (
                                <Chip
                                  label="Use this prompt"
                                  size="small"
                                  clickable
                                  sx={{
                                    backgroundColor: alpha(theme.palette.primary.main, 0.9),
                                    color: 'white',
                                    fontSize: '10px',
                                    height: 24,
                                    mr: 1,
                                    '&:hover': {
                                      backgroundColor: theme.palette.primary.main,
                                    },
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePromptUse(image.prompt);
                                  }}
                                />
                              )}

                              {/* Publish chip for unpublished history images */}
                              {image.isHistory && !image.isPublished && (
                                <Chip
                                  label="Publish"
                                  size="small"
                                  clickable
                                  sx={{
                                    backgroundColor: alpha(theme.palette.success.main, 0.9),
                                    color: 'white',
                                    fontSize: '10px',
                                    height: 24,
                                    '&:hover': {
                                      backgroundColor: theme.palette.success.main,
                                    },
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePublishFromHistory(image.historyId, image.title);
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Card>
                      );
                    })}
                  </Masonry>
                </Box>
              );
            })
          ) : (
            // Render regular masonry for non-history tabs
            <Masonry
              columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
              sx={{
                width: '100%',
                margin: 0,
                opacity: isLoading ? 0.7 : 1,
                transition: 'opacity 0.3s ease',
              }}
            >
              {displayImages.map((image, index) => (
                <Card
                  key={image.id}
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    position: 'relative',
                    padding: 0,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                      '& .image-overlay': {
                        opacity: 1,
                      },
                    },
                  }}
                  onClick={() => handleImagePreview(image, index)}
                >
                  <Box sx={{ position: 'relative' }}>
                    {imageLoadingStates[image.id] && (
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={image.height || 250}
                        animation="wave"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          zIndex: 1,
                          borderRadius: 1,
                        }}
                      />
                    )}

                    {/* Community Badge */}
                    {image.isCommunity && (
                      <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}>
                        <Chip
                          label="Community"
                          size="small"
                          sx={{
                            backgroundColor: alpha(theme.palette.primary.main, 0.9),
                            color: 'white',
                            fontSize: '10px',
                            height: 20
                          }}
                        />
                      </Box>
                    )}

                    {/* History Badge */}
                    {image.isHistory && (
                      <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}>
                        <Chip
                          label={image.isPublished ? "Published" : "History"}
                          size="small"
                          sx={{
                            backgroundColor: image.isPublished ?
                              alpha(theme.palette.success.main, 0.9) :
                              alpha(theme.palette.secondary.main, 0.9),
                            color: 'white',
                            fontSize: '10px',
                            height: 20
                          }}
                        />
                      </Box>
                    )}

                    {/* Model Tag - Show for history images */}
                    {image.isHistory && image.actualModel && (
                      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
                        <Chip
                          label={getModelDisplayInfo(image.actualModel).name}
                          size="small"
                          sx={{
                            backgroundColor: getModelDisplayInfo(image.actualModel).bgColor,
                            color: 'white',
                            fontSize: '9px',
                            height: 18,
                            fontWeight: 600,
                            '& .MuiChip-label': {
                              px: 1
                            }
                          }}
                        />
                      </Box>
                    )}

                    <CardMedia
                      component="img"
                      image={selectedModel === 'combine-image' ? image.outputImage : image.url}
                      alt={image.title || `Example Image ${index + 1}`}
                      onLoad={() => handleImageLoad(image.id)}
                      onLoadStart={() => handleImageLoadStart(image.id)}
                      referrerPolicy="no-referrer"
                      sx={{
                        width: '100%',
                        height: image.height || 250, // Default height if not specified
                        objectFit: 'cover',
                        transition: 'opacity 0.3s ease',
                        opacity: imageLoadingStates[image.id] ? 0 : 1,
                      }}
                    />

                    {/* Overlay */}
                    <Box
                      className="image-overlay"
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
                      {/* Top actions */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, p: 2, }}>
                        <Tooltip title="Preview Image">
                          <IconButton
                            size="small"
                            sx={{
                              backgroundColor: alpha(theme.palette.background.paper, 0.9),
                              color: theme.palette.text.primary,
                              '&:hover': {
                                backgroundColor: theme.palette.background.paper,
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImagePreview(image, index);
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* Comparison button - only show if comparison is available */}
                        {image.hasComparison && image.inputUrl && image.outputUrl && selectedModel !== 'combine-image' && (
                          <Tooltip title="Compare Before/After">
                            <IconButton
                              size="small"
                              sx={{
                                backgroundColor: alpha(theme.palette.primary.main, 0.9),
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: theme.palette.primary.main,
                                },
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleComparisonOpen(image, index);
                              }}
                            >
                              <CompareIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        <Tooltip title="Download Image">
                          <IconButton
                            size="small"
                            sx={{
                              backgroundColor: alpha(theme.palette.background.paper, 0.9),
                              color: theme.palette.text.primary,
                              '&:hover': {
                                backgroundColor: theme.palette.background.paper,
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(image, image.title, image.prompt);
                            }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* Delete button - only show for history images */}
                        {image.isHistory && (
                          <Tooltip title="Delete from History">
                            <IconButton
                              size="small"
                              sx={{
                                backgroundColor: alpha(theme.palette.error.main, 0.9),
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: theme.palette.error.main,
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(image);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>

                      {/* Bottom content */}
                      <Box sx={{ p: 1 }}>
                        {/* Community image title */}
                        {image.isCommunity && image.title && (
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: 'white',
                              fontWeight: 600,
                              mb: 1,
                              fontSize: '12px'
                            }}
                          >
                            {image.title}
                          </Typography>
                        )}

                        {/* Author info for community images */}
                        {image.isCommunity && image.author && (
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

                        {/* Prompt chip - Only show for models that use prompts */}
                        {image.prompt && ['generate-image', 'edit-image', 'combine-image', 'home-designer'].includes(selectedModel) && (
                          <Chip
                            label="Use this prompt"
                            size="small"
                            clickable
                            sx={{
                              backgroundColor: alpha(theme.palette.primary.main, 0.9),
                              color: 'white',
                              fontSize: '10px',
                              height: 24,
                              mr: 1,
                              '&:hover': {
                                backgroundColor: theme.palette.primary.main,
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePromptUse(image.prompt);
                            }}
                          />
                        )}

                        {/* Publish chip for unpublished history images */}
                        {image.isHistory && !image.isPublished && (
                          <Chip
                            label="Publish"
                            size="small"
                            clickable
                            sx={{
                              backgroundColor: alpha(theme.palette.success.main, 0.9),
                              color: 'white',
                              fontSize: '10px',
                              height: 24,
                              '&:hover': {
                                backgroundColor: theme.palette.success.main,
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePublishFromHistory(image.historyId, image.title);
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Masonry>
          )}
        </>
      )}

      {/* Comparison Modal using ImagePreviewModal */}
      <ImagePreviewModal
        open={comparisonModalOpen}
        onClose={handleComparisonClose}
        images={comparisonImages}
        currentIndex={comparisonCurrentIndex}
        onImageChange={handleComparisonImageChange}
        selectedModel={selectedModel}
        imageInfo={comparisonData?.imageInfo}
        canCompare={true}
        beforeImage={comparisonData?.beforeImage}
        afterImage={comparisonData?.afterImage}
        beforeLabel={comparisonData?.beforeLabel}
        afterLabel={comparisonData?.afterLabel}
        autoOpenComparison={true}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this image from your history?
            {/* <br /><br />
            <strong>This action will:</strong>
            <br />• Remove the image from your history permanently
            <br />• Delete all associated files from cloud storage
            <br />• This cannot be undone
            {itemToDelete?.isPublished && (
              <>
                <br /><br />
                <strong style={{color: '#f44336'}}>Note:</strong> This image appears to be published. 
                You may need to unpublish it first.
              </>
            )} */}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteCancel}
            disabled={deleting}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={deleting}
            color="error"
            variant="contained"
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
          >
            {deleting ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Download Modal */}
      <DownloadModal {...downloadHandler.modalProps} />
    </Box>
  );
});

export default ExampleMasonry; 