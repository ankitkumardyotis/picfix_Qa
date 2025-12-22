import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { useSession } from 'next-auth/react';
import AppContext from '../components/AppContext';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Button,
  ButtonGroup,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Card,
  CardMedia,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Slider,
  styled,
  alpha,
  useTheme,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import { useRouter } from 'next/router';
import SendIcon from '@mui/icons-material/Send';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import ImageIcon from '@mui/icons-material/Image';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Head from 'next/head';
import { useSnackbar } from 'notistack';
import GeneratedImages from '../components/ai-image-editor-flux/GeneratedImages';
import ImageUploader from '../components/ai-image-editor-flux/ImageUploader';
import ExampleMasonry from '../components/ai-image-editor-flux/ExampleMasonry';
import ImagePreviewModal from '../components/ai-image-editor-flux/ImagePreviewModal';
import BackgroundRemovalProcessor from '../components/ai-image-editor-flux/BackgroundRemovalProcessor';
import ObjectRemovalMaskEditor from '../components/ai-image-editor-flux/ObjectRemovalMaskEditor';
import CombineImageDisplay from '../components/ai-image-editor-flux/CombineImageDisplay';
import CombineImageModal from '../components/ai-image-editor-flux/CombineImageModal';
import DynamicCombineImageUploader from '../components/ai-image-editor-flux/DynamicCombineImageUploader';
import DownloadModal from '../components/ai-image-editor-flux/DownloadModal';
import { useDownloadHandler } from '../components/ai-image-editor-flux/useDownloadHandler';
import modelConfigurations from '../constant/ModelConfigurations';
import { getModelInputImages, getModelParameters } from '../lib/publishImageHandler';
import Image from 'next/image';
import Link from 'next/link';
import { useMediaQuery } from '@mui/material';
import SidePanel from '@/components/ai-image-editor-flux/editor/SidePanel';
import VideoResults from '@/components/ai-image-editor-flux/VideoResults';
// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f5f7fa 0%,rgb(232, 230, 218) 100%)',
  height: '100vh',
  width: '99.3vw',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'relative',
}));


const MainEditor = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(1, 3),
  paddingBottom: "100px",
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  overflow: 'auto',
  // marginBottom: isMobile ? "100px" : "0px",
  background: alpha(theme.palette.background.default, 0.5),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(3),
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
    },
  },
  '& .MuiInputBase-input': {
    // padding: theme.spacing(1),
    // paddingLeft: theme.spacing(2),
    fontSize: '14px',
  },
}));



const MenuButton = styled(IconButton)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    position: 'absolute',
    top: theme.spacing(2),
    left: theme.spacing(2),
    zIndex: 1001,
    background: theme.palette.background.paper,
    boxShadow: theme.shadows[2],
  },
}));

const AppStyleCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const AppStyleIcon = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: theme.spacing(2.5),
  overflow: 'hidden',
  position: 'relative',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  border: '3px solid transparent',
  transition: 'all 0.2s ease',
  '&.selected': {
    border: `3px solid ${theme.palette.primary.main}`,
    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}, 0 4px 12px rgba(0,0,0,0.2)`,
  },
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
}));

const AppStyleLabel = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
  fontSize: '12px',
  fontWeight: 500,
  textAlign: 'center',
  color: theme.palette.text.secondary,
  maxWidth: 80,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

// Helper function to extract error message from API response
const extractErrorMessage = async (response, defaultMessage = 'An error occurred') => {
  let errorMessage = defaultMessage;
  try {
    const errorData = await response.json();
    if (typeof errorData === 'string') {
      errorMessage = errorData;
    } else if (errorData?.message) {
      errorMessage = errorData.message;
    } else if (errorData?.error) {
      errorMessage = errorData.error;
    } else if (errorData?.detail) {
      errorMessage = errorData.detail;
    }
  } catch (parseError) {
    // If JSON parsing fails, use status text or default message
    errorMessage = response.statusText || defaultMessage;
  }
  return errorMessage;
};

export default function AIImageEditor() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const context = useContext(AppContext);
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedModel, setSelectedModel] = useState('generate-image');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [numOutputs, setNumOutputs] = useState(1);
  const [generatedImages, setGeneratedImages] = useState(Array(2).fill(null));
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hair style specific states
  const [selectedHairStyle, setSelectedHairStyle] = useState('No change');
  const [selectedHairColor, setSelectedHairColor] = useState('No change');
  const [selectedGender, setSelectedGender] = useState('Male');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [uploadingHairImage, setUploadingHairImage] = useState(false);

  // Text removal specific states
  const [textRemovalImage, setTextRemovalImage] = useState(null);
  const [textRemovalImageUrl, setTextRemovalImageUrl] = useState(null);
  const [uploadingTextRemovalImage, setUploadingTextRemovalImage] = useState(false);

  // Cartoonify specific states
  const [cartoonifyImage, setCartoonifyImage] = useState(null);
  const [cartoonifyImageUrl, setCartoonifyImageUrl] = useState(null);
  const [uploadingCartoonifyImage, setUploadingCartoonifyImage] = useState(false);

  // Headshot specific states
  const [headshotImage, setHeadshotImage] = useState(null);
  const [headshotImageUrl, setHeadshotImageUrl] = useState(null);
  const [uploadingHeadshotImage, setUploadingHeadshotImage] = useState(false);
  const [selectedHeadshotGender, setSelectedHeadshotGender] = useState('None');
  const [selectedHeadshotBackground, setSelectedHeadshotBackground] = useState('Neutral');

  // Restore image specific states
  const [restoreImage, setRestoreImage] = useState(null);
  const [restoreImageUrl, setRestoreImageUrl] = useState(null);
  const [uploadingRestoreImage, setUploadingRestoreImage] = useState(false);

  // GFP Restore specific states
  const [gfpRestoreImage, setGfpRestoreImage] = useState(null);
  const [gfpRestoreImageUrl, setGfpRestoreImageUrl] = useState(null);
  const [uploadingGfpRestoreImage, setUploadingGfpRestoreImage] = useState(false);

  // Home Designer specific states
  const [homeDesignerImage, setHomeDesignerImage] = useState(null);
  const [homeDesignerImageUrl, setHomeDesignerImageUrl] = useState(null);
  const [uploadingHomeDesignerImage, setUploadingHomeDesignerImage] = useState(false);

  // Background Removal specific states
  const [backgroundRemovalImage, setBackgroundRemovalImage] = useState(null);
  const [backgroundRemovalImageUrl, setBackgroundRemovalImageUrl] = useState(null);
  const [uploadingBackgroundRemovalImage, setUploadingBackgroundRemovalImage] = useState(false);
  const [backgroundRemovalStatus, setBackgroundRemovalStatus] = useState('Loading model...');
  const [processingBackgroundRemoval, setProcessingBackgroundRemoval] = useState(false);

  // Remove Object specific states
  const [removeObjectImage, setRemoveObjectImage] = useState(null);
  const [removeObjectImageUrl, setRemoveObjectImageUrl] = useState(null);
  const [uploadingRemoveObjectImage, setUploadingRemoveObjectImage] = useState(false);
  const [removeObjectMask, setRemoveObjectMask] = useState(null);
  const [hasMaskDrawn, setHasMaskDrawn] = useState(false);
  const maskEditorRef = useRef(null);

  // ReImagine specific states
  const [reimagineImage, setReimagineImage] = useState(null);
  const [reimagineImageUrl, setReimagineImageUrl] = useState(null);
  const [uploadingReimagineImage, setUploadingReimagineImage] = useState(false);
  const [selectedReimagineGender, setSelectedReimagineGender] = useState('None');
  const [selectedScenario, setSelectedScenario] = useState('Random');

  // Combine image specific states - Dynamic array for multiple images
  const [combineImages, setCombineImages] = useState([null, null]); // Start with 2 slots
  const [combineImageUrls, setCombineImageUrls] = useState([null, null]);
  const [uploadingCombineImages, setUploadingCombineImages] = useState([false, false]);
  
  // Legacy states for backward compatibility with flux-kontext-pro
  const [combineImage1, setCombineImage1] = useState(null);
  const [combineImage2, setCombineImage2] = useState(null);
  const [combineImage1Url, setCombineImage1Url] = useState(null);
  const [combineImage2Url, setCombineImage2Url] = useState(null);
  const [uploadingCombine1, setUploadingCombine1] = useState(false);
  const [uploadingCombine2, setUploadingCombine2] = useState(false);

  // Edit image specific states
  const [editImage, setEditImage] = useState(null);
  const [editImageUrl, setEditImageUrl] = useState(null);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);

  // Upscale image specific states
  const [upscaleImage, setUpscaleImage] = useState(null);
  const [upscaleImageUrl, setUpscaleImageUrl] = useState(null);
  const [uploadingUpscaleImage, setUploadingUpscaleImage] = useState(false);

  // Video generation specific states
  const [selectedVideoModel, setSelectedVideoModel] = useState('kling-v2.5-turbo-pro');
  const [videoDuration, setVideoDuration] = useState(5);
  const [videoStartImage, setVideoStartImage] = useState(null);
  const [videoStartImageUrl, setVideoStartImageUrl] = useState(null);
  const [uploadingVideoStartImage, setUploadingVideoStartImage] = useState(false);
  const [videoJobs, setVideoJobs] = useState([]);
  const [loadingVideoJobs, setLoadingVideoJobs] = useState(false);

  // Video generation function
  const generateVideo = async () => {
    if (!inputPrompt.trim()) {
      enqueueSnackbar('Please enter a prompt for video generation', { variant: 'error' });
      return;
    }

    if (!videoStartImageUrl) {
      enqueueSnackbar('Please upload a start image for video generation', { variant: 'error' });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: inputPrompt.trim(),
          duration: videoDuration,
          aspectRatio: aspectRatio,
          startImage: videoStartImageUrl,
          model: selectedVideoModel
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to start video generation');
      }

      const message = data.hasWebhook 
        ? 'Video generation started! You will be notified when it completes.'
        : 'Video generation started! Check the status below or use "Check Status" to monitor progress.';
        
      enqueueSnackbar(message, { 
        variant: 'success',
        autoHideDuration: data.hasWebhook ? 5000 : 7000
      });

      // Add the new job to the jobs list
      const newJob = {
        id: data.jobId,
        replicateId: data.replicateId,
        status: 'running',
        model: selectedVideoModel,
        prompt: inputPrompt.trim(),
        duration: videoDuration,
        aspectRatio: aspectRatio,
        createdAt: new Date().toISOString(),
        hasWebhook: data.hasWebhook
      };

      setVideoJobs(prev => [newJob, ...prev]);

      // Clear the prompt after successful submission
      setInputPrompt('');

    } catch (error) {
      console.error('Video generation error:', error);
      enqueueSnackbar(error.message || 'Failed to start video generation', { variant: 'error' });
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to check video job status
  const checkVideoStatus = async (jobId) => {
    try {
      const response = await fetch(`/api/video/status?jobId=${jobId}`);
      const data = await response.json();

      if (response.ok) {
        // Update the job in the list
        setVideoJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, ...data } : job
        ));

        if (data.status === 'succeeded') {
          enqueueSnackbar('Video generation completed!', { variant: 'success' });
        } else if (data.status === 'failed') {
          enqueueSnackbar(`Video generation failed: ${data.errorMessage}`, { variant: 'error' });
        }
      }
    } catch (error) {
      console.error('Error checking video status:', error);
    }
  };

  // Function to fetch user's video jobs
  const fetchVideoJobs = async () => {
    setLoadingVideoJobs(true);
    try {
      const response = await fetch('/api/video/jobs');
      const data = await response.json();

      if (response.ok) {
        setVideoJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching video jobs:', error);
    } finally {
      setLoadingVideoJobs(false);
    }
  };

  // Load video jobs when component mounts or when switching to video model
  useEffect(() => {
    if (selectedModel === 'generate-video') {
      fetchVideoJobs();
    }
  }, [selectedModel]);

  // Poll for video job updates - more frequent if no webhooks (development)
  useEffect(() => {
    const runningJobs = videoJobs.filter(job => job.status === 'running');
    
    if (runningJobs.length > 0) {
      // Check if any job doesn't have webhooks (development mode)
      const hasJobsWithoutWebhooks = runningJobs.some(job => !job.hasWebhook);
      const pollInterval = hasJobsWithoutWebhooks ? 10000 : 30000; // 10s for dev, 30s for prod
      
      const interval = setInterval(() => {
        runningJobs.forEach(job => checkVideoStatus(job.id));
      }, pollInterval);

      return () => clearInterval(interval);
    }
  }, [videoJobs]);



  // Preview modal states
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [previewType, setPreviewType] = useState('generated'); // 'generated' or 'example'
  const [exampleImages, setExampleImages] = useState([]);
  const [exampleImageInfo, setExampleImageInfo] = useState(null);
  const [autoOpenComparison, setAutoOpenComparison] = useState(false);



  // Switch model states
  const editImageModels = [
    {
      name: 'Qwen Image',
      description: 'qwen/qwen-image-edit',
      model: 'qwen-image-edit',
    },
    {
      name: 'Nano Banana',
      description: 'google/nano-banana',
      model: 'nano-banana',
    },
    {
      name: 'Flux 2 Pro',
      description: 'black-forest-labs/flux-2-pro',
      model: 'flux-kontext-pro',
    },
    {
      name: 'Pruna AI',
      description: 'prunaai/flux-kontext-fast',
      model: 'pruna-ai-edit',
    },
    {
      name: 'Seedream 4.0',
      description: 'bytedance/seedream-4',
      model: 'seedream-4',
    }
  ];

  const combineImageModels = [
    {
      name: 'Pruna AI',
      description: 'prunaai/p-image-edit (Default - Supports up to 5 images)',
      model: 'pruna-ai',
    },
    {
      name: 'Flux 2 Pro',
      description: 'black-forest-labs/flux-2-pro',
      model: 'flux-kontext-pro',
    },
    {
      name: 'Nano Banana',
      description: 'google/nano-banana',
      model: 'nano-banana',
    },
    {
      name: 'Seedream 4.0',
      description: 'bytedance/seedream-4',
      model: 'seedream-4',
    }

  ]

  const generateImageModels = [
    {
      name: 'Qwen Image',
      description: 'qwen/qwen-image',
      model: 'qwen-image',
    },
    {
      name: 'Nano Banana',
      description: 'google/gemini-2.5-flash-image',
      model: 'gemini-2.5-flash-image',
    },
    {
      name: 'Flux Schnell',
      description: 'black-forest-labs/flux-schnell',
      model: 'flux-schnell',
    },
    {
      name: 'Pruna AI',
      description: 'prunaai/flux-fast',
      model: 'pruna-ai',
    },
    {
      name: 'Seedream 4.0',
      description: 'bytedance/seedream-4',
      model: 'seedream-4',
    }
  ]

  const upscaleImageModels = [
    {
      name: 'Crystal Upscaler',
      description: 'philz1337x/crystal-upscaler',
      model: 'crystal-upscaler',
      creditCost: 3,
      maxScale: 6,
      specialty: 'High quality crystal clear upscaling'
    },
    {
      name: 'Topaz Labs',
      description: 'topazlabs/image-upscale',
      model: 'topaz-labs',
      creditCost: 1,
      maxScale: '4x',
      specialty: 'Professional photo enhancement'
    },
    {
      name: 'Google Upscaler',
      description: 'google/upscaler',
      model: 'google-upscaler',
      creditCost: 2,
      maxScale: 'x4',
      specialty: 'Fast and reliable upscaling'
    },
    {
      name: 'SeedVR2',
      description: 'zsxkib/seedvr2',
      model: 'seedvr2',
      creditCost: 3,
      maxScale: 2,
      specialty: 'AI-powered image restoration'
    }
  ]

  const restoreImageModels = [
    {
      name: 'Flux Restore',
      description: 'flux-kontext-apps/restore-image',
      model: 'flux-restore',
      creditCost: 2,
      specialty: 'High-quality image restoration using Flux model'
    },
    {
      name: 'Topaz Labs Restore',
      description: 'topazlabs/image-upscale',
      model: 'topaz-restore',
      creditCost: 3,
      specialty: 'Professional photo enhancement and restoration'
    },
    {
      name: 'Google Upscaler Restore',
      description: 'google/upscaler',
      model: 'google-restore',
      creditCost: 2,
      specialty: 'Fast and reliable image restoration'
    },
    {
      name: 'Crystal Restore',
      description: 'philz1337x/crystal-upscaler',
      model: 'crystal-restore',
      creditCost: 4,
      specialty: 'Crystal clear high-quality restoration'
    }
  ]



  const [switchedModel, setSwitchedModel] = useState('pruna-ai'); // Default to pruna-ai for generate-image

  // Helper functions for dynamic combine image management
  const addCombineImageSlot = () => {
    // Limit based on selected model - Pruna AI supports max 5 images, others support up to 10
    const maxImages = switchedModel === 'pruna-ai' ? 5 : 10;
    if (combineImages.length < maxImages) {
      setCombineImages(prev => [...prev, null]);
      setCombineImageUrls(prev => [...prev, null]);
      setUploadingCombineImages(prev => [...prev, false]);
    }
  };

  const removeCombineImageSlot = (index) => {
    if (combineImages.length > 2) { // Minimum 2 images
      setCombineImages(prev => prev.filter((_, i) => i !== index));
      setCombineImageUrls(prev => prev.filter((_, i) => i !== index));
      setUploadingCombineImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateCombineImage = (index, imageData) => {
    setCombineImages(prev => {
      const newImages = [...prev];
      newImages[index] = imageData;
      return newImages;
    });
  };

  const updateCombineImageUrl = (index, url) => {
    setCombineImageUrls(prev => {
      const newUrls = [...prev];
      newUrls[index] = url;
      return newUrls;
    });
  };

  const updateUploadingCombineImage = (index, uploading) => {
    setUploadingCombineImages(prev => {
      const newUploading = [...prev];
      newUploading[index] = uploading;
      return newUploading;
    });
  };

  // Sync legacy states with dynamic arrays for backward compatibility
  useEffect(() => {
    if (combineImages.length >= 2) {
      setCombineImage1(combineImages[0]);
      setCombineImage2(combineImages[1]);
      setCombineImage1Url(combineImageUrls[0]);
      setCombineImage2Url(combineImageUrls[1]);
      setUploadingCombine1(uploadingCombineImages[0]);
      setUploadingCombine2(uploadingCombineImages[1]);
    }
  }, [combineImages, combineImageUrls, uploadingCombineImages]);


  // Combine image modal state
  const [combineModalOpen, setCombineModalOpen] = useState(false);

  // Combine image modal data for examples/history/community
  const [combineModalData, setCombineModalData] = useState({
    inputImage1: null,
    inputImage2: null,
    outputImage: null,
    isExample: false,
    isHistory: false,
    isCommunity: false
  });

  // Example image comparison states
  const [exampleCanCompare, setExampleCanCompare] = useState(false);
  const [exampleBeforeImage, setExampleBeforeImage] = useState(null);
  const [exampleAfterImage, setExampleAfterImage] = useState(null);
  const [exampleBeforeLabel, setExampleBeforeLabel] = useState(null);
  const [exampleAfterLabel, setExampleAfterLabel] = useState(null);

  // Authentication and state management
  const { data: session, status } = useSession();
  const isMountedRef = useRef(true);

  // Download handler
  const downloadHandler = useDownloadHandler();

  // Fetch user's credit points and daily usage when component mounts
  useEffect(() => {
    const fetchUserCredits = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/getPlan?userId=${session.user.id}`);
          if (response.ok && isMountedRef.current) {
            const { plan } = await response.json();
            if (plan && plan.remainingPoints !== undefined) {
              context.setCreditPoints(plan.remainingPoints);
            }
          }
        } catch (error) {
          console.error("Error fetching user credits:", error);
        }
      }
    };

    const fetchDailyUsage = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/user/daily-usage');
          if (response.ok && isMountedRef.current) {
            const dailyData = await response.json();
            context.setDailyUsage(dailyData);
          }
        } catch (error) {
          console.error("Error fetching daily usage:", error);
        }
      }
    };

    fetchUserCredits();
    fetchDailyUsage();

    // Cleanup function to set mounted ref to false on unmount
    return () => {
      isMountedRef.current = false;
    };
  }, [session?.user?.id, session?.user?.email]); // Only depend on session user properties, not context

  // Periodic credit refresh every 5 minutes
  useEffect(() => {
    if (session?.user?.id) {
      const interval = setInterval(() => {
        refreshUserCredits();
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [session]);

  // Function to refresh user credits and daily usage
  const refreshUserCredits = async () => {
    // Check if component is still mounted and session is valid
    if (!isMountedRef.current || (!session?.user?.id && !session?.user?.email)) return;

    if (session?.user?.id) {
      try {
        const response = await fetch(`/api/getPlan?userId=${session.user.id}`);
        if (response.ok && isMountedRef.current) {
          const { plan } = await response.json();
          if (plan && plan.remainingPoints !== undefined) {
            context.setCreditPoints(plan.remainingPoints);
          }
        }
      } catch (error) {
        console.error("Error refreshing user credits:", error);
      }
    }

    if (session?.user?.email) {
      try {
        const response = await fetch('/api/user/daily-usage');
        if (response.ok && isMountedRef.current) {
          const dailyData = await response.json();
          context.setDailyUsage(dailyData);
        }
      } catch (error) {
        console.error("Error refreshing daily usage:", error);
      }
    }
  };

  // State restoration after login
  useEffect(() => {
    if (session && status === 'authenticated') {
      const savedState = localStorage.getItem('aiEditorState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);

          // Check if state is not too old (24 hours)
          const stateAge = Date.now() - (state.timestamp || 0);
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours

          if (stateAge > maxAge) {
            localStorage.removeItem('aiEditorState');
            return;
          }

          // Restore state based on what was saved
          if (state.selectedModel) setSelectedModel(state.selectedModel);
          if (state.inputPrompt) setInputPrompt(state.inputPrompt);
          if (state.uploadedImageUrl) setUploadedImageUrl(state.uploadedImageUrl);
          if (state.aspectRatio) setAspectRatio(state.aspectRatio);
          if (state.numOutputs) setNumOutputs(state.numOutputs);
          if (state.selectedHairStyle) setSelectedHairStyle(state.selectedHairStyle);
          if (state.selectedHairColor) setSelectedHairColor(state.selectedHairColor);
          if (state.selectedGender) setSelectedGender(state.selectedGender);

          // Restore model-specific image URLs
          if (state.textRemovalImageUrl) setTextRemovalImageUrl(state.textRemovalImageUrl);
          // if (state.cartoonifyImageUrl) setCartoonifyImageUrl(state.cartoonifyImageUrl);
          if (state.headshotImageUrl) setHeadshotImageUrl(state.headshotImageUrl);
          if (state.restoreImageUrl) setRestoreImageUrl(state.restoreImageUrl);
          if (state.gfpRestoreImageUrl) setGfpRestoreImageUrl(state.gfpRestoreImageUrl);
          if (state.homeDesignerImageUrl) setHomeDesignerImageUrl(state.homeDesignerImageUrl);
          if (state.backgroundRemovalImageUrl) setBackgroundRemovalImageUrl(state.backgroundRemovalImageUrl);
          if (state.removeObjectImageUrl) setRemoveObjectImageUrl(state.removeObjectImageUrl);
          if (state.reimagineImageUrl) setReimagineImageUrl(state.reimagineImageUrl);
          if (state.combineImage1Url) setCombineImage1Url(state.combineImage1Url);
          if (state.combineImage2Url) setCombineImage2Url(state.combineImage2Url);

          // Restore model-specific image data (base64)
          if (state.uploadedImage) setUploadedImage(state.uploadedImage);
          if (state.textRemovalImage) setTextRemovalImage(state.textRemovalImage);
          // if (state.cartoonifyImage) setCartoonifyImage(state.cartoonifyImage);
          if (state.headshotImage) setHeadshotImage(state.headshotImage);
          if (state.restoreImage) setRestoreImage(state.restoreImage);
          if (state.gfpRestoreImage) setGfpRestoreImage(state.gfpRestoreImage);
          if (state.homeDesignerImage) setHomeDesignerImage(state.homeDesignerImage);
          if (state.backgroundRemovalImage) setBackgroundRemovalImage(state.backgroundRemovalImage);
          if (state.removeObjectImage) setRemoveObjectImage(state.removeObjectImage);
          if (state.reimagineImage) setReimagineImage(state.reimagineImage);
          if (state.combineImage1) setCombineImage1(state.combineImage1);
          if (state.combineImage2) setCombineImage2(state.combineImage2);

          // Restore model-specific configurations
          if (state.selectedHeadshotGender) setSelectedHeadshotGender(state.selectedHeadshotGender);
          if (state.selectedHeadshotBackground) setSelectedHeadshotBackground(state.selectedHeadshotBackground);
          if (state.selectedReimagineGender) setSelectedReimagineGender(state.selectedReimagineGender);
          if (state.selectedScenario) setSelectedScenario(state.selectedScenario);

          // Clear the saved state after restoration
          localStorage.removeItem('aiEditorState');
          enqueueSnackbar('Welcome back! Your previous work has been restored.', { variant: 'success' });

          // Force refresh of example masonry by triggering a re-render
          // The key prop on ExampleMasonry will force it to re-mount and clear its cache
          setTimeout(() => {
            // Force a re-render by updating a state that triggers the masonry refresh
            setSelectedModel(prev => {
              const newModel = prev;
              return newModel;
            });
          }, 100);
        } catch (error) {
          console.error('Error restoring state:', error);
          localStorage.removeItem('aiEditorState');
        }
      }
    }
  }, [session, status, enqueueSnackbar]);

  // Function to save current state and redirect to login
  const saveStateAndRedirect = () => {
    const currentState = {
      selectedModel,
      inputPrompt,
      uploadedImageUrl,
      aspectRatio,
      numOutputs,
      selectedHairStyle,
      selectedHairColor,
      selectedGender,
      // Model-specific image URLs
      textRemovalImageUrl,
      // cartoonifyImageUrl,
      headshotImageUrl,
      restoreImageUrl,
      gfpRestoreImageUrl,
      homeDesignerImageUrl,
      backgroundRemovalImageUrl,
      removeObjectImageUrl,
      reimagineImageUrl,
      combineImage1Url,
      combineImage2Url,
      // Model-specific image data (base64)
      uploadedImage,
      textRemovalImage,

      cartoonifyImage,
      headshotImage,
      restoreImage,
      gfpRestoreImage,
      homeDesignerImage,
      backgroundRemovalImage,
      removeObjectImage,
      reimagineImage,
      combineImage1,
      combineImage2,
      // Model-specific configurations
      selectedHeadshotGender,
      selectedHeadshotBackground,
      selectedReimagineGender,
      selectedScenario,
      // Timestamp for state freshness
      timestamp: Date.now()
    };
    localStorage.setItem('aiEditorState', JSON.stringify(currentState));
    localStorage.setItem('path', '/ai-image-editor');
    router.push('/login');
  };


  // Function to check authentication before API calls
  const checkAuthBeforeAction = () => {
    if (!session) {
      enqueueSnackbar('Please login to use this feature', { variant: 'warning' });
      saveStateAndRedirect();
      return false;
    }
    return true;
  };

  // Function to refresh history after successful image generation
  const refreshHistoryAfterGeneration = () => {
    if (exampleMasonryRef.current) {
      exampleMasonryRef.current.refreshHistory();
    }
  };



  // Refs for smooth scrolling
  const imageGenerationRef = useRef(null);
  const inputSectionRef = useRef(null);
  const exampleMasonryRef = useRef(null);

  // Handle URL parameter for model selection
  useEffect(() => {
    const { model } = router.query;
    if (model && modelConfigurations[model]) {
      setSelectedModel(model);

      // Update browser history without page reload
      if (window.history && window.history.replaceState) {
        const newUrl = `${window.location.pathname}?model=${model}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);
      }

      // Reset states when model changes from URL
      setSelectedItems([]);
      setSelectedStyles([]);

      // Set appropriate aspect ratio and outputs based on model
      if (model === 'hair-style' || model === 'combine-image' || model === 'home-designer') {
        setAspectRatio('match_input_image');
        setNumOutputs(1);
        setGeneratedImages([null]);
      } else if (model === 'restore-image' || model === 'gfp-restore' || model === 'background-removal' || model === 'remove-object' || model === 'upscale-image') {
        setAspectRatio('');
        setNumOutputs(1);
        setGeneratedImages([null]);
      } else if (['text-removal', 'headshot', 'reimagine'].includes(model)) {
        setAspectRatio('1:1');
        setNumOutputs(1);
        setGeneratedImages([null]);
      } else {
        setAspectRatio('1:1');
        setNumOutputs(1);
        setGeneratedImages([null, null]);
      }

      // Set the appropriate switchedModel based on the model type
      if (model === 'combine-image') {
        setSwitchedModel('pruna-ai');
      } else if (model === 'edit-image') {
        setSwitchedModel('seedream-4');
      } else if (model === 'generate-image') {
        setSwitchedModel('pruna-ai');
      }

      // Reset model-specific states
      if (model !== 'hair-style') {
        setSelectedHairStyle('No change');
        setSelectedHairColor('No change');
        setSelectedGender('Male');
        setUploadedImage(null);
        setUploadedImageUrl(null);
        setUploadingHairImage(false);
      }

      if (model !== 'text-removal') {
        setTextRemovalImage(null);
        setTextRemovalImageUrl(null);
        setUploadingTextRemovalImage(false);
      }


      if (model !== 'headshot') {
        setHeadshotImage(null);
        setHeadshotImageUrl(null);
        setUploadingHeadshotImage(false);
        setSelectedHeadshotGender('None');
        setSelectedHeadshotBackground('Neutral');
      }

      if (model !== 'restore-image') {
        setRestoreImage(null);
        setRestoreImageUrl(null);
        setUploadingRestoreImage(false);
      }

      if (model !== 'gfp-restore') {
        setGfpRestoreImage(null);
        setGfpRestoreImageUrl(null);
        setUploadingGfpRestoreImage(false);
      }

      if (model !== 'home-designer') {
        setHomeDesignerImage(null);
        setHomeDesignerImageUrl(null);
        setUploadingHomeDesignerImage(false);
      }

      if (model !== 'background-removal') {
        setBackgroundRemovalImage(null);
        setBackgroundRemovalImageUrl(null);
        setUploadingBackgroundRemovalImage(false);
        setBackgroundRemovalStatus('Loading model...');
        setProcessingBackgroundRemoval(false);
      }

      if (model !== 'remove-object') {
        setRemoveObjectImage(null);
        setRemoveObjectImageUrl(null);
        setUploadingRemoveObjectImage(false);
        setRemoveObjectMask(null);
        setHasMaskDrawn(false);
      }

      if (model !== 'reimagine') {
        setReimagineImage(null);
        setReimagineImageUrl(null);
        setUploadingReimagineImage(false);
        setSelectedReimagineGender('None');
        setSelectedScenario('Random');
      }

      if (model !== 'combine-image') {
        setCombineImage1(null);
        setCombineImage2(null);
        setCombineImage1Url(null);
        setCombineImage2Url(null);
        setUploadingCombine1(false);
        setUploadingCombine2(false);
      }
    }
  }, [router.query]);

  // Smooth scroll to image generation section
  const scrollToImageGeneration = () => {
    if (imageGenerationRef.current) {
      imageGenerationRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  // Smooth scroll to input section
  const scrollToInput = () => {
    if (inputSectionRef.current) {
      inputSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  // Smooth scroll to mask editor for remove-object model
  const scrollToMaskEditor = () => {
    if (maskEditorRef.current) {
      maskEditorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  // Auto-scroll to loading section when image generation starts
  useEffect(() => {
    if (isLoading && imageGenerationRef.current) {
      // Add a small delay to ensure the loader is rendered before scrolling
      const timer = setTimeout(() => {
        imageGenerationRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const handleModelChange = (event) => {
    const newModel = event.target.value;
    setSelectedModel(newModel);
    setSelectedItems([]);
    setSelectedStyles([]);
    router.push(`/ai-image-editor?model=${newModel}`);

    // Reset hair style specific states when switching models
    if (newModel !== 'hair-style') {
      setSelectedHairStyle('No change');
      setSelectedHairColor('No change');
      setSelectedGender('Male');
      setUploadedImage(null);
      setUploadedImageUrl(null);
      setUploadingHairImage(false);

    }

    if (newModel !== 'generate-image') {
      setGeneratedImages([null]);
      setNumOutputs(1);
      setAspectRatio('1:1');
      setInputPrompt('');
    }

    if (newModel !== 'edit-image') {
      setInputPrompt('');
      setUploadedImage(null);
      setUploadedImageUrl(null);
      setUploadingEditImage(false);
    }

    // Set appropriate default switched model based on the main model
    if (newModel === 'generate-image') {
      setSwitchedModel('pruna-ai'); // Default for generate-image
    } else if (newModel === 'edit-image') {
      setSwitchedModel('nano-banana'); // Default for edit-image
    } else if (newModel === 'combine-image') {
      setSwitchedModel('pruna-ai'); // Default for combine-image
    } else if (newModel === 'restore-image') {
      setSwitchedModel('flux-restore'); // Default for restore-image
    } else if (newModel === 'generate-video') {
      setSelectedVideoModel('kling-v2.5-turbo-pro'); // Default for video generation
      setAspectRatio('1:1'); // Default aspect ratio for video
    }

    // Reset video generation specific states when switching models
    if (newModel !== 'generate-video') {
      setSelectedVideoModel('kling-v2.5-turbo-pro');
      setVideoDuration(5);
      setVideoStartImage(null);
      setVideoStartImageUrl(null);
      setUploadingVideoStartImage(false);
      setVideoJobs([]);
    }
    // Reset text removal specific states when switching models
    if (newModel !== 'text-removal') {
      setTextRemovalImage(null);
      setTextRemovalImageUrl(null);
      setUploadingTextRemovalImage(false);
    }



    // Reset headshot specific states when switching models
    if (newModel !== 'headshot') {
      setHeadshotImage(null);
      setHeadshotImageUrl(null);
      setUploadingHeadshotImage(false);
      setSelectedHeadshotGender('None');
      setSelectedHeadshotBackground('Neutral');
    }

    // Reset restore image specific states when switching models
    if (newModel !== 'restore-image') {
      setRestoreImage(null);
      setRestoreImageUrl(null);
      setUploadingRestoreImage(false);
    }

    // Reset GFP restore specific states when switching models
    if (newModel !== 'gfp-restore') {
      setGfpRestoreImage(null);
      setGfpRestoreImageUrl(null);
      setUploadingGfpRestoreImage(false);
    }

    // Reset home designer specific states when switching models
    if (newModel !== 'home-designer') {
      setHomeDesignerImage(null);
      setHomeDesignerImageUrl(null);
      setUploadingHomeDesignerImage(false);
    }

    // Reset background removal specific states when switching models
    if (newModel !== 'background-removal') {
      setBackgroundRemovalImage(null);
      setBackgroundRemovalImageUrl(null);
      setUploadingBackgroundRemovalImage(false);
      setBackgroundRemovalStatus('Loading model...');
      setProcessingBackgroundRemoval(false);
    }

    // Reset remove object specific states when switching models
    if (newModel !== 'remove-object') {
      setRemoveObjectImage(null);
      setRemoveObjectImageUrl(null);
      setUploadingRemoveObjectImage(false);
      setRemoveObjectMask(null);
      setHasMaskDrawn(false);
    }

    // Reset reimagine specific states when switching models
    if (newModel !== 're-imagine') {
      setReimagineImage(null);
      setReimagineImageUrl(null);
      setUploadingReimagineImage(false);
      setSelectedReimagineGender('None');
      setSelectedScenario('Random');
    }

    // Reset combine image specific states when switching models
    if (newModel !== 'combine-image') {
      setCombineImage1(null);
      setCombineImage2(null);
      setCombineImage1Url(null);
      setCombineImage2Url(null);
      setUploadingCombine1(false);
      setUploadingCombine2(false);
    }

    // Reset aspect ratio to default for new model
    if (newModel === 'hair-style' || newModel === 'combine-image' || newModel === 'home-designer') {
      setAspectRatio('match_input_image');
    } else if (newModel === 'restore-image' || newModel === 'gfp-restore' || newModel === 'background-removal' || newModel === 'remove-object') {
      setAspectRatio('');
    } else if (newModel === 'text-removal' || newModel === 'headshot' || newModel === 're-imagine') {
      setAspectRatio('1:1');
    } else {
      setAspectRatio('1:1');
    }

    // Set number of outputs based on model
    if (newModel === 'hair-style' || newModel === 'combine-image' || newModel === 'home-designer' || newModel === 'background-removal' || newModel === 'remove-object' || newModel === 'text-removal' || newModel === 'headshot' || newModel === 'restore-image' || newModel === 'gfp-restore' || newModel === 're-imagine') {
      setNumOutputs(1);
      setGeneratedImages([null]);
    } else {
      setNumOutputs(1);
      setGeneratedImages([null, null]);
    }
  };



  // switched model handler
  const handleSwitchModel = (event) => {
    const newModel = event.target.value;
    setSwitchedModel(newModel);
    setSelectedModel(newModel);
    setSelectedItems([]);
    setSelectedStyles([]);
  };

  // Helper function to upload image to R2 immediately
  const uploadImageToR2 = async (imageData, fileName) => {
    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData,
          fileName
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Handle different error response formats
        if (typeof errorData === 'string') {
          throw new Error(errorData);
        } else if (errorData?.details) {
          throw new Error(errorData.details);
        } else if (errorData?.error) {
          throw new Error(errorData.error);
        } else {
          throw new Error('Upload failed');
        }
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Upload error:', error);
      enqueueSnackbar(`Upload failed: ${error.message}`, { variant: 'error' });
      return null;
    }
  };

  const generateFluxImages = async () => {
    if (!inputPrompt) {
      enqueueSnackbar('Please enter a prompt first', { variant: 'warning' });
      return;
    }

    // Check authentication before proceeding
    if (!checkAuthBeforeAction()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages(Array(numOutputs).fill(null));

    // Smooth scroll to image generation section
    scrollToImageGeneration();

    try {
      // Determine which model config to use based on switched model for generate-image
      const modelConfig = {};
      if (switchedModel === 'qwen-image') {
        modelConfig.qwen_image_generate = true;
      } else if (switchedModel === 'gemini-2.5-flash-image') {
        modelConfig.gemini_flash_image = true;
      } else if (switchedModel === 'flux-schnell') {
        modelConfig.flux_schnell_generate = true;
      } else if (switchedModel === 'pruna-ai') {
        modelConfig.pruna_ai_generate = true;
      } else if (switchedModel === 'seedream-4') {
        modelConfig.see_dreams_4_generate = true;
      } else {
        modelConfig.generate_flux_images = true;
      }

      const config = {
        ...modelConfig,
        prompt: inputPrompt,
        aspect_ratio: aspectRatio,
        num_outputs: numOutputs,
        switched_model: switchedModel // Pass the switched model for reference
      };

      const response = await fetch('/api/fluxApp/generateFluxImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate images';
        try {
          const errorData = await response.json();
          // Handle different error response formats
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          // If JSON parsing fails, use status text or default message
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Handle new response format with historyId
      if (Array.isArray(data) && data.length > 0 && data[0] && data[0].imageUrl) {
        // New format: [{ imageUrl, historyId }, ...]
        const imageUrls = data.map(item => item.imageUrl);

        setGeneratedImages(imageUrls);
      } else {
        setGeneratedImages(data);
      }

      enqueueSnackbar('Images generated successfully!', { variant: 'success' });

      // Refresh history to show the new image
      refreshHistoryAfterGeneration();

      // Refresh user credits to show updated balance
      refreshUserCredits();
    } catch (err) {
      enqueueSnackbar(err.message || 'Error generating images', { variant: 'error' });
      console.error('Error generating images:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateHairStyleImages = async () => {
    if (!uploadedImageUrl) {
      enqueueSnackbar('Please upload an image first', { variant: 'warning' });
      return;
    }

    // Check authentication before proceeding
    if (!checkAuthBeforeAction()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([null]); // Hair style model returns only 1 image

    // Smooth scroll to image generation section
    scrollToImageGeneration();

    try {
      enqueueSnackbar('Changing hair style...', { variant: 'info' });

      // Send the stored URL to Replicate
      const response = await fetch('/api/fluxApp/generateFluxImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            hair_style_change: true,
            image: uploadedImageUrl,
            hair_style: selectedHairStyle,
            hair_color: selectedHairColor,
            gender: selectedGender,
            aspect_ratio: aspectRatio
          }
        }),
      });

      if (!response.ok) {
        const errorMessage = await extractErrorMessage(response, 'Failed to change hair style');
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Handle new response format with historyId
      if (data && data.imageUrl) {
        // New format: { imageUrl, historyId }
        setGeneratedImages([data.imageUrl]);
      } else {
        // Fallback to old format
        setGeneratedImages([data]);
      }

      enqueueSnackbar('Hair style changed successfully!', { variant: 'success' });

      // Refresh history to show the new image
      refreshHistoryAfterGeneration();

      // Refresh user credits to show updated balance
      refreshUserCredits();
    } catch (err) {
      enqueueSnackbar(err.message || 'Error changing hair style', { variant: 'error' });
      console.error('Error changing hair style:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateEditImage = async () => {
    if (!editImageUrl) {
      enqueueSnackbar('Please upload an image to edit first', { variant: 'warning' });
      return;
    }

    if (!inputPrompt.trim()) {
      enqueueSnackbar('Please enter a prompt describing the edit', { variant: 'warning' });
      return;
    }

    // Check authentication before proceeding
    if (!checkAuthBeforeAction()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([null]); // Edit image model returns only 1 image

    // Smooth scroll to image generation section
    scrollToImageGeneration();

    try {
      enqueueSnackbar('Editing image...', { variant: 'info' });

      // Determine which model config to use based on switched model
      const modelConfig = {};
      if (switchedModel === 'qwen-image-edit') {
        modelConfig.qwen_image = true;
      } else if (switchedModel === 'nano-banana') {
        modelConfig.edit_image = true;
      } else if (switchedModel === 'flux-kontext-pro') {
        modelConfig.flux_context_pro = true;
      } else if (switchedModel === 'pruna-ai-edit') {
        modelConfig.pruna_ai_edit = true;
      } else if (switchedModel === 'seedream-4') {
        modelConfig.see_dreams_4_edit = true;
      } else {
        // Default to nano-banana if no model is selected
        modelConfig.edit_image = true;
      }

      const response = await fetch('/api/fluxApp/generateFluxImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            ...modelConfig,
            prompt: inputPrompt,
            input_image: editImageUrl,
            aspect_ratio: aspectRatio,
            switched_model: switchedModel // Pass the switched model for reference
          }
        }),
      });

      if (!response.ok) {
        const errorMessage = await extractErrorMessage(response, 'Failed to edit image');
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Handle new response format with historyId
      if (data && Array.isArray(data) && data.length > 0 && data[0].imageUrl) {
        // New format: [{ imageUrl, historyId }]
        setGeneratedImages(data.map(item => item.imageUrl));
      } else if (data && data.imageUrl) {
        // New format: { imageUrl, historyId }
        setGeneratedImages([data.imageUrl]);
      } else if (Array.isArray(data)) {
        // Fallback to old array format
        setGeneratedImages(data.filter(img => img !== null && img !== undefined));
      } else {
        // Fallback to old single item format
        setGeneratedImages([data]);
      }

      enqueueSnackbar('Image edited successfully!', { variant: 'success' });

      // Refresh history to show the new image
      refreshHistoryAfterGeneration();

      // Refresh user credits to show updated balance
      refreshUserCredits();
    } catch (err) {
      enqueueSnackbar(err.message || 'Error editing image', { variant: 'error' });
      console.error('Error editing image:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCombineImages = async () => {
    // Validation - all models now support multiple images
    const validImages = combineImageUrls.filter(url => url !== null);
    const modelName = switchedModel === 'nano-banana' ? 'Nano Banana' :
                      switchedModel === 'seedream-4' ? 'SeeDream 4' : 
                      switchedModel === 'pruna-ai' ? 'Pruna AI' : 'Flux 2 Pro';
    
    if (validImages.length < 2) {
      enqueueSnackbar(`Please upload at least 2 images for ${modelName} model`, { variant: 'warning' });
      return;
    }

    if (!inputPrompt.trim()) {
      enqueueSnackbar('Please enter a prompt for combining images', { variant: 'warning' });
      return;
    }

    // Check authentication before proceeding
    if (!checkAuthBeforeAction()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([null]); // Combine image model returns only 1 image

    // Smooth scroll to image generation section
    scrollToImageGeneration();

    try {
      enqueueSnackbar('Combining images...', { variant: 'info' });

      // Prepare config based on selected model
      let config;
      if (switchedModel === 'nano-banana') {
        const validImageUrls = combineImageUrls.filter(url => url !== null);
        config = {
          combine_images: true,
          prompt: inputPrompt,
          image_input: validImageUrls,
          switched_model: switchedModel
        };
      } else if (switchedModel === 'seedream-4') {
        const validImageUrls = combineImageUrls.filter(url => url !== null);
        config = {
          combine_images: true,
          prompt: inputPrompt,
          image_input: validImageUrls,
          aspect_ratio: aspectRatio,
          switched_model: switchedModel
        };
      } else if (switchedModel === 'pruna-ai') {
        // Pruna AI supports up to 5 images
        const validImageUrls = combineImageUrls.filter(url => url !== null).slice(0, 5);
        config = {
          combine_images: true,
          prompt: inputPrompt,
          image_input: validImageUrls,
          aspect_ratio: aspectRatio,
          switched_model: switchedModel
        };
      } else {
        // flux-2-pro config (now supports multiple images like nano-banana and seedream-4)
        const validImageUrls = combineImageUrls.filter(url => url !== null);
        config = {
          combine_images: true,
          prompt: inputPrompt,
          image_input: validImageUrls,
          aspect_ratio: aspectRatio,
          switched_model: switchedModel || 'flux-kontext-pro'
        };
      }

      // Send the stored URLs to Replicate
      const response = await fetch('/api/fluxApp/generateFluxImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      });

      if (!response.ok) {
        const errorMessage = await extractErrorMessage(response, 'Failed to combine images');
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Handle new response format with historyId
      if (data && data.imageUrl) {
        // New format: { imageUrl, historyId }
        setGeneratedImages([data.imageUrl]);
      } else {
        // Fallback to old format
        setGeneratedImages([data]);
      }

      enqueueSnackbar('Images combined successfully!', { variant: 'success' });

      // Refresh history to show the new image
      refreshHistoryAfterGeneration();

      // Refresh user credits to show updated balance
      refreshUserCredits();
    } catch (err) {
      enqueueSnackbar(err.message || 'Error combining images', { variant: 'error' });
      console.error('Error combining images:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateUpscaleImage = async () => {
    if (!upscaleImageUrl) {
      enqueueSnackbar('Please upload an image to upscale first', { variant: 'warning' });
      return;
    }

    // Check authentication before proceeding
    if (!checkAuthBeforeAction()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([null]); // Upscale model returns only 1 image

    // Smooth scroll to image generation section
    scrollToImageGeneration();

    try {
      enqueueSnackbar('Upscaling image...', { variant: 'info' });

      // Determine which model config to use based on switched model
      const modelConfig = {};
      if (switchedModel === 'crystal-upscaler') {
        modelConfig.crystal_upscaler = true;
      } else if (switchedModel === 'topaz-labs') {
        modelConfig.topaz_labs_upscale = true;
      } else if (switchedModel === 'google-upscaler') {
        modelConfig.google_upscaler = true;
      } else if (switchedModel === 'seedvr2') {
        modelConfig.seedvr2_upscale = true;
      } else {
        // Default to crystal-upscaler if no model is selected
        modelConfig.crystal_upscaler = true;
      }

      // Prepare config based on selected model
      const config = {
        ...modelConfig,
        input_image: upscaleImageUrl,
        switched_model: switchedModel
      };

      const response = await fetch('/api/fluxApp/generateFluxImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      });

      if (!response.ok) {
        const errorMessage = await extractErrorMessage(response, 'Failed to upscale image');
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Handle new response format with historyId
      if (data && data.imageUrl) {
        // New format: { imageUrl, historyId }
        setGeneratedImages([data.imageUrl]);
      } else {
        // Fallback to old format
        setGeneratedImages([data]);
      }

      enqueueSnackbar('Image upscaled successfully!', { variant: 'success' });

      // Refresh history to show the new image
      refreshHistoryAfterGeneration();

      // Refresh user credits to show updated balance
      refreshUserCredits();
    } catch (err) {
      enqueueSnackbar(err.message || 'Error upscaling image', { variant: 'error' });
      console.error('Error upscaling image:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTextRemovalImage = async () => {
    if (!textRemovalImageUrl) {
      enqueueSnackbar('Please upload an image first', { variant: 'warning' });
      return;
    }

    // Check authentication before proceeding
    if (!checkAuthBeforeAction()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setNumOutputs(1); // Ensure only 1 output for text removal
    setGeneratedImages([null]); // Text removal model returns only 1 image

    // Smooth scroll to image generation section
    scrollToImageGeneration();

    try {
      enqueueSnackbar('Removing text from image...', { variant: 'info' });

      // Send the stored URL to Replicate
      const response = await fetch('/api/fluxApp/generateFluxImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            text_removal: true,
            input_image: textRemovalImageUrl,
            aspect_ratio: aspectRatio,
            output_format: 'png',
            safety_tolerance: 2
          }
        }),
      });

      if (!response.ok) {
        const errorMessage = await extractErrorMessage(response, 'Failed to remove text from image');
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Handle new response format with historyId
      if (data && data.imageUrl) {
        // New format: { imageUrl, historyId }
        setGeneratedImages([data.imageUrl]);
      } else {
        // Fallback to old format - Make sure we have a valid image URL or data URL
        if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('data:'))) {
          setGeneratedImages([data]); // Text removal model returns single image
        } else if (Array.isArray(data) && data.length > 0) {
          setGeneratedImages([data[0]]); // Take the first item if it's an array
        } else {
          console.error("Unexpected text removal response format:", data);
          enqueueSnackbar('Error processing text removal image', { variant: 'error' });
          setGeneratedImages([null]);
        }
      }

      enqueueSnackbar('Text removed successfully!', { variant: 'success' });

      // Refresh history to show the new image
      refreshHistoryAfterGeneration();

      // Refresh user credits to show updated balance
      refreshUserCredits();
    } catch (err) {
      enqueueSnackbar(err.message || 'Error removing text from image', { variant: 'error' });
      console.error('Error removing text from image:', err);
    } finally {
      setIsLoading(false);
    }
  };


  const generateHeadshotImage = async () => {
    if (!headshotImageUrl) {
      enqueueSnackbar('Please upload an image first', { variant: 'warning' });
      return;
    }

    // Check authentication before proceeding
    if (!checkAuthBeforeAction()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setNumOutputs(1); // Ensure only 1 output for headshot
    setGeneratedImages([null]); // Headshot model returns only 1 image

    // Smooth scroll to image generation section
    scrollToImageGeneration();

    try {
      enqueueSnackbar('Generating professional headshot...', { variant: 'info' });

      // Send the stored URL to Replicate
      const response = await fetch('/api/fluxApp/generateFluxImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            headshot: true,
            input_image: headshotImageUrl,
            gender: selectedHeadshotGender.toLowerCase(),
            background: selectedHeadshotBackground.toLowerCase(),
            aspect_ratio: aspectRatio,
            output_format: 'png',
            safety_tolerance: 2
          }
        }),
      });

      if (!response.ok) {
        const errorMessage = await extractErrorMessage(response, 'Failed to generate headshot');
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Handle new response format with historyId
      if (data && data.imageUrl) {
        // New format: { imageUrl, historyId }
        setGeneratedImages([data.imageUrl]);
      } else {
        // Fallback to old format - Make sure we have a valid image URL or data URL
        if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('data:'))) {
          setGeneratedImages([data]); // Headshot model returns single image
        } else if (Array.isArray(data) && data.length > 0) {
          setGeneratedImages([data[0]]); // Take the first item if it's an array
        } else {
          console.error("Unexpected headshot response format:", data);
          enqueueSnackbar('Error processing headshot image', { variant: 'error' });
          setGeneratedImages([null]);
        }
      }
      enqueueSnackbar('Professional headshot generated successfully!', { variant: 'success' });

      // Refresh history to show the new image
      refreshHistoryAfterGeneration();

      // Refresh user credits to show updated balance
      refreshUserCredits();
    } catch (err) {
      enqueueSnackbar(err.message || 'Error generating headshot', { variant: 'error' });
      console.error('Error generating headshot:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRestoreImage = async () => {
    if (!restoreImageUrl) {
      enqueueSnackbar('Please upload an image first', { variant: 'warning' });
      return;
    }

    // Check authentication before proceeding
    if (!checkAuthBeforeAction()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setNumOutputs(1); // Ensure only 1 output for restore image
    setGeneratedImages([null]); // Restore image model returns only 1 image

    // Smooth scroll to image generation section
    scrollToImageGeneration();

    try {
      enqueueSnackbar('Restoring image...', { variant: 'info' });

      // Determine which model config to use based on switched model for restore-image
      const modelConfig = {};
      if (switchedModel === 'flux-restore') {
        modelConfig.restore_image = true;
      } else if (switchedModel === 'topaz-restore') {
        modelConfig.topaz_labs_restore = true;
      } else if (switchedModel === 'google-restore') {
        modelConfig.google_restore = true;
      } else if (switchedModel === 'crystal-restore') {
        modelConfig.crystal_restore = true;
      } else {
        modelConfig.restore_image = true; // Default to flux restore
      }

      // Send the stored URL to Replicate
      const response = await fetch('/api/fluxApp/generateFluxImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            ...modelConfig,
            input_image: restoreImageUrl,
            aspect_ratio: aspectRatio,
            output_format: 'png',
            safety_tolerance: 2,
            switched_model: switchedModel // Pass the switched model for reference
          }
        }),
      });

      if (!response.ok) {
        const errorMessage = await extractErrorMessage(response, 'Failed to restore image');
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Handle new response format with historyId
      if (data && data.imageUrl) {
        // New format: { imageUrl, historyId }
        setGeneratedImages([data.imageUrl]);
      } else {
        // Fallback to old format - Make sure we have a valid image URL or data URL
        if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('data:'))) {
          setGeneratedImages([data]); // Restore image model returns single image
        } else if (Array.isArray(data) && data.length > 0) {
          setGeneratedImages([data[0]]); // Take the first item if it's an array
        } else {
          console.error("Unexpected restore image response format:", data);
          enqueueSnackbar('Error processing restored image', { variant: 'error' });
          setGeneratedImages([null]);
        }
      }

      enqueueSnackbar('Image restored successfully!', { variant: 'success' });

      // Refresh history to show the new image
      refreshHistoryAfterGeneration();

      // Refresh user credits to show updated balance
      refreshUserCredits();
    } catch (err) {
      enqueueSnackbar(err.message || 'Error restoring image', { variant: 'error' });
      console.error('Error restoring image:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateGfpRestoreImage = async () => {
    if (!gfpRestoreImageUrl) {
      enqueueSnackbar('Please upload an image first', { variant: 'warning' });
      return;
    }

    // Check authentication before proceeding
    if (!checkAuthBeforeAction()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setNumOutputs(1); // Ensure only 1 output for GFP restore
    setGeneratedImages([null]); // GFP restore model returns only 1 image

    // Smooth scroll to image generation section
    scrollToImageGeneration();

    try {
      enqueueSnackbar('Restoring image    (Free)...', { variant: 'info' });

      // Send the stored URL to Replicate
      const response = await fetch('/api/fluxApp/generateFluxImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            gfp_restore: true,
            input_image: gfpRestoreImageUrl
          }
        }),
      });

      if (!response.ok) {
        const errorMessage = await extractErrorMessage(response, 'Failed to restore image with GFP');
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Handle new response format with historyId
      if (data && data.imageUrl) {
        // New format: { imageUrl, historyId }
        setGeneratedImages([data.imageUrl]);
      } else {
        // Fallback to old format - Make sure we have a valid image URL or data URL
        if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('data:'))) {
          setGeneratedImages([data]); // GFP restore model returns single image
        } else if (Array.isArray(data) && data.length > 0) {
          setGeneratedImages([data[0]]); // Take the first item if it's an array
        } else {
          console.error("Unexpected GFP restore response format:", data);
          enqueueSnackbar('Error processing GFP restored image', { variant: 'error' });
          setGeneratedImages([null]);
        }
      }

      enqueueSnackbar('Image restored successfully', { variant: 'success' });

      // Refresh history to show the new image
      refreshHistoryAfterGeneration();

      // Refresh user credits to show updated balance
      refreshUserCredits();
    } catch (err) {
      enqueueSnackbar(err.message || 'Error restoring image with  ', { variant: 'error' });
      console.error('Error restoring image with  :', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateHomeDesignerImage = async () => {
    if (!homeDesignerImageUrl) {
      enqueueSnackbar('Please upload an image first', { variant: 'warning' });
      return;
    }

    if (!inputPrompt.trim()) {
      enqueueSnackbar('Please enter a design prompt', { variant: 'warning' });
      return;
    }

    // Check authentication before proceeding
    if (!checkAuthBeforeAction()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setNumOutputs(1); // Ensure only 1 output for home designer
    setGeneratedImages([null]); // Home designer model returns only 1 image

    // Smooth scroll to image generation section
    scrollToImageGeneration();

    try {
      enqueueSnackbar('Designing your home interior...', { variant: 'info' });

      // Send the stored URL to Replicate
      const response = await fetch('/api/fluxApp/generateFluxImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            home_designer: true,
            input_image: homeDesignerImageUrl,
            prompt: inputPrompt,
            aspect_ratio: aspectRatio
          }
        }),
      });

      if (!response.ok) {
        const errorMessage = await extractErrorMessage(response, 'Failed to generate home design');
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Handle new response format with historyId
      if (data && data.imageUrl) {
        // New format: { imageUrl, historyId }
        setGeneratedImages([data.imageUrl]);
      } else {
        // Fallback to old format - Make sure we have a valid image URL or data URL
        if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('data:'))) {
          setGeneratedImages([data]); // Home designer model returns single image
        } else if (Array.isArray(data) && data.length > 0) {
          setGeneratedImages([data[0]]); // Take the first item if it's an array
        } else {
          console.error("Unexpected home designer response format:", data);
          enqueueSnackbar('Error processing home design', { variant: 'error' });
          setGeneratedImages([null]);
        }
      }

      enqueueSnackbar('Home design generated successfully!', { variant: 'success' });

      // Refresh history to show the new image
      refreshHistoryAfterGeneration();

      // Refresh user credits to show updated balance
      refreshUserCredits();
    } catch (err) {
      enqueueSnackbar(err.message || 'Error generating home design', { variant: 'error' });
      console.error('Error generating home design:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateBackgroundRemovalImage = async () => {
    if (!backgroundRemovalImage) {
      enqueueSnackbar('Please upload an image first', { variant: 'warning' });
      return;
    }

    // Check authentication before proceeding
    if (!checkAuthBeforeAction()) {
      return;
    }

    if (backgroundRemovalStatus !== 'Ready') {
      enqueueSnackbar('Background removal model is still loading...', { variant: 'warning' });
      return;
    }

    // The processing will be handled by the BackgroundRemovalProcessor component
    // Just trigger it by setting the processing state
    setProcessingBackgroundRemoval(true);
    setIsLoading(true);
    setError(null);
    setNumOutputs(1);
    setGeneratedImages([null]);

    // Smooth scroll to image generation section
    scrollToImageGeneration();
  };

  // Handle background removal callbacks
  const handleBackgroundRemovalStart = () => {
    enqueueSnackbar('Analyzing image...', { variant: 'info' });
  };

  const handleBackgroundRemovalComplete = (resultImageUrl) => {
    setGeneratedImages([resultImageUrl]);
    setIsLoading(false);
    setProcessingBackgroundRemoval(false);
    enqueueSnackbar('Background removed successfully!', { variant: 'success' });

    // Refresh history to show the new image
    refreshHistoryAfterGeneration();

    // Refresh user credits to show updated balance
    refreshUserCredits();
  };

  const handleBackgroundRemovalError = (error) => {
    setIsLoading(false);
    setProcessingBackgroundRemoval(false);
    enqueueSnackbar(error || 'Error removing background', { variant: 'error' });
  };

  const handleBackgroundRemovalStatusChange = (status) => {
    setBackgroundRemovalStatus(status);
  };

  const generateRemoveObjectImage = async () => {
    if (!removeObjectImageUrl) {
      enqueueSnackbar('Please upload an image first', { variant: 'warning' });
      return;
    }

    if (!removeObjectMask || !hasMaskDrawn) {
      enqueueSnackbar('Please draw on the image to mark objects for removal', { variant: 'warning' });
      return;
    }

    // Check authentication before proceeding
    if (!checkAuthBeforeAction()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setNumOutputs(1); // Ensure only 1 output for remove object
    setGeneratedImages([null]); // Remove object model returns only 1 image

    // Smooth scroll to image generation section
    scrollToImageGeneration();

    try {
      enqueueSnackbar('Removing objects...', { variant: 'info' });

      // Upload mask to R2 first
      const maskUrl = await uploadImageToR2(removeObjectMask, 'remove-object-mask.png');
      if (!maskUrl) {
        throw new Error('Failed to upload mask image');
      }

      // Send the stored URLs to Replicate
      const response = await fetch('/api/fluxApp/generateFluxImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            remove_object: true,
            input_image: removeObjectImageUrl,
            mask_image: maskUrl
          }
        }),
      });

      if (!response.ok) {
        const errorMessage = await extractErrorMessage(response, 'Failed to remove objects');
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Handle new response format with historyId
      if (data && data.imageUrl) {
        // New format: { imageUrl, historyId }
        setGeneratedImages([data.imageUrl]);
      } else {
        // Fallback to old format - Make sure we have a valid image URL or data URL
        if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('data:'))) {
          setGeneratedImages([data]); // Remove object model returns single image
        } else if (Array.isArray(data) && data.length > 0) {
          setGeneratedImages([data[0]]); // Take the first item if it's an array
        } else {
          console.error("Unexpected remove object response format:", data);
          enqueueSnackbar('Error processing object removal', { variant: 'error' });
          setGeneratedImages([null]);
        }
      }
      enqueueSnackbar('Objects removed successfully!', { variant: 'success' });

      // Refresh history to show the new image
      refreshHistoryAfterGeneration();

      // Refresh user credits to show updated balance
      refreshUserCredits();
    } catch (err) {
      enqueueSnackbar(err.message || 'Error removing objects', { variant: 'error' });
      console.error('Error removing objects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle mask creation from the ObjectRemovalMaskEditor
  const handleMaskCreated = (maskDataUrl) => {
    setRemoveObjectMask(maskDataUrl);
    setHasMaskDrawn(true);
  };

  const generateReimagineImage = async () => {
    if (!reimagineImageUrl) {
      enqueueSnackbar('Please upload an image first', { variant: 'warning' });
      return;
    }

    // Check authentication before proceeding
    if (!checkAuthBeforeAction()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setNumOutputs(1); // Ensure only 1 output for reimagine
    setGeneratedImages([null]); // ReImagine model returns only 1 image

    // Smooth scroll to image generation section
    scrollToImageGeneration();

    try {
      enqueueSnackbar('Generating ReImagine Scenarios...', { variant: 'info' });

      // Send the stored URL to Replicate
      const response = await fetch('/api/fluxApp/generateFluxImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            reimagine: true,
            input_image: reimagineImageUrl,
            gender: selectedReimagineGender.toLowerCase(),
            aspect_ratio: aspectRatio,
            output_format: "png",
            safety_tolerance: 2,
            impossible_scenario: selectedScenario
          }
        }),
      });

      if (!response.ok) {
        const errorMessage = await extractErrorMessage(response, 'Failed to generate impossible scenario');
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Handle new response format with historyId
      if (data && data.imageUrl) {
        // New format: { imageUrl, historyId }
        setGeneratedImages([data.imageUrl]);
      } else {
        // Fallback to old format - Make sure we have a valid image URL or data URL
        if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('data:'))) {
          setGeneratedImages([data]); // ReImagine model returns single image
        } else if (Array.isArray(data) && data.length > 0) {
          setGeneratedImages([data[0]]); // Take the first item if it's an array
        } else {
          console.error("Unexpected reimagine response format:", data);
          enqueueSnackbar('Error processing reimagined image', { variant: 'error' });
          setGeneratedImages([null]);
        }
      }

      enqueueSnackbar('Impossible scenario generated successfully!', { variant: 'success' });

      // Refresh history to show the new image
      refreshHistoryAfterGeneration();

      // Refresh user credits to show updated balance
      refreshUserCredits();
    } catch (err) {
      enqueueSnackbar(err.message || 'Error generating impossible scenario', { variant: 'error' });
      console.error('Error generating impossible scenario:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      if (inputPrompt.trim()) {
        if (selectedModel === 'combine-image') {
          generateCombineImages();
        } else {
          generateFluxImages();
        }
      }
    }
  };



  const handleChipClick = (option) => {
    if (currentConfig.type === 'prompts' || currentConfig.type === 'edit-image') {
      // For text prompts, just set the input
      setInputPrompt(option);
    } else {
      // For styles, handle selection with chips
      if (selectedItems.includes(option)) {
        setSelectedItems(selectedItems.filter(item => item !== option));
      } else {
        setSelectedItems([...selectedItems, option]);
      }
    }
  };

  const handleChipDelete = (itemToDelete) => {
    setSelectedItems(selectedItems.filter(item => item !== itemToDelete));
  };

  const handleStyleSelect = (style) => {
    const isSelected = selectedStyles.some(s => s.id === style.id);
    if (isSelected) {
      setSelectedStyles(selectedStyles.filter(s => s.id !== style.id));
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e, index) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImages = [...generatedImages];
        newImages[index] = event.target.result;
        setGeneratedImages(newImages);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [generatedImages]);



  const removeImage = (index) => {
    const newImages = [...generatedImages];
    newImages[index] = null;
    setGeneratedImages(newImages);
  };

  // Close mobile menu when clicking outside
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (mobileMenuOpen && !event.target.closest('.MuiBox-root')) {
  //       setMobileMenuOpen(false);
  //     }
  //   };

  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => document.removeEventListener('mousedown', handleClickOutside);
  // }, [mobileMenuOpen]);

  // Log when generatedImages changes
  useEffect(() => {

  }, [generatedImages]);



  const currentConfig = modelConfigurations[selectedModel];

  // Get display name for model
  const getModelDisplayName = (model) => {
    const names = {
      'generate-image': 'AI Image Generator',
      'hair-style': 'Hair Style Changer',
      'headshot': 'Professional Headshot',
      'restore-image': 'Image Restoration',
      'text-removal': 'Text/Watermark Removal',
      'reimagine': 'ReImagine Scenarios',
      'combine-image': 'Image Combiner'
    };
    return names[model] || model;
  };

  // Utility function to generate intelligent filename
  const generateFileName = (model, prompt = '', index = 0) => {
    const config = modelConfigurations[model];
    const usesPrompts = config?.type === 'prompts';

    // Generate random string
    const randomString = Math.random().toString(36).substring(2, 8);

    if (usesPrompts && prompt && prompt.trim()) {
      // Clean and format prompt for filename
      const cleanPrompt = prompt
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .substring(0, 50); // Limit length to 50 characters

      return `${cleanPrompt}-${randomString}.jpg`;
    } else if (model === 'hair-style' && selectedHairStyle && selectedHairStyle !== 'No change') {
      // Use selected hair style for hair-style model
      const cleanStyle = selectedHairStyle
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .substring(0, 30); // Limit length to 30 characters

      return `hair-style-${cleanStyle}-${randomString}.jpg`;
    } else if (model === 'reimagine' && selectedScenario && selectedScenario !== 'Random') {
      // Use selected scenario for reimagine model
      const cleanScenario = selectedScenario
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .substring(0, 40); // Limit length to 40 characters

      return `reimagine-${cleanScenario}-${randomString}.jpg`;
    } else {
      // Use model name with random string
      const modelName = getModelDisplayName(model)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');

      return `${modelName}-${randomString}.jpg`;
    }
  };

  const handleDownload = (imageUrl, index) => {
    // Generate intelligent filename
    const filename = generateFileName(selectedModel, inputPrompt, index);

    // For base64 images, download directly (no watermark needed for base64)
    if (imageUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For regular URLs, use the new download handler that checks user plan
      downloadHandler.handleDownload(imageUrl, filename);
    }
  };

  const getAllStyleItems = () => {
    if (!currentConfig) return [];
    if (selectedGender === "Male") {
      return currentConfig.hairStylesMale || [];
    } else if (selectedGender === "Female") {
      return currentConfig.hairStylesFemale || [];
    }
    return [];
  };

  // Helper function to generate model configuration for generated images
  const generateGeneratedImageConfig = () => {
    const configParts = [];

    switch (selectedModel) {
      case 'hair-style':
        if (selectedHairStyle && selectedHairStyle !== 'No change') {
          configParts.push(`${selectedHairStyle} hairstyle`);
        }
        if (selectedHairColor && selectedHairColor !== 'No change') {
          configParts.push(`${selectedHairColor.toLowerCase()} hair color`);
        }
        if (selectedGender && selectedGender !== 'None') {
          configParts.push(`${selectedGender.toLowerCase()} styling`);
        }
        break;

      case 'headshot':
        if (selectedHeadshotBackground && selectedHeadshotBackground !== 'None') {
          configParts.push(`${selectedHeadshotBackground.toLowerCase()} background`);
        }
        if (selectedHeadshotGender && selectedHeadshotGender !== 'None') {
          configParts.push(`${selectedHeadshotGender.toLowerCase()} professional headshot`);
        }
        break;

      case 'reimagine':
        if (selectedScenario && selectedScenario !== 'Random') {
          configParts.push(selectedScenario);
        }
        if (selectedReimagineGender && selectedReimagineGender !== 'None') {
          configParts.push(`${selectedReimagineGender.toLowerCase()} scenario`);
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

      case 'generate-image':
        // For generate-image, we'll handle this separately
        break;

      default:
        break;
    }

    // Add aspect ratio if available
    if (aspectRatio) {
      configParts.push(`${aspectRatio} aspect ratio`);
    }

    return configParts.length > 0 ? configParts.join(', ') : null;
  };

  // Function to generate proper configuration display for modal
  const generateModelConfigurationDisplay = () => {
    // For generate-image model, show prompt if available, otherwise show configuration
    if (selectedModel === 'generate-image') {
      if (inputPrompt && inputPrompt.trim()) {
        return {
          type: 'prompt',
          content: inputPrompt
        };
      } else {
        const configParts = [];
        if (aspectRatio && aspectRatio !== '1:1') {
          configParts.push(`${aspectRatio} aspect ratio`);
        }
        if (numOutputs > 1) {
          configParts.push(`${numOutputs} images generated`);
        }
        return {
          type: 'config',
          content: configParts.length > 0 ? configParts.join(', ') : 'AI Generated Image'
        };
      }
    }

    // For other models, show specific configuration options
    const configText = generateGeneratedImageConfig();

    if (configText) {
      return {
        type: 'config',
        content: configText
      };
    } else {
      return {
        type: 'config',
        content: getModelDisplayName(selectedModel)
      };
    }
  };

  const handlePreview = (imageUrl, imageIndex = 0) => {
    // For combine-image model, open the custom modal instead
    if (selectedModel === 'combine-image') {
      setCombineModalOpen(true);
      return;
    }

    // Filter out null images to get valid images array
    const validImages = generatedImages.filter(img => img !== null);
    // Find the index in the valid images array
    const validIndex = validImages.findIndex(img => img === imageUrl);
    setCurrentImageIndex(validIndex >= 0 ? validIndex : 0);
    setPreviewImage(imageUrl);
    setPreviewType('generated');
    setExampleImages([]);

    // Generate model configuration for when there's no prompt
    const modelConfigText = !inputPrompt || !inputPrompt.trim()
      ? generateGeneratedImageConfig()
      : null;

    setExampleImageInfo({
      title: `Generated Image ${validIndex + 1}`,
      prompt: inputPrompt || null,
      modelConfig: modelConfigText,
      model: selectedModel,
      createdAt: new Date().toISOString(),
      resolution: 'High Quality',
      format: 'JPEG',
      type: 'generated'
    });
    setAutoOpenComparison(false);
    setPreviewOpen(true);
  };

  // Special preview handler for combine-image model
  const handleCombineImagePreview = () => {
    setCombineModalOpen(true);
  };

  const handleCombineModalClose = () => {
    setCombineModalOpen(false);
    setCombineModalData({
      inputImage1: null,
      inputImage2: null,
      outputImage: null,
      isExample: false,
      isHistory: false,
      isCommunity: false
    });
  };

  const handleComparePreview = (imageUrl, imageIndex = 0) => {
    // Open preview modal and automatically activate comparison mode
    const validImages = generatedImages.filter(img => img !== null);
    const validIndex = validImages.findIndex(img => img === imageUrl);
    setCurrentImageIndex(validIndex >= 0 ? validIndex : 0);
    setPreviewImage(imageUrl);
    setPreviewType('generated');
    setExampleImages([]);

    // Generate model configuration for when there's no prompt
    const modelConfigText = !inputPrompt || !inputPrompt.trim()
      ? generateGeneratedImageConfig()
      : null;

    setExampleImageInfo({
      // title: `Generated Image ${validIndex + 1}`,
      prompt: inputPrompt || null,
      modelConfig: modelConfigText,
      model: selectedModel,
      createdAt: new Date().toISOString(),
      resolution: 'High Quality',
      format: 'JPEG',
      type: 'generated'
    });
    setAutoOpenComparison(true);
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
    setPreviewImage(null);
    setCurrentImageIndex(0);
    setPreviewType('generated');
    setExampleImages([]);
    setExampleImageInfo(null);
    setAutoOpenComparison(false);

    // Reset example comparison states
    setExampleCanCompare(false);
    setExampleBeforeImage(null);
    setExampleAfterImage(null);
    setExampleBeforeLabel(null);
    setExampleAfterLabel(null);
  };

  // Handle image navigation in preview
  const handleImageChange = (newIndex) => {
    setCurrentImageIndex(newIndex);

    if (previewType === 'generated') {
      // Update previewImage based on the new index for generated images
      const validImages = generatedImages.filter(img => img !== null);
      if (validImages[newIndex]) {
        setPreviewImage(validImages[newIndex]);
      }
    } else if (previewType === 'example') {
      // Update previewImage based on the new index for example images
      if (exampleImages[newIndex]) {
        setPreviewImage(exampleImages[newIndex].url);
        setExampleImageInfo({
          title: exampleImages[newIndex].title,
          prompt: exampleImages[newIndex].prompt,
          model: selectedModel,
          // created: 'Example Image',
          resolution: 'High Quality',
          format: 'JPEG',
          type: 'example'
        });
      }
    }
  };

  // Handle example image click from masonry
  const handleExampleImageClick = (imageData) => {
    // For combine-image model, use the custom combine modal
    if (selectedModel === 'combine-image' && imageData.combineData) {
      // Determine the type of image (example, history, or community)
      const imageType = imageData.imageInfo?.type || 'example';

      setCombineModalData({
        inputImage1: imageData.combineData.inputImage1,
        inputImage2: imageData.combineData.inputImage2,
        outputImage: imageData.combineData.outputImage,
        isExample: imageType === 'example',
        isHistory: imageType === 'history',
        isCommunity: imageType === 'community'
      });
      setCombineModalOpen(true);
      return;
    }

    // Regular preview for other models
    setPreviewImage(imageData.url);
    setCurrentImageIndex(imageData.index);
    setPreviewType('example');
    setExampleImages(imageData.images);
    setExampleImageInfo(imageData.imageInfo);

    // Set comparison data if available
    setExampleCanCompare(imageData.canCompare || false);
    setExampleBeforeImage(imageData.beforeImage || null);
    setExampleAfterImage(imageData.afterImage || null);
    setExampleBeforeLabel(imageData.beforeLabel || null);
    setExampleAfterLabel(imageData.afterLabel || null);

    setPreviewOpen(true);
  };

  // Handle prompt use from masonry
  const handlePromptUse = (prompt) => {
    setInputPrompt(prompt);

    // Smooth scroll to input section after a short delay to let the snackbar appear
    setTimeout(() => {
      scrollToInput();

      // Focus the input field after scrolling for better UX
      const inputElement = inputSectionRef.current?.querySelector('textarea');
      if (inputElement) {
        setTimeout(() => {
          inputElement.focus();
          inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
        }, 500);
      }
    }, 300);
  };

  // Image comparison functions
  const canCompareImages = () => {
    // Hide compare functionality for combine-image model as it needs a special 3-image layout
    if (selectedModel === 'combine-image') {
      return false;
    }

    // Check if we have images available for comparison
    if (selectedModel === 'hair-style' && uploadedImage && Array.isArray(generatedImages) && generatedImages[0]) {
      return true;
    }
    if (selectedModel === 'text-removal' && textRemovalImage && Array.isArray(generatedImages) && generatedImages[0]) {
      return true;
    }

    if (selectedModel === 'headshot' && headshotImage && Array.isArray(generatedImages) && generatedImages[0]) {
      return true;
    }
    if (selectedModel === 'restore-image' && restoreImage && Array.isArray(generatedImages) && generatedImages[0]) {
      return true;
    }
    if (selectedModel === 'gfp-restore' && gfpRestoreImage && Array.isArray(generatedImages) && generatedImages[0]) {
      return true;
    }
    if (selectedModel === 'home-designer' && homeDesignerImage && Array.isArray(generatedImages) && generatedImages[0]) {
      return true;
    }
    if (selectedModel === 'background-removal' && backgroundRemovalImage && Array.isArray(generatedImages) && generatedImages[0]) {
      return true;
    }
    if (selectedModel === 'remove-object' && removeObjectImage && Array.isArray(generatedImages) && generatedImages[0]) {
      return true;
    }
    if (selectedModel === 're-imagine' && reimagineImage && Array.isArray(generatedImages) && generatedImages[0]) {
      return true;
    }
    // For edit-image model, check if we have uploaded image and generated result
    if (selectedModel === 'edit-image' && editImage && Array.isArray(generatedImages) && generatedImages[0]) {
      return true;
    }
    // For upscale-image model, check if we have uploaded image and generated result
    if (selectedModel === 'upscale-image' && upscaleImage && Array.isArray(generatedImages) && generatedImages[0]) {
      return true;
    }
    // For generate-image model, check if we have at least 2 generated images
    if (selectedModel === 'generate-image' && Array.isArray(generatedImages) && generatedImages.filter(img => img !== null).length >= 2) {
      return true;
    }
    return false;
  };

  const getComparisonLabels = () => {
    if (selectedModel === 'hair-style') {
      return { before: 'Original', after: 'New Hair Style' };
    } else if (selectedModel === 'text-removal') {
      return { before: 'With Text', after: 'Text Removed' };
    } else if (selectedModel === 'headshot') {
      return { before: 'Original', after: 'Professional Headshot' };
    } else if (selectedModel === 'restore-image') {
      return { before: 'Original', after: 'Restored' };
    } else if (selectedModel === 'gfp-restore') {
      return { before: 'Original', after: 'GFP Restored' };
    } else if (selectedModel === 'home-designer') {
      return { before: 'Original Room', after: 'Redesigned Room' };
    } else if (selectedModel === 'background-removal') {
      return { before: 'With Background', after: 'Background Removed' };
    } else if (selectedModel === 'remove-object') {
      return { before: 'With Objects', after: 'Objects Removed' };
    } else if (selectedModel === 're-imagine') {
      return { before: 'Original', after: 'Reimagined' };
    } else if (selectedModel === 'combine-image') {
      return { before: 'Input Image', after: 'Combined Result' };
    } else if (selectedModel === 'edit-image') {
      return { before: 'Original', after: 'Edited' };
    } else if (selectedModel === 'generate-image') {
      return { before: 'Generated Image 1', after: 'Generated Image 2' };
    } else if (selectedModel === 'upscale-image') {
      return { before: 'Original', after: 'Upscaled' };
    }
    return { before: 'Before', after: 'After' };
  };

  // Helper function to generate meaningful prompt/description based on model configuration
  const generateModelPrompt = (model, currentState, userPrompt) => {
    // If user provided a prompt, use it
    if (userPrompt && userPrompt.trim()) {
      return userPrompt.trim();
    }

    // Generate prompt based on model configuration
    switch (model) {
      case 'hair-style':
        const hairParts = [];
        if (currentState.selectedHairStyle && currentState.selectedHairStyle !== 'No change') {
          hairParts.push(`${currentState.selectedHairStyle} hairstyle`);
        }
        if (currentState.selectedHairColor && currentState.selectedHairColor !== 'No change') {
          hairParts.push(`${currentState.selectedHairColor.toLowerCase()} hair color`);
        }
        if (currentState.selectedGender && currentState.selectedGender !== 'None') {
          hairParts.push(`${currentState.selectedGender.toLowerCase()} styling`);
        }
        return hairParts.length > 0 ? hairParts.join(', ') : 'Hair style transformation';

      case 'headshot':
        const headshotParts = [];
        if (currentState.selectedHeadshotBackground && currentState.selectedHeadshotBackground !== 'None') {
          headshotParts.push(`${currentState.selectedHeadshotBackground.toLowerCase()} background`);
        }
        if (currentState.selectedHeadshotGender && currentState.selectedHeadshotGender !== 'None') {
          headshotParts.push(`${currentState.selectedHeadshotGender.toLowerCase()} professional headshot`);
        }
        return headshotParts.length > 0 ? headshotParts.join(', ') : 'Professional headshot';

      case 'reimagine':
        const reimagineParts = [];
        if (currentState.selectedScenario && currentState.selectedScenario !== 'Random') {
          reimagineParts.push(currentState.selectedScenario);
        }
        if (currentState.selectedReimagineGender && currentState.selectedReimagineGender !== 'None') {
          reimagineParts.push(`${currentState.selectedReimagineGender.toLowerCase()} scenario`);
        }
        return reimagineParts.length > 0 ? reimagineParts.join(', ') : 'Reimagined scenario';

      case 'text-removal':
        return 'Text and watermark removal';

      case 'restore-image':
        return 'Image restoration and enhancement';

      case 'combine-image':
        return userPrompt && userPrompt.trim() ? userPrompt.trim() : 'Combined image creation';

      case 'generate-image':
        return userPrompt && userPrompt.trim() ? userPrompt.trim() : 'AI generated image';

      default:
        return 'AI image transformation';
    }
  };

  // Handle image publishing
  const handlePublishImage = async ({ imageUrl, imageIndex, title, description }) => {
    try {
      // Get current state for input images and model parameters
      const currentState = {
        uploadedImage,
        combineImage1,
        combineImage2,
        textRemovalImage,
        // cartoonifyImage,
        headshotImage,
        restoreImage,
        gfpRestoreImage,
        homeDesignerImage,
        backgroundRemovalImage,
        removeObjectImage,
        removeObjectMask,
        reimagineImage,
        selectedHairStyle,
        selectedHairColor,
        selectedGender,
        selectedHeadshotGender,
        selectedHeadshotBackground,
        selectedReimagineGender,
        selectedScenario,
        aspectRatio
      };

      // Collect input images based on model type
      const inputImages = getModelInputImages(selectedModel, currentState);

      // Collect model parameters
      const modelParams = getModelParameters(selectedModel, currentState);

      // Generate meaningful prompt based on model configuration
      const generatedPrompt = generateModelPrompt(selectedModel, currentState, inputPrompt);



      // Publish the image
      const response = await fetch('/api/images/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outputImage: imageUrl,
          inputImages,
          model: selectedModel,
          title,
          prompt: generatedPrompt,
          modelParams,
          aspectRatio
        })
      });

      if (response.ok) {
        const result = await response.json();
        enqueueSnackbar('🎉 Image published to community successfully!', { variant: 'success' });

        // Refresh community images to show the newly published image
        if (exampleMasonryRef.current) {
          exampleMasonryRef.current.refreshCommunity();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish image');
      }

    } catch (error) {
      console.error('Publish error:', error);
      enqueueSnackbar(`Failed to publish image: ${error.message}`, { variant: 'error' });
    }
  };



  // Function to generate dynamic SEO data based on selected model
  const generateModelSEO = (model) => {
    const seoData = {
      'generate-image': {
        title: 'AI Image Generator - Create Stunning Images with AI | PicFix.AI',
        description: 'Generate beautiful, high-quality images from text descriptions using our advanced AI. Create art, landscapes, portraits, and more with just a prompt. Best free AI photo editor online for AI image editing and AI photo editing.',
        keywords: 'AI image generator, text to image, AI art generator, image creation, AI picture generator, free AI art, generate images from text, AI image maker, artificial intelligence art, creative AI tool, AI photo editing, AI image editing, best free photo editor online',
        ogTitle: 'AI Image Generator - Create Stunning Images with AI',
        ogDescription: 'Generate beautiful images from text using advanced AI technology. Best free AI photo editor online for AI image editing.',
        structuredData: {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "AI Image Generator",
          "applicationCategory": "MultimediaApplication",
          "description": "AI-powered image generation tool that creates high-quality images from text descriptions"
        }
      },
      'edit-image': {
        title: 'AI Image Editor - Edit Images with AI | PicFix.AI',
        description: 'Edit images with AI technology. Transform your photos with different styles, colors, and effects. AI image editing tool for professional photo editing. Fix photo online with our AI photo editing tool.',
        keywords: 'AI image editor, edit images, AI photo editing, photo editing tool, AI image transformation, photo editing tool, AI photo editing, best free photo editor online',
        ogTitle: 'AI Image Editor - Edit Images with AI',
        ogDescription: 'Edit images with AI technology. AI image editing tool for professional photo editing.',
        structuredData: {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "AI Image Editor",
          "applicationCategory": "MultimediaApplication",
          "description": "AI-powered tool for editing images with different styles, colors, and effects"
        }
      },
      'hair-style': {
        title: 'AI Hair Style - Transform Hair Styles & Colors | PicFix.AI',
        description: 'Change hair styles and colors with AI technology. Transform your look with different hairstyles, colors, and cuts. AI face photo editing tool for professional hair editing. Fix photo online with our AI photo editing tool.',
        keywords: 'hair style changer, AI hair color, hair style editor, change hair style, hair color changer, AI hair transformation, virtual hair try on, hair style app, photo hair editor, AI face photo editing tool, fix photo online, AI photo editing',
        ogTitle: 'AI Hair Style - Transform Hair Styles & Colors',
        ogDescription: 'Change hair styles and colors with AI technology. AI face photo editing tool for professional hair editing.',
        structuredData: {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "AI Hair Style",
          "applicationCategory": "MultimediaApplication",
          "description": "AI-powered tool for changing hair styles and colors in photos"
        }
      },
      'headshot': {
        title: 'Professional Headshot - AI Portrait Creator | PicFix.AI',
        description: 'Create professional headshots with AI technology. Transform casual photos into polished, business-ready portraits. Perfect for LinkedIn, resumes, and professional profiles. AI face photo editing tool for business portraits. Fix photo online with our AI photo editing.',
        keywords: 'professional headshot, AI portrait, business headshot, LinkedIn photo, resume photo, professional photo, AI headshot generator, portrait creator, business portrait, AI face photo editing tool, fix photo online, AI photo editing',
        ogTitle: 'Professional Headshot - AI Portrait Creator',
        ogDescription: 'Create professional headshots with AI technology. AI face photo editing tool for business portraits.',
        structuredData: {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Professional Headshot ",
          "applicationCategory": "MultimediaApplication",
          "description": "AI-powered tool for creating professional headshots and business portraits"
        }
      },
      'restore-image': {
        title: 'Photo Restoration AI - Restore Old & Damaged Photos | PicFix.AI',
        description: 'Restore old, damaged, and faded photos with AI technology. Bring back memories with our advanced photo restoration tool. Fix photo online with AI tool to fix blurry photos. Best free photo editor online for photo restoration.',
        keywords: 'photo restoration, restore old photos, AI photo restoration, fix damaged photos, photo repair, old photo restoration, AI photo fix, restore faded photos, photo enhancement, fix photo online, AI tool to fix blurry photos, best free photo editor online',
        ogTitle: 'Photo Restoration AI - Restore Old & Damaged Photos',
        ogDescription: 'Restore old, damaged, and faded photos with AI technology. Fix photo online with AI tool to fix blurry photos.',
        structuredData: {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Photo Restoration AI",
          "applicationCategory": "MultimediaApplication",
          "description": "AI-powered tool for restoring old, damaged, and faded photographs"
        }
      },
      'gfp-restore': {
        title: 'Free Photo Restoration - AI Image Enhancement | PicFix.AI',
        description: 'Free AI photo restoration tool. Enhance image quality, fix blurry photos, and restore old images. No registration required - restore photos instantly. Fix photo online with AI tool to fix blurry photos. Best free photo editor online.',
        keywords: 'free photo restoration, AI image enhancement, free photo fix, blurry photo fix, image quality improvement, free AI tool, photo restoration free, enhance photos online, fix photo online, AI tool to fix blurry photos, best free photo editor online',
        ogTitle: 'Free Photo Restoration - AI Image Enhancement',
        ogDescription: 'Free AI photo restoration tool. Fix photo online with AI tool to fix blurry photos.',
        structuredData: {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Free Photo Restoration",
          "applicationCategory": "MultimediaApplication",
          "description": "Free AI-powered tool for photo restoration and image enhancement"
        }
      },
      'background-removal': {
        title: 'Background Removal Tool - Remove Image Backgrounds | PicFix.AI',
        description: 'Remove backgrounds from images instantly with AI technology. Free background removal tool for product photos, portraits, and any image. Download transparent PNG images. Remove background online free AI. Best free photo editor online.',
        keywords: 'background removal, remove background, AI background remover, transparent background, product photo editor, remove image background, background remover free, PNG background removal, remove background online free AI, best free photo editor online',
        ogTitle: 'Background Removal Tool - Remove Image Backgrounds',
        ogDescription: 'Remove backgrounds from images instantly with AI technology. Remove background online free AI.',
        structuredData: {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Background Removal Tool",
          "applicationCategory": "MultimediaApplication",
          "description": "AI-powered tool for removing backgrounds from images with instant results"
        }
      },
      'remove-object': {
        title: 'Object Removal Tool - Remove Unwanted Objects from Photos | PicFix.AI',
        description: 'Remove unwanted objects from photos with AI technology. Clean up images by removing people, objects, and distractions. Professional photo editing tool. Fix photo online with AI photo editing.',
        keywords: 'object removal, remove objects from photos, AI object remover, photo cleanup, remove people from photos, remove distractions, photo editing tool, AI photo cleaner, fix photo online, AI photo editing',
        ogTitle: 'Object Removal Tool - Remove Unwanted Objects from Photos',
        ogDescription: 'Remove unwanted objects from photos with AI technology. Fix photo online with AI photo editing.',
        structuredData: {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Object Removal Tool",
          "applicationCategory": "MultimediaApplication",
          "description": "AI-powered tool for removing unwanted objects and distractions from photos"
        }
      },
      'combine-image': {
        title: 'Image Combiner AI - Merge & Blend Images | PicFix.AI',
        description: 'Combine and merge multiple images with AI technology. Blend photos seamlessly, create composites, and merge images naturally. Advanced image combination tool. Fix photo online with AI image editing.',
        keywords: 'image combiner, merge images, blend photos, combine photos, AI image merger, photo composite, image blending, merge multiple images, photo combination tool, fix photo online, AI image editing',
        ogTitle: 'Image Combiner AI - Merge & Blend Images',
        ogDescription: 'Combine and merge multiple images with AI technology. Fix photo online with AI image editing.',
        structuredData: {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Image Combiner AI",
          "applicationCategory": "MultimediaApplication",
          "description": "AI-powered tool for combining and merging multiple images seamlessly"
        }
      },
      'text-removal': {
        title: 'Watermark & Text Removal Tool - Clean Images | PicFix.AI',
        description: 'Remove watermarks, text, and unwanted elements from images with AI. Clean up photos by removing logos, signatures, and text overlays. Professional image cleaning tool. Online photo fixer no watermark. Fix photo online with AI photo editing.',
        keywords: 'watermark removal, text removal, remove watermarks, AI text remover, clean images, remove logos, remove signatures, image cleaning tool, watermark remover, online photo fixer no watermark, fix photo online, AI photo editing',
        ogTitle: 'Watermark & Text Removal Tool - Clean Images',
        ogDescription: 'Remove watermarks, text, and unwanted elements from images with AI. Online photo fixer no watermark.',
        structuredData: {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Watermark & Text Removal Tool",
          "applicationCategory": "MultimediaApplication",
          "description": "AI-powered tool for removing watermarks, text, and unwanted elements from images"
        }
      },
      're-imagine': {
        title: 'Re-imagine AI - Transform Photos with AI Scenarios | PicFix.AI',
        description: 'Re-imagine yourself in different scenarios with AI technology. Transform photos into space adventures, underwater scenes, and fantasy scenarios. Creative AI photo transformation. Fix photo online with AI photo editing.',
        keywords: 're-imagine AI, photo transformation, AI scenarios, fantasy photos, space photos, underwater photos, creative AI, photo reimagining, AI photo effects, scenario transformation, fix photo online, AI photo editing',
        ogTitle: 'Re-imagine AI - Transform Photos with AI Scenarios',
        ogDescription: 'Re-imagine yourself in different scenarios with AI technology. Fix photo online with AI photo editing.',
        structuredData: {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Re-imagine AI",
          "applicationCategory": "MultimediaApplication",
          "description": "AI-powered tool for transforming photos into different scenarios and fantasy environments"
        }
      },
      'home-designer': {
        title: 'AI Home Designer - Interior Design with AI | PicFix.AI',
        description: 'Design your dream home with AI technology. Transform room photos with different interior design styles. Free AI home makeover tool for interior designers and homeowners. Best free photo editor online for AI photo editing.',
        keywords: 'AI home designer, interior design AI, home makeover, room design, AI interior designer, home renovation, interior design tool, AI home decor, room transformation, best free photo editor online, AI photo editing',
        ogTitle: 'AI Home Designer - Interior Design with AI',
        ogDescription: 'Design your dream home with AI technology. Best free photo editor online for AI photo editing.',
        structuredData: {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "AI Home Designer",
          "applicationCategory": "MultimediaApplication",
          "description": "AI-powered tool for interior design and home makeover visualization"
        }
      },
      'upscale-image': {
        title: 'AI Image Upscaler - Enhance Images with AI | PicFix.AI',
        description: 'Enhance images with AI technology. Upscale low-resolution photos to high-quality images. AI image upscaler tool for professional photo editing. Fix photo online with our AI photo editing tool.',
        keywords: 'AI image upscaler, image enhancement, AI image enhancer, photo upscaler, image upscaler, AI image enhancer tool, photo enhancement, fix photo online, AI photo editing',
        ogTitle: 'AI Image Upscaler - Enhance Images with AI',
        ogDescription: 'Enhance images with AI technology. AI image upscaler tool for professional photo editing.',
        structuredData: {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "AI Image Upscaler",
          "applicationCategory": "MultimediaApplication",
          "description": "AI-powered tool for enhancing images with different styles, colors, and effects"
        }
      },
      'generate-video': {
        title: 'AI Video Generator - Create Videos from Images | PicFix.AI',
        description: 'Generate stunning videos from images using advanced AI technology. Transform your photos into dynamic videos with motion and effects. Create engaging video content from static images.',
        keywords: 'AI video generator, image to video, video from image, AI video creation, photo to video, video generator, AI video maker, image animation, video creation tool',
        ogTitle: 'AI Video Generator - Create Videos from Images',
        ogDescription: 'Generate stunning videos from images using advanced AI technology. Transform your photos into dynamic videos.',
        structuredData: {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "AI Video Generator",
          "applicationCategory": "MultimediaApplication",
          "description": "AI-powered tool for generating videos from images with motion and effects"
        }
      }
    };

    return seoData[model] || seoData['generate-image'];
  };

  // Get current SEO data based on selected model
  const currentSEO = generateModelSEO(selectedModel);

  // Update page title when model changes
  useEffect(() => {
    if (currentSEO && currentSEO.title) {
      document.title = currentSEO.title;
    }
  }, [selectedModel, currentSEO]);

  return (
    <>
      <Head>
        {/* Primary Meta Tags */}
        <title>{currentSEO.title}</title>
        <meta name="title" content={currentSEO.title} />
        <meta name="description" content={currentSEO.description} />
        <meta name="keywords" content={currentSEO.keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="language" content="English" />
        <meta name="author" content="PicFix.AI" />
        <meta name="copyright" content="© 2024 PicFix.AI. All rights reserved." />
        <meta name="rating" content="General" />
        <meta name="distribution" content="Global" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="PicFix.AI" />
        <meta property="og:title" content={currentSEO.ogTitle} />
        <meta property="og:description" content={currentSEO.ogDescription} />
        <meta property="og:url" content={`https://www.picfix.ai/ai-image-editor?model=${selectedModel}`} />
        <meta property="og:image" content="https://www.picfix.ai/assets/PicFixAILogo.jpg" />
        <meta property="og:image:alt" content="PicFix.AI - AI Image Editor" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@PicFixAI" />
        <meta name="twitter:creator" content="@PicFixAI" />
        <meta name="twitter:title" content={currentSEO.ogTitle} />
        <meta name="twitter:description" content={currentSEO.ogDescription} />
        <meta name="twitter:image" content="https://www.picfix.ai/assets/PicFixAILogo.jpg" />
        <meta name="twitter:image:alt" content="PicFix.AI - AI Image Editor" />

        {/* Additional SEO Meta Tags */}
        <meta name="theme-color" content="#3a1c71" />
        <meta name="msapplication-TileColor" content="#3a1c71" />
        <meta name="application-name" content="PicFix.AI" />
        <meta name="apple-mobile-web-app-title" content="PicFix.AI" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Canonical URL */}
        <link rel="canonical" href={`https://www.picfix.ai/ai-image-editor?model=${selectedModel}`} />

        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/assets/PicFixAILogo.jpg" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Preconnect for Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://picfixcdn.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* Structured Data - SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(currentSEO.structuredData)
          }}
        />

        {/* Structured Data - BreadcrumbList */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://www.picfix.ai"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "AI Image Editor",
                  "item": "https://www.picfix.ai/ai-image-editor"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": currentSEO.structuredData.name,
                  "item": `https://www.picfix.ai/ai-image-editor?model=${selectedModel}`
                }
              ]
            })
          }}
        />
      </Head>

      <StyledPaper elevation={0} sx={{ paddingTop: isMobile ? '70px' : '0px' }}>
        {/* <MenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </MenuButton> */}

        <Box sx={{ display: 'flex', height: '100%', width: '100%', position: 'relative', mt: isMobile ? '0px' : '0px' }}>
          {/* Overlay for mobile */}
          {/* {mobileMenuOpen && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 999,
                display: { xs: 'block', md: 'none' },
              }}
              onClick={() => setMobileMenuOpen(false)}
            />
          )} */}

          {!isMobile && <SidePanel
            editImageModels={editImageModels || []}
            generateImageModels={generateImageModels || []}
            combineImageModels={combineImageModels || []}
            upscaleImageModels={upscaleImageModels || []}
            restoreImageModels={restoreImageModels || []}
            handleSwitchModel={handleSwitchModel}
            switchedModel={switchedModel}
            setSwitchedModel={setSwitchedModel}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            handleModelChange={handleModelChange}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            selectedHairColor={selectedHairColor}
            setSelectedHairColor={setSelectedHairColor}
            selectedGender={selectedGender}
            setSelectedGender={setSelectedGender}
            selectedHeadshotGender={selectedHeadshotGender}
            setSelectedHeadshotGender={setSelectedHeadshotGender}
            selectedHeadshotBackground={selectedHeadshotBackground}
            setSelectedHeadshotBackground={setSelectedHeadshotBackground}
            selectedReimagineGender={selectedReimagineGender}
            setSelectedReimagineGender={setSelectedReimagineGender}
            selectedScenario={selectedScenario}
            setSelectedScenario={setSelectedScenario}
            numOutputs={numOutputs}
            setNumOutputs={setNumOutputs}
            generatedImages={generatedImages}
            setGeneratedImages={setGeneratedImages}
            isLoading={isLoading}
            context={context}
            generateHairStyleImages={generateHairStyleImages}
            generateTextRemovalImage={generateTextRemovalImage}
            generateHeadshotImage={generateHeadshotImage}
            generateRestoreImage={generateRestoreImage}
            generateGfpRestoreImage={generateGfpRestoreImage}
            generateHomeDesignerImage={generateHomeDesignerImage}
            generateBackgroundRemovalImage={generateBackgroundRemovalImage}
            generateRemoveObjectImage={generateRemoveObjectImage}
            generateReimagineImage={generateReimagineImage}
            generateCombineImages={generateCombineImages}
            generateUpscaleImage={generateUpscaleImage}
            generateFluxImages={generateFluxImages}
            uploadedImageUrl={uploadedImageUrl}
            textRemovalImageUrl={textRemovalImageUrl}
            cartoonifyImageUrl={cartoonifyImageUrl}
            headshotImageUrl={headshotImageUrl}
            restoreImageUrl={restoreImageUrl}
            gfpRestoreImageUrl={gfpRestoreImageUrl}
            homeDesignerImageUrl={homeDesignerImageUrl}
            backgroundRemovalImage={backgroundRemovalImage}
            backgroundRemovalStatus={backgroundRemovalStatus}
            removeObjectImageUrl={removeObjectImageUrl}
            reimagineImageUrl={reimagineImageUrl}
            combineImage1Url={combineImage1Url}
            combineImage2Url={combineImage2Url}
            inputPrompt={inputPrompt}
            hasMaskDrawn={hasMaskDrawn}
            upscaleImageUrl={upscaleImageUrl}
            // Video generation props
            selectedVideoModel={selectedVideoModel}
            setSelectedVideoModel={setSelectedVideoModel}
            videoDuration={videoDuration}
            setVideoDuration={setVideoDuration}
            videoStartImageUrl={videoStartImageUrl}
            generateVideo={generateVideo}
            videoJobs={videoJobs}
            loadingVideoJobs={loadingVideoJobs}
            checkVideoStatus={checkVideoStatus}
          />
          }

          {/* Main Editor Area */}
          <MainEditor>
            {/* Dynamic H1 Heading with Model Name and Tagline */}
            <Box sx={{
              textAlign: 'center',
              // mb: 3,
              pt: 2,
              background: 'linear-gradient(135deg, rgba(58, 28, 113, 0.05) 0%, rgba(215, 109, 119, 0.05) 50%, rgba(255, 175, 123, 0.05) 100%)',
              borderRadius: 3,
              p: 3,
              border: '1px solid rgba(58, 28, 113, 0.1)'
            }}>
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontSize: { xs: '1.5rem', md: '2rem', lg: '2rem' },
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 1,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {currentSEO.structuredData.name}
              </Typography>
              <Typography
                variant="h6"
                component="p"
                sx={{
                  fontSize: { xs: '.8rem', md: '1rem' },
                  color: 'text.secondary',
                  fontWeight: 400,
                  maxWidth: '800px',
                  mx: 'auto',
                  lineHeight: 1.4,
                  opacity: 0.8
                }}
              >
                {currentSEO.description}
              </Typography>
            </Box>

            {/* Hair Style Scrollable Strip for Hair Style Model */}
            {isMobile && <Box sx={{}}>
              <SidePanel
                editImageModels={editImageModels || []}
                generateImageModels={generateImageModels || []}
                combineImageModels={combineImageModels || []}
                upscaleImageModels={upscaleImageModels || []}
                restoreImageModels={restoreImageModels || []}
                handleSwitchModel={handleSwitchModel}
                switchedModel={switchedModel}
                setSwitchedModel={setSwitchedModel}
                aspectRatio={aspectRatio}
                setAspectRatio={setAspectRatio}
                handleModelChange={handleModelChange}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                selectedHairColor={selectedHairColor}
                setSelectedHairColor={setSelectedHairColor}
                selectedGender={selectedGender}
                setSelectedGender={setSelectedGender}
                selectedHeadshotGender={selectedHeadshotGender}
                setSelectedHeadshotGender={setSelectedHeadshotGender}
                selectedHeadshotBackground={selectedHeadshotBackground}
                setSelectedHeadshotBackground={setSelectedHeadshotBackground}
                selectedReimagineGender={selectedReimagineGender}
                setSelectedReimagineGender={setSelectedReimagineGender}
                selectedScenario={selectedScenario}
                setSelectedScenario={setSelectedScenario}
                numOutputs={numOutputs}
                setNumOutputs={setNumOutputs}
                generatedImages={generatedImages}
                setGeneratedImages={setGeneratedImages}
                isLoading={isLoading}
                context={context}
                generateHairStyleImages={generateHairStyleImages}
                generateTextRemovalImage={generateTextRemovalImage}
                generateHeadshotImage={generateHeadshotImage}
                generateRestoreImage={generateRestoreImage}
                generateGfpRestoreImage={generateGfpRestoreImage}
                generateHomeDesignerImage={generateHomeDesignerImage}
                generateBackgroundRemovalImage={generateBackgroundRemovalImage}
                generateRemoveObjectImage={generateRemoveObjectImage}
                generateReimagineImage={generateReimagineImage}
                generateCombineImages={generateCombineImages}
                generateUpscaleImage={generateUpscaleImage}
                generateFluxImages={generateFluxImages}
                uploadedImageUrl={uploadedImageUrl}
                textRemovalImageUrl={textRemovalImageUrl}
                cartoonifyImageUrl={cartoonifyImageUrl}
                headshotImageUrl={headshotImageUrl}
                restoreImageUrl={restoreImageUrl}
                gfpRestoreImageUrl={gfpRestoreImageUrl}
                homeDesignerImageUrl={homeDesignerImageUrl}
                backgroundRemovalImage={backgroundRemovalImage}
                backgroundRemovalStatus={backgroundRemovalStatus}
                removeObjectImageUrl={removeObjectImageUrl}
                reimagineImageUrl={reimagineImageUrl}
                combineImage1Url={combineImage1Url}
                combineImage2Url={combineImage2Url}
                inputPrompt={inputPrompt}
                hasMaskDrawn={hasMaskDrawn}
                upscaleImageUrl={upscaleImageUrl}
              />
            </Box>
            }
            {selectedModel === 'hair-style' ? (
              <Box>
                <Box
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  {/* Hair Style Strip */}
                  {(selectedGender === "Male" || selectedGender === "Female") ? (
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        overflowX: 'auto',
                        pb: 1,
                        px: 1,
                        scrollBehavior: 'smooth',
                        '&::-webkit-scrollbar': {
                          height: 8,
                        },
                        '&::-webkit-scrollbar-track': {
                          backgroundColor: alpha(theme.palette.grey[300], 0.3),
                          borderRadius: 4,
                        },
                        '&::-webkit-scrollbar-thumb': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.6),
                          borderRadius: 4,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.8),
                          },
                        },
                        // For Firefox
                        scrollbarWidth: 'thin',
                        scrollbarColor: `${alpha(theme.palette.primary.main, 0.6)} ${alpha(theme.palette.grey[300], 0.3)}`,
                      }}
                    >
                      {getAllStyleItems().map((style) => (
                        <AppStyleCard
                          key={style.id}
                          onClick={() => setSelectedHairStyle(style.name)}
                          sx={{
                            minWidth: 80,
                            flexShrink: 0,
                            userSelect: 'none', // Prevent text selection when dragging
                          }}
                        >
                          <AppStyleIcon className={selectedHairStyle === style.name ? 'selected' : ''}>
                            <img
                              src={style.image}
                              alt={style.name}
                              height={100}
                              width={100}
                              draggable={false} // Prevent image drag
                            />
                          </AppStyleIcon>
                          <AppStyleLabel>{style.name}</AppStyleLabel>
                        </AppStyleCard>
                      ))}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        py: 4,
                        px: 2,
                        backgroundColor: alpha(theme.palette.info.main, 0.1),
                        borderRadius: 2,
                        border: `1px dashed ${alpha(theme.palette.info.main, 0.3)}`,
                      }}
                    >
                      <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
                        Please select a gender from the sidebar to view available hair styles
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            ) : (
              /* Styles Grid for other models */
              <>
                {currentConfig.type === 'styles' ? (
                  <Box>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                        gap: 3,
                        padding: 2,
                        backgroundColor: alpha(theme.palette.background.paper, 0.5),
                        borderRadius: 2,
                      }}
                    >
                      {currentConfig.styles.map((style) => (
                        <AppStyleCard key={style.id} onClick={() => handleStyleSelect(style)}>
                          <AppStyleIcon className={selectedStyles.some(s => s.id === style.id) ? 'selected' : ''}>
                            <img src={style.image} alt={style.name} />
                          </AppStyleIcon>
                          <AppStyleLabel>{style.name}</AppStyleLabel>
                        </AppStyleCard>
                      ))}
                    </Box>
                  </Box>
                ) : currentConfig.type === 'text-removal' || currentConfig.type === 'headshot' || currentConfig.type === 'restore-image' || currentConfig.type === 'reimagine' ? (
                  // Don't show anything for text-removal, headshot, restore-image, or reimagine type
                  null
                ) : (
                  <Box>

                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        padding: 1,
                        borderRadius: 2,
                      }}
                    >
                      {currentConfig.options && currentConfig.options.map((option, index) => (
                        <Button
                          key={index}
                          variant={
                            (currentConfig.type === 'prompts' || currentConfig.type === 'edit-image')
                              ? (inputPrompt === option ? "contained" : "outlined")
                              : (selectedItems.includes(option) ? "contained" : "outlined")
                          }
                          onClick={() => handleChipClick(option)}
                          sx={{
                            borderRadius: '50px',
                            textTransform: 'none',
                            padding: '4px 14px',
                            fontSize: '12px',
                            fontWeight: 400,
                            borderColor:
                              (currentConfig.type === 'prompts' || currentConfig.type === 'edit-image')
                                ? (inputPrompt === option ? 'transparent' : alpha(theme.palette.divider, 0.5))
                                : (selectedItems.includes(option) ? 'transparent' : alpha(theme.palette.divider, 0.5)),
                            backgroundColor:
                              (currentConfig.type === 'prompts' || currentConfig.type === 'edit-image')
                                ? (inputPrompt === option ? theme.palette.primary.main : 'transparent')
                                : (selectedItems.includes(option) ? theme.palette.primary.main : 'transparent'),
                            color:
                              (currentConfig.type === 'prompts' || currentConfig.type === 'edit-image')
                                ? (inputPrompt === option ? 'white' : theme.palette.text.primary)
                                : (selectedItems.includes(option) ? 'white' : theme.palette.text.primary),
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              backgroundColor:
                                (currentConfig.type === 'prompts' || currentConfig.type === 'edit-image')
                                  ? (inputPrompt === option ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.04))
                                  : (selectedItems.includes(option) ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.04)),
                            },
                            minWidth: 'auto',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {option}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                )}
              </>
            )}

            {/* Input Section - Only show for models that need prompts */}
            {selectedModel !== 'hair-style' && selectedModel !== 'text-removal' && selectedModel !== 'headshot' && selectedModel !== 'restore-image' && selectedModel !== 'gfp-restore' && selectedModel !== 'background-removal' && selectedModel !== 'remove-object' && selectedModel !== 're-imagine' && selectedModel !== 'upscale-image' && selectedModel !== 'generate-video' && (
              <Box ref={inputSectionRef} sx={{ position: 'relative' }}>
                <StyledTextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Enter your creative prompt here..."
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end" sx={{ alignSelf: 'flex-end', mb: 1 }}>
                        {selectedModel !== 'generate-image' && (
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="prompt-image-upload"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                const file = e.target.files[0];
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const emptyIndex = generatedImages.findIndex(img => img === null);
                                  if (emptyIndex !== -1) {
                                    const newImages = [...generatedImages];
                                    newImages[emptyIndex] = event.target.result;
                                    setGeneratedImages(newImages);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        )}
                        <IconButton
                          onClick={selectedModel === 'hair-style' ? generateHairStyleImages :
                            selectedModel === 'text-removal' ? generateTextRemovalImage :
                              selectedModel === 'home-designer' ? generateHomeDesignerImage :
                                selectedModel === 'background-removal' ? generateBackgroundRemovalImage :
                                  selectedModel === 'remove-object' ? generateRemoveObjectImage :
                                    selectedModel === 'combine-image' ? generateCombineImages :
                                      selectedModel === 'edit-image' ? generateEditImage :
                                        selectedModel === 'upscale-image' ? generateUpscaleImage :
                                          generateFluxImages}
                          disabled={isLoading ||
                            (selectedModel === 'text-removal' ? !textRemovalImageUrl :
                              selectedModel === 'home-designer' ? (!homeDesignerImageUrl || !inputPrompt.trim()) :
                                selectedModel === 'background-removal' ? (!backgroundRemovalImage || backgroundRemovalStatus !== 'Ready') :
                                  selectedModel === 'remove-object' ? (!removeObjectImageUrl || !hasMaskDrawn) :
                                    selectedModel === 'combine-image' ? (
                                      (switchedModel === 'nano-banana' || switchedModel === 'seedream-4' || switchedModel === 'pruna-ai') ?
                                        (combineImageUrls.filter(url => url !== null).length < 2 || !inputPrompt.trim()) :
                                        (!combineImage1Url || !combineImage2Url || !inputPrompt.trim())
                                    ) :
                                      selectedModel === 'edit-image' ? (!editImageUrl || !inputPrompt.trim()) :
                                        selectedModel === 'upscale-image' ? !upscaleImageUrl :
                                          !inputPrompt.trim())}
                          sx={{
                            padding: 0.7,
                            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                            color: 'white',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
                              transform: 'scale(1.1)',
                            },
                            '&.Mui-disabled': {
                              background: alpha(theme.palette.action.disabled, 0.12),
                              color: alpha(theme.palette.action.disabled, 0.26),
                            },
                            transition: 'all 0.3s ease',
                          }}
                          title={
                            selectedModel === 'generate-image'
                              ? `Generate ${numOutputs} image${numOutputs > 1 ? 's' : ''} (${(currentConfig.creditCost || 0) * numOutputs} credits)`
                              : `Generate ${currentConfig.name || 'Image'} (${currentConfig.creditCost || 0} credits)`
                          }
                        >
                          <SendIcon sx={{ fontSize: '18px' }} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            )}
            {/* Selected Items */}
            {currentConfig.type === 'styles' && selectedItems.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: theme.palette.text.secondary }}>
                  Selected Styles
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedItems.map((item, index) => (
                    <Chip
                      key={index}
                      label={item}
                      onDelete={() => handleChipDelete(item)}
                      color="primary"
                      size="small"
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        '& .MuiChip-deleteIcon': {
                          color: 'rgba(255,255,255,0.7)',
                          '&:hover': {
                            color: 'white',
                          },
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Hair Style Specific Controls */}
            {selectedModel === 'hair-style' && (
              <>
                {/* Image Upload Section */}
                <ImageUploader
                  title="Upload Image"
                  uploadedImage={uploadedImage}
                  uploadingImage={uploadingHairImage}
                  height="120px"
                  placeholderText="Click to upload image"
                  onImageUpload={async (e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64Data = event.target.result;
                        setUploadedImage(base64Data);

                        // Immediately upload to R2
                        setUploadingHairImage(true);
                        const url = await uploadImageToR2(base64Data, 'hair-style-input.jpg');
                        if (url) {
                          setUploadedImageUrl(url);

                        } else {
                          setUploadedImage(null); // Reset if upload failed
                        }
                        setUploadingHairImage(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onImageRemove={() => {
                    setUploadedImage(null);
                    setUploadedImageUrl(null);
                  }}
                  isDragging={isDragging}
                  isLoading={isLoading}
                  error={error}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                />

                {/* Generate Button for Hair Style */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={generateHairStyleImages}
                    disabled={!uploadedImageUrl || isLoading}
                    sx={{
                      py: .8,
                      px: 2,
                      borderRadius: 3,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '14px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      },
                      '&:disabled': {
                        background: '#e0e0e0',
                        color: '#9e9e9e'
                      }
                    }}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                  >
                    {isLoading ? 'Changing Hair Style...' : `Change Hair Style`}
                  </Button>
                </Box>

              </>
            )}

            {/* Text Removal Specific Controls */}
            {selectedModel === 'text-removal' && (
              <>
                {/* Image Upload Section */}
                <ImageUploader
                  title="Upload Image with Text to Remove"
                  uploadedImage={textRemovalImage}
                  uploadingImage={uploadingTextRemovalImage}
                  placeholderText="Click to upload an image with text to remove"
                  onImageUpload={async (e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64Data = event.target.result;
                        setTextRemovalImage(base64Data);

                        // Immediately upload to R2
                        setUploadingTextRemovalImage(true);
                        const url = await uploadImageToR2(base64Data, 'text-removal-input.jpg');
                        if (url) {
                          setTextRemovalImageUrl(url);

                        } else {
                          setTextRemovalImage(null); // Reset if upload failed
                        }
                        setUploadingTextRemovalImage(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onImageRemove={() => {
                    setTextRemovalImage(null);
                    setTextRemovalImageUrl(null);
                  }}
                  isDragging={isDragging}
                  isLoading={isLoading}
                  error={error}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                />

                {/* <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    This tool will automatically remove text from your image while preserving the background.
                  </Typography>
                </Box> */}

                {/* Generate Button for Text Removal */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={generateTextRemovalImage}
                    disabled={!textRemovalImageUrl || isLoading}
                    sx={{
                      py: .8,
                      px: 2,
                      borderRadius: 3,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '14px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      },
                      '&:disabled': {
                        background: '#e0e0e0',
                        color: '#9e9e9e'
                      }
                    }}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                  >
                    {isLoading ? 'Removing Text...' : `Remove Text`}
                  </Button>
                </Box>
              </>
            )}


            {/* Headshot Specific Controls */}
            {selectedModel === 'headshot' && (
              <>
                {/* Image Upload Section */}
                <ImageUploader
                  title="Upload Image for Professional Headshot"
                  uploadedImage={headshotImage}
                  uploadingImage={uploadingHeadshotImage}
                  placeholderText="Click to upload an image for professional headshot"
                  onImageUpload={async (e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64Data = event.target.result;
                        setHeadshotImage(base64Data);

                        // Immediately upload to R2
                        setUploadingHeadshotImage(true);
                        const url = await uploadImageToR2(base64Data, 'headshot-input.jpg');
                        if (url) {
                          setHeadshotImageUrl(url);

                        } else {
                          setHeadshotImage(null); // Reset if upload failed
                        }
                        setUploadingHeadshotImage(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onImageRemove={() => {
                    setHeadshotImage(null);
                    setHeadshotImageUrl(null);
                  }}
                  isDragging={isDragging}
                  isLoading={isLoading}
                  error={error}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                />

                {/* <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    This tool will transform your photo into a professional headshot with the selected background.
                  </Typography>
                </Box> */}

                {/* Generate Button for Headshot */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={generateHeadshotImage}
                    disabled={!headshotImageUrl || isLoading}
                    sx={{
                      py: .8,
                      px: 2,
                      borderRadius: 3,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '14px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      },
                      '&:disabled': {
                        background: '#e0e0e0',
                        color: '#9e9e9e'
                      }
                    }}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                  >
                    {isLoading ? 'Generating Headshot...' : `Generate Headshot`}
                  </Button>
                </Box>
              </>
            )}

            {/* Restore Image Specific Controls */}
            {selectedModel === 'restore-image' && (
              <>
                {/* Image Upload Section */}
                <ImageUploader
                  title="Upload Image to Restore"
                  uploadedImage={restoreImage}
                  uploadingImage={uploadingRestoreImage}
                  placeholderText="Click to upload an image to restore"
                  onImageUpload={async (e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64Data = event.target.result;
                        setRestoreImage(base64Data);

                        // Immediately upload to R2
                        setUploadingRestoreImage(true);
                        const url = await uploadImageToR2(base64Data, 'restore-input.jpg');
                        if (url) {
                          setRestoreImageUrl(url);

                        } else {
                          setRestoreImage(null); // Reset if upload failed
                        }
                        setUploadingRestoreImage(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onImageRemove={() => {
                    setRestoreImage(null);
                    setRestoreImageUrl(null);
                  }}
                  isDragging={isDragging}
                  isLoading={isLoading}
                  error={error}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                />

                {/* <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    This tool will restore your image to its original quality.
                  </Typography>
                </Box> */}

                {/* Generate Button for Restore Image */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={generateRestoreImage}
                    disabled={!restoreImageUrl || isLoading}
                    sx={{
                      py: .8,
                      px: 2,
                      borderRadius: 3,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '14px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      },
                      '&:disabled': {
                        background: '#e0e0e0',
                        color: '#9e9e9e'
                      }
                    }}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                  >
                    {isLoading ? 'Restoring Image...' : `Restore Image`}
                  </Button>
                </Box>
              </>
            )}

            {/* GFP Restore Specific Controls */}
            {selectedModel === 'gfp-restore' && (
              <>
                {/* Image Upload Section */}
                <ImageUploader
                  uploadedImage={gfpRestoreImage}
                  uploadingImage={uploadingGfpRestoreImage}
                  placeholderText="Click to upload an image to restore with  "
                  onImageUpload={async (e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64Data = event.target.result;
                        setGfpRestoreImage(base64Data);

                        // Immediately upload to R2
                        setUploadingGfpRestoreImage(true);
                        const url = await uploadImageToR2(base64Data, 'gfp-restore-input.jpg');
                        if (url) {
                          setGfpRestoreImageUrl(url);

                        } else {
                          setGfpRestoreImage(null); // Reset if upload failed
                        }
                        setUploadingGfpRestoreImage(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onImageRemove={() => {
                    setGfpRestoreImage(null);
                    setGfpRestoreImageUrl(null);
                  }}
                  isDragging={isDragging}
                  isLoading={isLoading}
                  error={error}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                />

                {/* <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    🎉 Free   restoration tool! Enhance your old or low-quality images without using credits.
                  </Typography>
                </Box> */}

                {/* Generate Button for GFP Restore */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={generateGfpRestoreImage}
                    disabled={!gfpRestoreImageUrl || isLoading}
                    sx={{
                      py: .8,
                      px: 2,
                      borderRadius: 3,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '14px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      },
                      '&:disabled': {
                        background: '#e0e0e0',
                        color: '#9e9e9e'
                      }
                    }}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                  >
                    {isLoading ? 'Restoring Image...' : `Restore Image`}
                  </Button>
                </Box>
              </>
            )}

            {/* Home Designer Specific Controls */}
            {selectedModel === 'home-designer' && (
              <>
                {/* Image Upload Section */}
                <ImageUploader
                  title="Upload Room Image"
                  uploadedImage={homeDesignerImage}
                  uploadingImage={uploadingHomeDesignerImage}
                  placeholderText="Click to upload a room image for interior design"
                  onImageUpload={async (e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64Data = event.target.result;
                        setHomeDesignerImage(base64Data);

                        // Immediately upload to R2
                        setUploadingHomeDesignerImage(true);
                        const url = await uploadImageToR2(base64Data, 'home-designer-input.jpg');
                        if (url) {
                          setHomeDesignerImageUrl(url);

                        } else {
                          setHomeDesignerImage(null); // Reset if upload failed
                        }
                        setUploadingHomeDesignerImage(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onImageRemove={() => {
                    setHomeDesignerImage(null);
                    setHomeDesignerImageUrl(null);
                  }}
                  isDragging={isDragging}
                  isLoading={isLoading}
                  error={error}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                />

                {/* <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Upload a room image and describe your desired interior design style. AI will redesign your space!
                  </Typography>
                </Box> */}
              </>
            )}

            {/* Background Removal Specific Controls */}
            {selectedModel === 'background-removal' && (
              <>
                {/* Image Upload Section */}
                <ImageUploader
                  title="Upload Image to Remove Background"
                  uploadedImage={backgroundRemovalImage}
                  uploadingImage={uploadingBackgroundRemovalImage}
                  placeholderText="Click to upload an image to remove background"
                  onImageUpload={async (e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64Data = event.target.result;
                        setBackgroundRemovalImage(base64Data);

                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onImageRemove={() => {
                    setBackgroundRemovalImage(null);
                  }}
                  isDragging={isDragging}
                  isLoading={isLoading}
                  error={error}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                />

                {/* <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Upload any image and our AI will automatically remove the background, leaving only the main subject. Processing happens locally in your browser.
                  </Typography>
                  {backgroundRemovalStatus !== 'Ready' && (
                    <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                      Status: {backgroundRemovalStatus}
                    </Typography>
                  )}
                </Box> */}

                {/* Generate Button for Background Removal */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      if (backgroundRemovalImage) {
                        setProcessingBackgroundRemoval(true);
                      }
                    }}
                    disabled={!backgroundRemovalImage || processingBackgroundRemoval || backgroundRemovalStatus !== 'Ready'}
                    sx={{
                      py: .8,
                      px: 2,
                      borderRadius: 3,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '14px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      },
                      '&:disabled': {
                        background: '#e0e0e0',
                        color: '#9e9e9e'
                      }
                    }}
                    startIcon={processingBackgroundRemoval ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                  >
                    {processingBackgroundRemoval ? 'Removing Background...' : `Remove Background`}
                  </Button>
                </Box>

                {/* Background Removal Processor - Hidden component that handles the processing */}
                {selectedModel === 'background-removal' && (
                  <BackgroundRemovalProcessor
                    inputImage={processingBackgroundRemoval ? backgroundRemovalImage : null}
                    onProcessingStart={handleBackgroundRemovalStart}
                    onProcessingComplete={handleBackgroundRemovalComplete}
                    onProcessingError={handleBackgroundRemovalError}
                    onStatusChange={handleBackgroundRemovalStatusChange}
                  />
                )}
              </>
            )}

            {/* Remove Object Specific Controls */}
            {selectedModel === 'remove-object' && (
              <>
                {/* Image Upload Section */}
                <ImageUploader
                  title="Upload Image for Object Removal"
                  uploadedImage={removeObjectImage}
                  uploadingImage={uploadingRemoveObjectImage}
                  placeholderText="Click to upload an image for object removal"
                  onImageUpload={async (e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64Data = event.target.result;
                        setRemoveObjectImage(base64Data);

                        // Immediately upload to R2
                        setUploadingRemoveObjectImage(true);
                        const url = await uploadImageToR2(base64Data, 'remove-object-input.jpg');
                        if (url) {
                          setRemoveObjectImageUrl(url);
                          // Scroll to mask editor after successful upload
                          setTimeout(() => {
                            scrollToMaskEditor();
                          }, 100);
                        } else {
                          setRemoveObjectImage(null); // Reset if upload failed
                        }
                        setUploadingRemoveObjectImage(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onImageRemove={() => {
                    setRemoveObjectImage(null);
                    setRemoveObjectImageUrl(null);
                    setRemoveObjectMask(null);
                    setHasMaskDrawn(false);
                  }}
                  isDragging={isDragging}
                  isLoading={isLoading}
                  error={error}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                />

                {/* Mask Editor - Only show when image is uploaded */}
                {removeObjectImage && (
                  <div ref={maskEditorRef}>
                    <ObjectRemovalMaskEditor
                      inputImage={removeObjectImage}
                      onMaskCreated={handleMaskCreated}
                      isLoading={isLoading}
                    />
                  </div>
                )}

                <Box sx={{ mt: 2 }}>
                  {/* <Typography variant="body2" color="textSecondary">
                    Upload an image and paint over the objects you want to remove. The AI will intelligently fill in the background.
                  </Typography> */}
                  {removeObjectImage && !hasMaskDrawn && (
                    <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                      Please paint over the objects you want to remove before processing.
                    </Typography>
                  )}
                </Box>

                {/* Generate Button for Remove Object */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={generateRemoveObjectImage}
                    disabled={!removeObjectImageUrl || !hasMaskDrawn || isLoading}
                    sx={{
                      py: .8,
                      px: 2,
                      borderRadius: 3,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '14px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      },
                      '&:disabled': {
                        background: '#e0e0e0',
                        color: '#9e9e9e'
                      }
                    }}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                  >
                    {isLoading ? 'Removing Objects...' : `Remove Objects`}
                  </Button>
                </Box>
              </>
            )}

            {/* ReImagine Specific Controls */}
            {selectedModel === 're-imagine' && (
              <>
                {/* Image Upload Section */}
                <ImageUploader
                  title="Upload Image for ReImagine"
                  uploadedImage={reimagineImage}
                  uploadingImage={uploadingReimagineImage}
                  placeholderText="Click to upload an image for ReImagine"
                  onImageUpload={async (e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64Data = event.target.result;
                        setReimagineImage(base64Data);

                        // Immediately upload to R2
                        setUploadingReimagineImage(true);
                        const url = await uploadImageToR2(base64Data, 'reimagine-input.jpg');
                        if (url) {
                          setReimagineImageUrl(url);

                        } else {
                          setReimagineImage(null); // Reset if upload failed
                        }
                        setUploadingReimagineImage(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onImageRemove={() => {
                    setReimagineImage(null);
                    setReimagineImageUrl(null);
                  }}
                  isDragging={isDragging}
                  isLoading={isLoading}
                  error={error}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                />

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    This tool will place you in an ReImagine Scenarios that would be difficult or impossible to achieve in real life.
                  </Typography>
                </Box>

                {/* Generate Button for ReImagine */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={generateReimagineImage}
                    disabled={!reimagineImageUrl || isLoading}
                    sx={{
                      py: 1.5,
                      px: 3,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      },
                      '&:disabled': {
                        background: '#e0e0e0',
                        color: '#9e9e9e'
                      }
                    }}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                  >
                    {isLoading ? 'ReImagining...' : 'ReImagine Scenarios'}
                  </Button>
                </Box>
              </>
            )}

            {/* Combine Image Specific Controls */}
            {selectedModel === 'combine-image' && (
              <DynamicCombineImageUploader
                images={combineImages}
                imageUrls={combineImageUrls}
                uploadingStates={uploadingCombineImages}
                switchedModel={switchedModel}
                onImageUpload={async (index, imageData, url) => {
                  if (imageData && !url) {
                    // Starting upload
                    updateCombineImage(index, imageData);
                    updateUploadingCombineImage(index, true);
                    
                    // Upload to R2
                    const uploadedUrl = await uploadImageToR2(imageData, `combine-image-${index + 1}.jpg`);
                    if (uploadedUrl) {
                      updateCombineImageUrl(index, uploadedUrl);
                      enqueueSnackbar(`Image ${index + 1} uploaded successfully!`, { variant: 'success' });
                    } else {
                      updateCombineImage(index, null); // Reset if upload failed
                      enqueueSnackbar(`Failed to upload image ${index + 1}`, { variant: 'error' });
                    }
                    updateUploadingCombineImage(index, false);
                  } else if (imageData && url) {
                    // Upload completed with URL
                    updateCombineImage(index, imageData);
                    updateCombineImageUrl(index, url);
                  } else {
                    // Reset/remove
                    updateCombineImage(index, null);
                    updateCombineImageUrl(index, null);
                  }
                }}
                onImageRemove={(index) => {
                  updateCombineImage(index, null);
                  updateCombineImageUrl(index, null);
                }}
                onAddSlot={addCombineImageSlot}
                onRemoveSlot={removeCombineImageSlot}
                uploadImageToR2={uploadImageToR2}
                enqueueSnackbar={enqueueSnackbar}
                isDragging={isDragging}
                isLoading={isLoading}
                error={error}
                handleDragOver={handleDragOver}
                handleDragLeave={handleDragLeave}
                handleDrop={handleDrop}
                switchedModel={switchedModel}
              />
            )}
            {selectedModel === 'edit-image' && (
              <>

                <ImageUploader
                  title="Upload Image to Edit"
                  uploadedImage={editImage}
                  uploadingImage={uploadingEditImage}
                  placeholderText="Click to upload an image to edit"
                  height="120px"
                  onImageUpload={async (e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64Data = event.target.result;
                        setEditImage(base64Data);

                        // Immediately upload to R2
                        setUploadingEditImage(true);
                        enqueueSnackbar('Uploading first image...', { variant: 'info' });
                        const url = await uploadImageToR2(base64Data, 'edit-image-input.jpg');
                        if (url) {
                          setEditImageUrl(url);
                        } else {
                          setEditImage(null); // Reset if upload failed
                        }
                        setUploadingEditImage(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onImageRemove={() => {
                    setEditImage(null);
                    setEditImageUrl(null);
                  }}
                  isDragging={isDragging}
                  isLoading={isLoading}
                  error={error}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                />
              </>
            )}

            {/* Upscale Image Specific Controls */}
            {selectedModel === 'upscale-image' && (
              <>
                {/* Image Upload Section */}
                <ImageUploader
                  title="Upload Image to Upscale"
                  uploadedImage={upscaleImage}
                  uploadingImage={uploadingUpscaleImage}
                  placeholderText="Click to upload an image for upscaling"
                  onImageUpload={async (e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64Data = event.target.result;
                        setUpscaleImage(base64Data);

                        // Immediately upload to R2
                        setUploadingUpscaleImage(true);
                        enqueueSnackbar('Uploading image for upscaling...', { variant: 'info' });
                        const url = await uploadImageToR2(base64Data, 'upscale-image-input.jpg');
                        if (url) {
                          setUpscaleImageUrl(url);
                        } else {
                          setUpscaleImage(null); // Reset if upload failed
                        }
                        setUploadingUpscaleImage(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onImageRemove={() => {
                    setUpscaleImage(null);
                    setUpscaleImageUrl(null);
                  }}
                  isDragging={isDragging}
                  isLoading={isLoading}
                  error={error}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                />

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Upload an image to enhance its resolution and quality using AI upscaling technology. Choose from different models for optimal results.
                  </Typography>
                </Box>

                {/* Generate Button for Upscale */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={generateUpscaleImage}
                    disabled={!upscaleImageUrl || isLoading}
                    sx={{
                      py: .8,
                      px: 2,
                      borderRadius: 3,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '14px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      },
                      '&:disabled': {
                        background: '#e0e0e0',
                        color: '#9e9e9e'
                      }
                    }}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                  >
                    {isLoading ? 'Upscaling Image...' : 'Upscale Image'}
                  </Button>
                </Box>
              </>
            )}

            {/* Video Generation Specific Controls */}
            {selectedModel === 'generate-video' && (
              <>
                {/* Required Start Image Upload */}
                <ImageUploader
                  title="Upload Start Image (Required)"
                  uploadedImage={videoStartImage}
                  uploadingImage={uploadingVideoStartImage}
                  placeholderText="Click to upload an image to generate video from"
                  onImageUpload={async (e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64Data = event.target.result;
                        setVideoStartImage(base64Data);

                        // Immediately upload to R2
                        setUploadingVideoStartImage(true);
                        enqueueSnackbar('Uploading start image...', { variant: 'info' });
                        const url = await uploadImageToR2(base64Data, 'video-start-image.jpg');
                        if (url) {
                          setVideoStartImageUrl(url);
                          enqueueSnackbar('Start image uploaded successfully!', { variant: 'success' });
                        } else {
                          setVideoStartImage(null); // Reset if upload failed
                          enqueueSnackbar('Failed to upload start image', { variant: 'error' });
                        }
                        setUploadingVideoStartImage(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onImageRemove={() => {
                    setVideoStartImage(null);
                    setVideoStartImageUrl(null);
                  }}
                  isDragging={isDragging}
                  isLoading={isLoading}
                  error={error}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                />

                {/* Prompt Input */}
                <StyledTextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Describe the video you want to generate... (e.g., 'A woman dancing gracefully in a sunlit garden')"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  variant="outlined"
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      minHeight: '120px',
                      alignItems: 'flex-start',
                      '& textarea': {
                        resize: 'vertical',
                      },
                    },
                  }}
                />

                {/* Generate Video Button */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                  <Button
                    variant="contained"
                    onClick={generateVideo}
                    disabled={!inputPrompt.trim() || !videoStartImageUrl || isLoading}
                    sx={{
                      py: 1.2,
                      px: 4,
                      borderRadius: 3,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '16px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                      },
                      '&:disabled': {
                        background: '#e0e0e0',
                        color: '#9e9e9e'
                      },
                      transition: 'all 0.3s ease',
                    }}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                  >
                    {isLoading ? 'Starting Generation...' : 'Generate Video (10 Credits)'}
                  </Button>
                </Box>

                {/* Video Results */}
                <VideoResults
                  videoJobs={videoJobs}
                  loadingVideoJobs={loadingVideoJobs}
                  checkVideoStatus={checkVideoStatus}
                  onRefresh={fetchVideoJobs}
                />
              </>
            )}

            {/* Image Display Area */}
            <Box ref={imageGenerationRef}>
              <GeneratedImages
                images={generatedImages}
                isLoading={isLoading}
                numOutputs={numOutputs}
                selectedModel={selectedModel}
                handlePreview={handlePreview}
                handleDownload={handleDownload}
                removeImage={removeImage}
                canCompare={canCompareImages()}
                handleComparePreview={handleComparePreview}
                onPublish={handlePublishImage}
                inputPrompt={inputPrompt}
              />


            </Box>

            {/* Example Images Masonry - Hide for video generation */}
            {selectedModel !== 'generate-video' && (
            <ExampleMasonry
              ref={exampleMasonryRef}
              key={`${selectedModel}-${selectedGender}-${session?.user?.id || 'guest'}`}
              selectedModel={selectedModel}
              selectedGender={selectedGender}
              onImageClick={handleExampleImageClick}
              onPromptUse={handlePromptUse}
            />
            )}
          </MainEditor>
        </Box>

        {/* Enhanced Preview Modal */}
        <ImagePreviewModal
          open={previewOpen}
          onClose={handlePreviewClose}
          images={previewType === 'generated' ? generatedImages : exampleImages.map(img => img.url)}
          currentIndex={currentImageIndex}
          onImageChange={handleImageChange}
          selectedModel={selectedModel}
          imageInfo={
            previewType === 'example' && exampleImageInfo ? exampleImageInfo : (() => {
              const configDisplay = generateModelConfigurationDisplay();
              return {
                title: `Generated Image ${currentImageIndex + 1}`,
                prompt: configDisplay.type === 'prompt' ? configDisplay.content : null,
                modelConfig: configDisplay.type === 'config' ? configDisplay.content : null,
                model: selectedModel,
                resolution: 'High Quality',
                format: 'JPEG',
                type: 'generated'
              };
            })()
          }
          canCompare={previewType === 'example' ? exampleCanCompare : canCompareImages()}
          beforeImage={
            previewType === 'example' ? exampleBeforeImage :
              selectedModel === 'hair-style' ? uploadedImage :
                selectedModel === 'text-removal' ? textRemovalImage :
                  selectedModel === 'headshot' ? headshotImage :
                    selectedModel === 'restore-image' ? restoreImage :
                      selectedModel === 'gfp-restore' ? gfpRestoreImage :
                        selectedModel === 'home-designer' ? homeDesignerImage :
                          selectedModel === 'background-removal' ? backgroundRemovalImage :
                            selectedModel === 'remove-object' ? removeObjectImage :
                              selectedModel === 're-imagine' ? reimagineImage :
                              selectedModel === 'combine-image' ? combineImage1 :
                                selectedModel === 'edit-image' ? editImage :
                                  selectedModel === 'upscale-image' ? upscaleImage :
                                    selectedModel === 'generate-image' && generatedImages.filter(img => img !== null).length >= 2
                                      ? generatedImages.filter(img => img !== null)[0] : null
          }
          afterImage={
            previewType === 'example' ? exampleAfterImage :
              selectedModel === 'hair-style' ? generatedImages[0] :
                selectedModel === 'text-removal' ? generatedImages[0] :
                  selectedModel === 'headshot' ? generatedImages[0] :
                    selectedModel === 'restore-image' ? generatedImages[0] :
                      selectedModel === 'gfp-restore' ? generatedImages[0] :
                        selectedModel === 'home-designer' ? generatedImages[0] :
                          selectedModel === 'background-removal' ? generatedImages[0] :
                            selectedModel === 'remove-object' ? generatedImages[0] :
                              selectedModel === 're-imagine' ? generatedImages[0] :
                                selectedModel === 'combine-image' ? generatedImages[0] :
                                  selectedModel === 'edit-image' ? generatedImages[0] :
                                    selectedModel === 'upscale-image' ? generatedImages[0] :
                                      selectedModel === 'generate-image' && generatedImages.filter(img => img !== null).length >= 2
                                        ? generatedImages.filter(img => img !== null)[1] : null
          }
          beforeLabel={previewType === 'example' ? exampleBeforeLabel : getComparisonLabels().before}
          afterLabel={previewType === 'example' ? exampleAfterLabel : getComparisonLabels().after}
          autoOpenComparison={autoOpenComparison}
        />

        {/* Combine Image Modal */}
        <CombineImageModal
          open={combineModalOpen}
          onClose={handleCombineModalClose}
          inputImage1={(combineModalData.isExample || combineModalData.isHistory || combineModalData.isCommunity) ? combineModalData.inputImage1 : combineImage1}
          inputImage2={(combineModalData.isExample || combineModalData.isHistory || combineModalData.isCommunity) ? combineModalData.inputImage2 : combineImage2}
          inputImages={(combineModalData.isExample || combineModalData.isHistory || combineModalData.isCommunity) ? combineModalData.inputImages || [] : combineImages}
          outputImage={(combineModalData.isExample || combineModalData.isHistory || combineModalData.isCommunity) ? combineModalData.outputImage : generatedImages[0]}
          onDownload={handleDownload}
          isLoading={!(combineModalData.isExample || combineModalData.isHistory || combineModalData.isCommunity) && isLoading}
          switchedModel={switchedModel}
        />

        {/* Download Modal */}
        <DownloadModal {...downloadHandler.modalProps} />
      </StyledPaper>
    </>
  );
} 