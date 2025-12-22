import React, { useRef, useState, useEffect } from 'react';
import { Box, Slider, Typography, IconButton, Tooltip, styled } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';

const MaskEditorContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  position: 'relative',
  borderRadius: theme.spacing(1),
}));

const ControlsToolbar = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[2],
  marginBottom: theme.spacing(1),
}));

const CanvasContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  border: `2px solid ${theme.palette.divider}`,
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[1],
  maxWidth: '100%',
  overflow: 'hidden',
}));

const ObjectRemovalMaskEditor = ({
  inputImage,
  onMaskCreated,
  isLoading = false
}) => {
  const canvasRef = useRef(null);
  const maskRef = useRef(null);
  const [brushSize, setBrushSize] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  useEffect(() => {
    if (inputImage) {
      const img = new Image();
      img.src = inputImage;
      img.onload = () => {
        const maxWidth = Math.min(window.innerWidth * 0.6, 800); // Max 60vw or 800px
        const maxHeight = Math.min(window.innerHeight * 0.6, 600); // Max 60vh or 600px
        
        let width = img.width;
        let height = img.height;

        // Scale down if too large
        if (width > maxWidth || height > maxHeight) {
          const scaleX = maxWidth / width;
          const scaleY = maxHeight / height;
          const scale = Math.min(scaleX, scaleY);
          width = width * scale;
          height = height * scale;
        }

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, width, height);

        // Mask canvas maintains original image dimensions
        const maskCanvas = maskRef.current;
        maskCanvas.width = img.width;
        maskCanvas.height = img.height;
        const maskContext = maskCanvas.getContext('2d');
        maskContext.fillStyle = 'black';
        maskContext.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

        setImageDimensions({ width: img.width, height: img.height });

        // Clear undo/redo stacks
        setUndoStack([]);
        setRedoStack([]);

        // Notify parent that mask is ready
        if (onMaskCreated) {
          const maskDataUrl = maskCanvas.toDataURL('image/png');
          onMaskCreated(maskDataUrl);
        }
      };
    }
  }, [inputImage]);

  const saveState = () => {
    const canvas = canvasRef.current;
    const maskCanvas = maskRef.current;

    setUndoStack(prev => [...prev, {
      canvasData: canvas.toDataURL(),
      maskData: maskCanvas.toDataURL()
    }]);

    setRedoStack([]); // Clear redo stack
  };

  const startDrawing = ({ nativeEvent }) => {
    if (isLoading) return;
    
    saveState();
    const { offsetX, offsetY } = nativeEvent;
    setIsDrawing(true);
    draw(offsetX, offsetY, true);
  };

  const startTouchDrawing = (event) => {
    if (isLoading) return;
    
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
    const context = canvasRef.current.getContext('2d');
    context.beginPath();
    const maskContext = maskRef.current.getContext('2d');
    maskContext.beginPath();

    // Update mask data
    if (onMaskCreated) {
      const maskDataUrl = maskRef.current.toDataURL('image/png');
      onMaskCreated(maskDataUrl);
    }
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

    // Draw on display canvas (green overlay)
    context.fillStyle = 'rgba(76, 175, 80, 0.6)';
    context.strokeStyle = 'rgba(76, 175, 80, 0.8)';
    context.lineWidth = brushSize;
    context.lineCap = 'round';
    context.lineTo(x, y);
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);

    // Draw on mask canvas (white on black)
    maskContext.fillStyle = 'white';
    maskContext.strokeStyle = 'white';
    maskContext.lineWidth = brushSize * scaleX;
    maskContext.lineCap = 'round';
    maskContext.lineTo(scaledX, scaledY);
    maskContext.stroke();
    maskContext.beginPath();
    maskContext.moveTo(scaledX, scaledY);
  };

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
        
        // Update mask
        if (onMaskCreated) {
          const maskDataUrl = maskRef.current.toDataURL('image/png');
          onMaskCreated(maskDataUrl);
        }
      };

      const maskImg = new Image();
      maskImg.src = lastState.maskData;
      maskImg.onload = () => {
        maskContext.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
        maskContext.drawImage(maskImg, 0, 0);
      };
    }
  };

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
        
        // Update mask
        if (onMaskCreated) {
          const maskDataUrl = maskRef.current.toDataURL('image/png');
          onMaskCreated(maskDataUrl);
        }
      };

      const maskImg = new Image();
      maskImg.src = nextState.maskData;
      maskImg.onload = () => {
        maskContext.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
        maskContext.drawImage(maskImg, 0, 0);
      };
    }
  };

  const clearMask = () => {
    if (isLoading) return;
    
    saveState();
    
    // Redraw original image
    const img = new Image();
    img.src = inputImage;
    img.onload = () => {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Clear mask
      const maskCanvas = maskRef.current;
      const maskContext = maskCanvas.getContext('2d');
      maskContext.fillStyle = 'black';
      maskContext.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

      // Update mask data
      if (onMaskCreated) {
        const maskDataUrl = maskCanvas.toDataURL('image/png');
        onMaskCreated(maskDataUrl);
      }
    };
  };

  if (!inputImage) {
    return null;
  }

  return (
    <MaskEditorContainer>
      <ControlsToolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
          <Typography variant="body2" sx={{ fontSize: '12px' }}>
            Brush Size:
          </Typography>
          <Slider
            value={brushSize}
            onChange={(e, value) => setBrushSize(value)}
            min={5}
            max={50}
            size="small"
            disabled={isLoading}
            sx={{ flex: 1 }}
          />
          <Typography variant="body2" sx={{ fontSize: '12px', minWidth: 20 }}>
            {brushSize}
          </Typography>
        </Box>
        
        <Tooltip title="Undo">
          <span>
            <IconButton 
              onClick={undo} 
              disabled={undoStack.length === 0 || isLoading}
              size="small"
            >
              <UndoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        
        <Tooltip title="Redo">
          <span>
            <IconButton 
              onClick={redo} 
              disabled={redoStack.length === 0 || isLoading}
              size="small"
            >
              <RedoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Clear Mask">
          <span>
            <IconButton 
              onClick={clearMask} 
              disabled={isLoading}
              size="small"
              color="error"
            >
              <Typography variant="body2" sx={{ fontSize: '10px' }}>
                Clear
              </Typography>
            </IconButton>
          </span>
        </Tooltip>
      </ControlsToolbar>

      <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', fontSize: '12px' }}>
        Paint over the objects you want to remove. Green areas will be removed.
      </Typography>

      <CanvasContainer>
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
            cursor: isLoading ? 'not-allowed' : `url('data:image/svg+xml;base64,${btoa(`
              <svg height="${brushSize}" width="${brushSize}" xmlns="http://www.w3.org/2000/svg">
                <circle cx="${brushSize / 2}" cy="${brushSize / 2}" r="${brushSize / 2}" fill="rgba(76, 175, 80, 0.8)" stroke="white" stroke-width="1" />
              </svg>
            `)}') ${brushSize / 2} ${brushSize / 2}, auto`,
            display: 'block',
            maxWidth: '100%',
            height: 'auto',
            opacity: isLoading ? 0.5 : 1,
            pointerEvents: isLoading ? 'none' : 'auto'
          }}
        />
        <canvas ref={maskRef} style={{ display: 'none' }} />
      </CanvasContainer>
    </MaskEditorContainer>
  );
};

export default ObjectRemovalMaskEditor; 