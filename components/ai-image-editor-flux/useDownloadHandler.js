import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

/**
 * Custom hook to handle download functionality with user plan checking
 * @returns {Object} - Download handler functions and state
 */
export const useDownloadHandler = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [currentDownloadData, setCurrentDownloadData] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);

  // Check if user has premium plan
  const hasPremiumPlan = useCallback(() => {
    if (!userPlan) return false;
    const premiumPlans = ['standard', 'premium', 'popular'];
    const cleanPlanName = userPlan.planName?.replace(/['"]/g, '').toLowerCase();
    const isExpired = userPlan.expiredAt && new Date(userPlan.expiredAt) < new Date();
    return premiumPlans.includes(cleanPlanName) && !isExpired;
  }, [userPlan]);

  // Fetch user plan data
  const fetchUserPlan = useCallback(async () => {
    if (!session?.user?.id) return null;
    
    setPlanLoading(true);
    try {
      const response = await fetch(`/api/getPlan?userId=${session.user.id}`);
      if (response.ok) {
        const data = await response.json();
        setUserPlan(data.plan);
        return data.plan;
      }
    } catch (error) {
      console.error('Error fetching user plan:', error);
    } finally {
      setPlanLoading(false);
    }
    return null;
  }, [session]);

  // Direct download without watermark (for premium users)
  const downloadDirect = useCallback(async (imageUrl, filename) => {
    try {
      // For premium users or when bypassing modal, download directly
      const downloadUrl = `/api/download-image?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(filename)}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }, []);

  // Main download handler - decides whether to show modal or download directly
  const handleDownload = useCallback(async (imageUrl, filename = 'image.jpg') => {
    console.log('[useDownloadHandler] handleDownload called with:', { imageUrl, filename, hasSession: !!session });
    
    if (!session) {
      // Redirect to login if not authenticated
      console.log('[useDownloadHandler] No session, redirecting to login');
      router.push('/login');
      return;
    }

    console.log('[useDownloadHandler] Session found, checking plan...');
    // Fetch user plan if not already loaded
    let plan = userPlan;
    if (!plan && !planLoading) {
      console.log('[useDownloadHandler] Fetching user plan...');
      plan = await fetchUserPlan();
      console.log('[useDownloadHandler] Plan fetched:', plan);
    } else {
      console.log('[useDownloadHandler] Using cached plan:', plan);
    }

    // Check if user has premium plan
    const isPremium = plan ? (() => {
      const premiumPlans = ['standard', 'premium', 'popular'];
      const cleanPlanName = plan.planName?.replace(/['"]/g, '').toLowerCase();
      const isExpired = plan.expiredAt && new Date(plan.expiredAt) < new Date();
      const hasPremium = premiumPlans.includes(cleanPlanName) && !isExpired;
      console.log('[useDownloadHandler] Premium check:', { cleanPlanName, isExpired, hasPremium });
      return hasPremium;
    })() : false;

    if (isPremium) {
      // Premium user - download directly without watermark
      console.log('[useDownloadHandler] Premium user - downloading directly');
      await downloadDirect(imageUrl, filename);
    } else {
      // Free user - show download modal with options
      console.log('[useDownloadHandler] Free user - showing modal');
      setCurrentDownloadData({ imageUrl, filename });
      setDownloadModalOpen(true);
      console.log('[useDownloadHandler] Modal state should be open now');
    }
  }, [session, userPlan, planLoading, router, fetchUserPlan, downloadDirect]);

  // Handle watermark download from modal
  const handleDownloadWithWatermark = useCallback(async () => {
    if (!currentDownloadData) return;
    
    try {
      const { imageUrl, filename } = currentDownloadData;
      await downloadDirect(imageUrl, filename);
    } catch (error) {
      console.error('Error downloading with watermark:', error);
      throw error;
    }
  }, [currentDownloadData, downloadDirect]);

  // Handle upgrade plan action
  const handleUpgradePlan = useCallback(() => {
    router.push('/pricing');
  }, [router]);

  // Close download modal
  const closeDownloadModal = useCallback(() => {
    setDownloadModalOpen(false);
    setCurrentDownloadData(null);
  }, []);

  return {
    // State
    downloadModalOpen,
    currentDownloadData,
    userPlan,
    planLoading,
    
    // Functions
    handleDownload,
    handleDownloadWithWatermark,
    handleUpgradePlan,
    closeDownloadModal,
    hasPremiumPlan,
    fetchUserPlan,
    downloadDirect,
    
    // Modal props
    modalProps: {
      open: downloadModalOpen,
      onClose: closeDownloadModal,
      imageUrl: currentDownloadData?.imageUrl,
      filename: currentDownloadData?.filename,
      onDownloadWithWatermark: handleDownloadWithWatermark,
      onUpgradePlan: handleUpgradePlan,
    }
  };
};

export default useDownloadHandler;
