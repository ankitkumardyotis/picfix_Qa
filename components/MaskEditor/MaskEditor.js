import React, { useRef, useState, useEffect } from 'react';
import styles from './MaskEditor.module.css';
import Uploader from '../uploadContainerbase64/Uploader';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import { Button, IconButton, Tooltip } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
const MaskEditor = ({
  canvasRef,
  maskRef,
  handleRemoveObject,
  isDrawing, setIsDrawing, fileUrl,
  imageSrc, setImageSrc, isShowUploader,
  brushSize, setBrushSize, restorePhoto, setRestoredPhoto, maskedImageUrl, setMaskedImageUrl,
  handleUploadNewImages
}) => {
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        const maxWidth = window.innerWidth * 0.5; // 50vw
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          const aspectRatio = height / width;
          width = maxWidth;
          height = maxWidth * aspectRatio;
        }

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, width, height);

        const maskCanvas = maskRef.current;
        maskCanvas.width = img.width;  // Keep original image dimensions
        maskCanvas.height = img.height;
        const maskContext = maskCanvas.getContext('2d');
        maskContext.fillStyle = 'black';
        maskContext.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

        setImageDimensions({ width: img.width, height: img.height }); // Store original dimensions

        // Clear stacks when a new image is uploaded
        setUndoStack([]);
        setRedoStack([]);
      };
    }
  }, [imageSrc]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveState = () => {
    const canvas = canvasRef.current;
    const maskCanvas = maskRef.current;

    setUndoStack(prev => [...prev, {
      canvasData: canvas.toDataURL(),
      maskData: maskCanvas.toDataURL()
    }]);

    setRedoStack([]); // Clear redo stack whenever a new action is performed
  };

  const startDrawing = ({ nativeEvent }) => {
    saveState();  // Save state before any drawing starts

    const { offsetX, offsetY } = nativeEvent;
    setIsDrawing(true);
    if (isMobile()) disableScroll(); // Only disable scroll on mobile devices
    draw(offsetX, offsetY, true);
  };

  const startTouchDrawing = (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;
    startDrawing({ nativeEvent: { offsetX, offsetY } });
  };

  const moveDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    if (isDrawing) {
      draw(offsetX, offsetY);
    }
  };

  const moveTouchDrawing = (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;
    moveDrawing({ nativeEvent: { offsetX, offsetY } });
  };

  const endDrawing = () => {
    setIsDrawing(false);
    if (isMobile()) enableScroll(); // Only enable scroll on mobile devices
    const context = canvasRef.current.getContext('2d');
    context.beginPath();
    const maskContext = maskRef.current.getContext('2d');
    maskContext.beginPath();
  };

  const draw = (x, y, isStart = false) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const maskCanvas = maskRef.current;
    const scaleX = maskCanvas.width / canvas.width;
    const scaleY = maskCanvas.height / canvas.height;
    const context = canvas.getContext('2d');
    const maskContext = maskCanvas.getContext('2d');

    const scaledX = x * scaleX;
    const scaledY = y * scaleY;

    if (isStart) {
      context.beginPath();
      maskContext.beginPath();
    }

    context.fillStyle = 'lightgreen';
    context.strokeStyle = 'lightgreen';
    context.lineWidth = brushSize;
    context.lineCap = 'round';
    context.lineTo(x, y);
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);

    maskContext.fillStyle = 'white';
    maskContext.strokeStyle = 'white';
    maskContext.lineWidth = brushSize * scaleX;
    maskContext.lineCap = 'round';
    maskContext.lineTo(scaledX, scaledY);
    maskContext.stroke();
    maskContext.beginPath();
    maskContext.moveTo(scaledX, scaledY);
  };

  // Undo functionality
  const undo = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack.pop();
      setRedoStack(prev => [...prev, {
        canvasData: canvasRef.current.toDataURL(),
        maskData: maskRef.current.toDataURL()
      }]);

      const canvas = canvasRef.current;
      const maskCanvas = maskRef.current;
      const context = canvas.getContext('2d');
      const maskContext = maskCanvas.getContext('2d');

      const img = new Image();
      img.src = lastState.canvasData;
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
      };

      const maskImg = new Image();
      maskImg.src = lastState.maskData;
      maskImg.onload = () => {
        maskContext.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
        maskContext.drawImage(maskImg, 0, 0);
      };
    }
  };

  // Redo functionality
  const redo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack.pop();
      setUndoStack(prev => [...prev, {
        canvasData: canvasRef.current.toDataURL(),
        maskData: maskRef.current.toDataURL()
      }]);

      const canvas = canvasRef.current;
      const maskCanvas = maskRef.current;
      const context = canvas.getContext('2d');
      const maskContext = maskCanvas.getContext('2d');

      const img = new Image();
      img.src = nextState.canvasData;
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
      };

      const maskImg = new Image();
      maskImg.src = nextState.maskData;
      maskImg.onload = () => {
        maskContext.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
        maskContext.drawImage(maskImg, 0, 0);
      };
    }
  };

  // Disable scrolling on touch devices
  const disableScroll = () => {
    document.body.style.overflow = 'hidden';
  };

  // Enable scrolling on touch devices
  const enableScroll = () => {
    document.body.style.overflow = 'auto';
  };

  // Function to check if the device is mobile
  const isMobile = () => {
    return window.innerWidth <= 768; // Consider a width of 768px or less as mobile
  };

  return (
    <div className={styles.maskContainer}>
      {imageSrc && !restorePhoto && (
        <>
          <div className={styles.controlsTool} >
            <div>
              <label htmlFor="brushSize">Brush Size: </label>
              <input
                type="range"
                id="brushSize"
                min="1"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(e.target.value)}
              />
            </div>
            <Tooltip title="Undo">
              <IconButton onClick={undo} disabled={undoStack.length === 0}><ReplayIcon /></IconButton>
            </Tooltip>
            <Tooltip title="Redo">
              <IconButton onClick={redo} disabled={redoStack.length === 0}><ReplayIcon sx={{ transform: "rotateY(180deg)" }} /></IconButton>
            </Tooltip>
          </div>
          <div className={styles.canvasContainer}>
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseUp={endDrawing}
              onMouseMove={moveDrawing}
              onMouseLeave={endDrawing}
              onTouchStart={startTouchDrawing}
              onTouchMove={moveTouchDrawing}
              onTouchEnd={endDrawing}
              style={{
                cursor: `url('data:image/svg+xml;base64,${btoa(`
                  <svg height="${brushSize}" width="${brushSize}" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="${brushSize / 2}" cy="${brushSize / 2}" r="${brushSize / 2}" fill="darkgreen" />
                  </svg>
                `)}') ${brushSize / 2} ${brushSize / 2}, auto`,
                display: imageSrc ? 'block' : 'none',
                width: '100%',
                height: 'auto',
              }}
            />
            <canvas ref={maskRef} style={{ display: 'none' }} />
          </div>
        </>
      )}
    </div>
  );
};

export default MaskEditor;
