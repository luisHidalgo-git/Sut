import { useState, useRef, useEffect } from 'react';
import '../styles/ImageCropModal.css';

const ImageCropModal = ({ isOpen, imageSrc, onSave, onCancel, aspectRatio = 1 }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen && imageSrc) {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        centerImage();
      };
      img.src = imageSrc;
    }
  }, [isOpen, imageSrc]);

  useEffect(() => {
    if (imageRef.current) {
      drawCanvas();
    }
  }, [zoom, position]);

  const centerImage = () => {
    if (!imageRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const img = imageRef.current;

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    const scale = Math.max(
      containerWidth / img.width,
      containerHeight / img.height
    );

    setZoom(scale);
    setPosition({ x: 0, y: 0 });
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    const containerWidth = canvas.width;
    const containerHeight = canvas.height;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, containerWidth, containerHeight);

    const scaledWidth = img.width * zoom;
    const scaledHeight = img.height * zoom;

    const x = (containerWidth - scaledWidth) / 2 + position.x;
    const y = (containerHeight - scaledHeight) / 2 + position.y;

    ctx.save();
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
    ctx.restore();

    const cropWidth = Math.min(containerWidth * 0.8, containerHeight * 0.8 * aspectRatio);
    const cropHeight = cropWidth / aspectRatio;
    const cropX = (containerWidth - cropWidth) / 2;
    const cropY = (containerHeight - cropHeight) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(cropX, cropY, cropWidth, cropHeight);
    ctx.clip();
    ctx.clearRect(0, 0, containerWidth, containerHeight);
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
    ctx.restore();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropWidth, cropHeight);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const containerWidth = canvas.width;
    const containerHeight = canvas.height;

    const cropWidth = Math.min(containerWidth * 0.8, containerHeight * 0.8 * aspectRatio);
    const cropHeight = cropWidth / aspectRatio;
    const cropX = (containerWidth - cropWidth) / 2;
    const cropY = (containerHeight - cropHeight) / 2;

    const outputCanvas = document.createElement('canvas');
    const outputSize = 800;
    outputCanvas.width = outputSize;
    outputCanvas.height = outputSize / aspectRatio;

    const ctx = outputCanvas.getContext('2d');

    const scaledWidth = img.width * zoom;
    const scaledHeight = img.height * zoom;
    const x = (containerWidth - scaledWidth) / 2 + position.x;
    const y = (containerHeight - scaledHeight) / 2 + position.y;

    const sourceX = (cropX - x) / zoom;
    const sourceY = (cropY - y) / zoom;
    const sourceWidth = cropWidth / zoom;
    const sourceHeight = cropHeight / zoom;

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      outputCanvas.width,
      outputCanvas.height
    );

    outputCanvas.toBlob((blob) => {
      onSave(blob);
    }, 'image/jpeg', 0.9);
  };

  if (!isOpen) return null;

  return (
    <div className="image-crop-modal-overlay">
      <div className="image-crop-modal">
        <div className="image-crop-header">
          <h3>Ajustar Imagen</h3>
        </div>

        <div
          ref={containerRef}
          className="image-crop-container"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="image-crop-canvas"
          />
          <div className="image-crop-instructions">
            Arrastra para mover, usa el control para hacer zoom
          </div>
        </div>

        <div className="image-crop-controls">
          <label className="zoom-label">
            Zoom
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="zoom-slider"
            />
          </label>
          <button onClick={centerImage} className="btn-reset">
            Restablecer
          </button>
        </div>

        <div className="image-crop-actions">
          <button onClick={onCancel} className="btn-cancel">
            Cancelar
          </button>
          <button onClick={handleSave} className="btn-save">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
