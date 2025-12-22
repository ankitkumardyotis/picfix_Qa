import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';

const BackgroundRemovalProcessor = ({ 
  inputImage, 
  onProcessingStart, 
  onProcessingComplete, 
  onProcessingError,
  onStatusChange 
}) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [status, setStatus] = useState('Loading model...');
  const fileInputRef = useRef(null);
  const statusRef = useRef(null);
  const removedBackgroundImageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Load the background removal script
    const script = document.createElement('script');
    script.src = '/assets/index-E_M5nW8h.js';
    script.type = 'module';
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      setIsScriptLoaded(true);
      setStatus('Ready');
      onStatusChange?.('Ready');
    };

    script.onerror = () => {
      setStatus('Error loading model');
      onProcessingError?.('Failed to load background removal model');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!isScriptLoaded || !inputImage) return;

    // Set up observers for status and result
    const statusElement = statusRef.current;
    const containerElement = removedBackgroundImageRef.current;

    if (statusElement && containerElement) {
      // Observer for status changes
      const statusObserver = new MutationObserver(() => {
        const newStatus = statusElement.textContent;
        setStatus(newStatus);
        onStatusChange?.(newStatus);
        
        if (newStatus === 'Analysing...') {
          onProcessingStart?.();
        }
      });
      statusObserver.observe(statusElement, { childList: true, subtree: true });

      // Observer for result image
      const imageObserver = new MutationObserver(() => {
        const imgElement = containerElement.querySelector('img');
        if (imgElement && imgElement.src) {
          const imageURL = imgElement.src;
          onProcessingComplete?.(imageURL);
        }
      });
      imageObserver.observe(containerElement, { childList: true, subtree: true });

      // Trigger processing by simulating file upload
      processImage(inputImage);

      return () => {
        statusObserver.disconnect();
        imageObserver.disconnect();
      };
    }
  }, [isScriptLoaded, inputImage]);

  const processImage = (imageData) => {
    try {
      // Create a fake file input event to trigger the background removal
      const fileInput = fileInputRef.current;
      if (fileInput) {
        // Convert base64 to blob if needed
        if (imageData.startsWith('data:')) {
          fetch(imageData)
            .then(res => res.blob())
            .then(blob => {
              const file = new File([blob], 'input.jpg', { type: 'image/jpeg' });
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(file);
              fileInput.files = dataTransfer.files;
              
              // Trigger the change event
              const event = new Event('change', { bubbles: true });
              fileInput.dispatchEvent(event);
            })
            .catch(error => {
              console.error('Error processing image:', error);
              onProcessingError?.('Failed to process image');
            });
        } else {
          // Handle URL images
          fetch(imageData)
            .then(res => res.blob())
            .then(blob => {
              const file = new File([blob], 'input.jpg', { type: 'image/jpeg' });
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(file);
              fileInput.files = dataTransfer.files;
              
              // Trigger the change event
              const event = new Event('change', { bubbles: true });
              fileInput.dispatchEvent(event);
            })
            .catch(error => {
              console.error('Error processing image:', error);
              onProcessingError?.('Failed to process image');
            });
        }
      }
    } catch (error) {
      console.error('Error in processImage:', error);
      onProcessingError?.('Failed to process image');
    }
  };

  return (
    <Box sx={{ display: 'none' }}>
      {/* Hidden elements required by the background removal script */}
      <div id="container" ref={containerRef}></div>
      <label id="status" ref={statusRef} style={{ display: 'none' }}>Loading model...</label>
      <input 
        id="upload" 
        ref={fileInputRef}
        type="file" 
        accept="image/jpeg, image/png, image/jpg"
        style={{ display: 'none' }}
      />
      <div id="removedBackgroundImage" ref={removedBackgroundImageRef} style={{ display: 'none' }}></div>
      <button id="download-button" style={{ display: 'none' }}>Download</button>
    </Box>
  );
};

export default BackgroundRemovalProcessor; 