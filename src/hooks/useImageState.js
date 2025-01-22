import { useState, useCallback } from 'react';

const useImageState = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [enhanceEffect, setEnhanceEffect] = useState(false);
  const [showTooltips, setShowTooltips] = useState(true);
  const [useTestImage, setUseTestImage] = useState(false);
  const [matteValue, setMatteValue] = useState(0);
  const [textureValue, setTextureValue] = useState(0);

  const testImageUrl = '/test-image.jpg';
  const testProcessedUrl = '/test-processed.jpg';
  const workingImageUrl = useTestImage ? testImageUrl : '/working-image.jpg';
  const workingProcessedUrl = useTestImage ? testProcessedUrl : '/working-processed.jpg';

  const handleImageUpload = useCallback(async (file) => {
    setIsProcessing(true);
    // Implement image upload logic here
    setImageLoaded(true);
    setIsProcessing(false);
  }, []);

  const handleLoadUrl = useCallback(async () => {
    if (!urlInput) return;
    setIsProcessing(true);
    // Implement URL loading logic here
    setImageLoaded(true);
    setIsProcessing(false);
  }, [urlInput]);

  const handleUrlKeyPress = useCallback((event) => {
    if (event.key === 'Enter') {
      handleLoadUrl();
    }
  }, [handleLoadUrl]);

  const handleQuickDownload = useCallback(() => {
    // Implement download logic here
    console.log('Downloading processed image');
  }, []);

  const canDownload = imageLoaded && !isProcessing;

  return {
    imageLoaded,
    canDownload,
    isProcessing,
    urlInput,
    setUrlInput,
    showAdvanced,
    enhanceEffect,
    showTooltips,
    useTestImage,
    matteValue,
    textureValue,
    testImageUrl,
    testProcessedUrl,
    workingImageUrl,
    workingProcessedUrl,
    handleImageUpload,
    handleLoadUrl,
    handleUrlKeyPress,
    handleQuickDownload,
    setShowTooltips,
    setUseTestImage,
    setEnhanceEffect,
    setMatteValue,
    setTextureValue,
  };
};

export default useImageState;
