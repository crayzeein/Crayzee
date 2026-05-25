'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Upload, Download, Share2, ShoppingCart, RotateCcw, Sparkles, AlertCircle, CheckCircle, ImagePlus } from 'lucide-react';
import Image from 'next/image';
import { generateTryOn } from '@/utils/tryonApi';

const STEPS = {
  UPLOAD: 'upload',
  PROCESSING: 'processing',
  RESULT: 'result',
  ERROR: 'error',
};

const loadingMessages = [
  '✨ Analyzing your photo...',
  '👗 Preparing the outfit...',
  '🎨 AI is styling you up...',
  '🪄 Almost there, magic happening...',
  '💫 Final touches being applied...',
];

export default function TryOnModal({ isOpen, onClose, product, onAddToCart }) {
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [userPhoto, setUserPhoto] = useState(null);
  const [userPhotoFile, setUserPhotoFile] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [error, setError] = useState('');
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Cycle loading messages
  useEffect(() => {
    if (step !== STEPS.PROCESSING) return;
    const interval = setInterval(() => {
      setLoadingMsgIndex(prev => (prev + 1) % loadingMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [step]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(STEPS.UPLOAD);
        setUserPhoto(null);
        setUserPhotoFile(null);
        setResultImage(null);
        setError('');
        setLoadingMsgIndex(0);
        stopCamera();
      }, 300);
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Connect camera stream to video element AFTER it renders
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(err => {
        console.error('Video play error:', err);
      });
    }
  }, [isCameraActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } }
      });
      streamRef.current = stream;
      // First set isCameraActive to render the video element,
      // then the useEffect above will connect the stream
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera access denied. Please upload a photo instead.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    // Mirror the captured image (front camera is mirrored)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
        setUserPhotoFile(file);
        setUserPhoto(URL.createObjectURL(blob));
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be smaller than 5MB');
      return;
    }

    setUserPhotoFile(file);
    setUserPhoto(URL.createObjectURL(file));
    setError('');
  };

  const handleGenerate = async () => {
    if (!userPhotoFile || !product) return;

    setStep(STEPS.PROCESSING);
    setLoadingMsgIndex(0);
    setError('');

    try {
      const result = await generateTryOn(product._id, userPhotoFile);
      setResultImage(result.resultImage);
      setRemaining(result.remaining);
      setStep(STEPS.RESULT);
    } catch (err) {
      console.error('Try-on error:', err);
      const msg = err.response?.data?.message || err.message || 'Something went wrong. Please try again.';
      setError(msg);
      setStep(STEPS.ERROR);
    }
  };

  const handleDownload = async () => {
    if (!resultImage) return;
    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crayzee-tryon-${product?.name?.replace(/\s+/g, '-') || 'result'}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleShare = async () => {
    if (!resultImage) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Check out how ${product?.name} looks on me! - Crayzee.in`,
          text: `I tried on ${product?.name} from Crayzee.in using their AI Try-On feature! 🔥`,
          url: window.location.href,
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const handleRetry = () => {
    setUserPhoto(null);
    setUserPhotoFile(null);
    setResultImage(null);
    setError('');
    setStep(STEPS.UPLOAD);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl no-scrollbar"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
                  <Sparkles size={14} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-white">AI Virtual Try-On</h2>
                  <p className="text-[10px] text-zinc-400">Powered by AI</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <X size={18} className="text-zinc-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              <AnimatePresence mode="wait">

                {/* ──────── STEP 1: UPLOAD ──────── */}
                {step === STEPS.UPLOAD && (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    {/* Product preview */}
                    <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl mb-5">
                      {product?.images?.[0]?.url && (
                        <div className="w-12 h-14 rounded-lg overflow-hidden relative shrink-0">
                          <Image src={product.images[0].url} alt="" fill className="object-cover" unoptimized />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate capitalize">{product?.name}</p>
                        <p className="text-[10px] text-zinc-400">₹{product?.price}</p>
                      </div>
                    </div>

                    {/* Guidelines */}
                    <div className="bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 rounded-xl p-3.5 mb-5">
                      <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 mb-2">📸 Photo Tips for Best Results:</p>
                      <ul className="text-[10px] text-purple-600 dark:text-purple-400 space-y-1">
                        <li>• Stand straight, facing the camera</li>
                        <li>• Good lighting, plain background</li>
                        <li>• Full upper body visible (waist and above)</li>
                        <li>• Wear fitted clothes for better results</li>
                      </ul>
                    </div>

                    {/* Camera View */}
                    {isCameraActive ? (
                      <div className="space-y-3">
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-black">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                            style={{ transform: 'scaleX(-1)' }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={capturePhoto}
                            className="flex-1 h-11 bg-[#fb5607] text-white rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#e04e06] active:scale-[0.98] transition-all"
                          >
                            <Camera size={14} /> Capture Photo
                          </button>
                          <button
                            onClick={stopCamera}
                            className="h-11 px-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl font-semibold text-xs transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          >
                            Cancel
                          </button>
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                      </div>
                    ) : userPhoto ? (
                      /* Photo Preview */
                      <div className="space-y-3">
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                          <Image src={userPhoto} alt="Your photo" fill className="object-cover" unoptimized />
                          <button
                            onClick={handleRetry}
                            className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-black/70 transition-all"
                          >
                            <RotateCcw size={14} />
                          </button>
                        </div>
                        <button
                          onClick={handleGenerate}
                          className="w-full h-12 rounded-xl font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 text-white active:scale-[0.98] transition-all"
                          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)' }}
                        >
                          <Sparkles size={15} /> Generate Try-On
                        </button>
                      </div>
                    ) : (
                      /* Upload Options */
                      <div className="space-y-3">
                        <button
                          onClick={startCamera}
                          className="w-full h-28 border-2 border-dashed border-purple-200 dark:border-purple-500/30 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-500/5 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Camera size={18} className="text-purple-500" />
                          </div>
                          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Take a Selfie</span>
                        </button>

                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
                          <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">or</span>
                          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
                        </div>

                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-28 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#fb5607] hover:bg-orange-50/50 dark:hover:bg-orange-500/5 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ImagePlus size={18} className="text-[#fb5607]" />
                          </div>
                          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Upload from Gallery</span>
                        </button>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                    )}

                    {error && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-500/10 rounded-xl flex items-start gap-2">
                        <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ──────── STEP 2: PROCESSING ──────── */}
                {step === STEPS.PROCESSING && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    {/* Animated gradient ring */}
                    <div className="relative w-24 h-24 mb-6">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'conic-gradient(from 0deg, #7c3aed, #ec4899, #fb5607, #7c3aed)',
                          animation: 'spin 2s linear infinite',
                        }}
                      />
                      <div className="absolute inset-[3px] rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center">
                        <Sparkles size={28} className="text-purple-500" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
                      </div>
                    </div>

                    <motion.p
                      key={loadingMsgIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 text-center"
                    >
                      {loadingMessages[loadingMsgIndex]}
                    </motion.p>

                    <p className="text-[10px] text-zinc-400 mt-2 text-center">
                      This may take 30-60 seconds. Please be patient...
                    </p>

                    {/* Progress dots */}
                    <div className="flex gap-1.5 mt-5">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full bg-purple-400"
                          style={{
                            animation: `bounce 1.4s ${i * 0.2}s ease-in-out infinite`,
                          }}
                        />
                      ))}
                    </div>

                    <style jsx>{`
                      @keyframes spin { to { transform: rotate(360deg); } }
                      @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
                      @keyframes bounce {
                        0%, 100% { transform: translateY(0); opacity: 0.4; }
                        50% { transform: translateY(-8px); opacity: 1; }
                      }
                    `}</style>
                  </motion.div>
                )}

                {/* ──────── STEP 3: RESULT ──────── */}
                {step === STEPS.RESULT && resultImage && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    {/* Success badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400">Try-On Ready!</span>
                      {remaining !== null && (
                        <span className="ml-auto text-[9px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
                          {remaining} tries left today
                        </span>
                      )}
                    </div>

                    {/* Before / After */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {/* Before */}
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider text-center">Your Photo</p>
                        <div className="aspect-[3/4] rounded-xl overflow-hidden relative bg-zinc-100 dark:bg-zinc-800">
                          {userPhoto && <Image src={userPhoto} alt="Before" fill className="object-cover" unoptimized />}
                        </div>
                      </div>
                      {/* After */}
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-semibold text-purple-500 uppercase tracking-wider text-center flex items-center justify-center gap-1">
                          <Sparkles size={9} /> AI Result
                        </p>
                        <div className="aspect-[3/4] rounded-xl overflow-hidden relative bg-zinc-100 dark:bg-zinc-800 ring-2 ring-purple-400/30">
                          <Image src={resultImage} alt="Try-On Result" fill className="object-cover" unoptimized />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {onAddToCart && (
                        <button
                          onClick={() => { onAddToCart(); onClose(); }}
                          className="w-full h-11 bg-[#fb5607] text-white rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#e04e06] active:scale-[0.98] transition-all"
                        >
                          <ShoppingCart size={14} /> Add to Bag
                        </button>
                      )}

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={handleDownload}
                          className="h-10 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl font-semibold text-[10px] flex items-center justify-center gap-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                        >
                          <Download size={12} /> Save
                        </button>
                        <button
                          onClick={handleShare}
                          className="h-10 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl font-semibold text-[10px] flex items-center justify-center gap-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                        >
                          <Share2 size={12} /> Share
                        </button>
                        <button
                          onClick={handleRetry}
                          className="h-10 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl font-semibold text-[10px] flex items-center justify-center gap-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                        >
                          <RotateCcw size={12} /> Retry
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ──────── ERROR ──────── */}
                {step === STEPS.ERROR && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center py-8"
                  >
                    <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
                      <AlertCircle size={28} className="text-red-500" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-2">Oops! Something went wrong</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mb-5 max-w-[280px]">{error}</p>
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={handleRetry}
                        className="flex-1 h-11 rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 text-white active:scale-[0.98] transition-all"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
                      >
                        <RotateCcw size={13} /> Try Again
                      </button>
                      <button
                        onClick={onClose}
                        className="h-11 px-5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl font-semibold text-xs transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Footer disclaimer */}
            <div className="px-5 pb-4">
              <p className="text-[9px] text-zinc-400 text-center leading-relaxed">
                AI-generated preview for reference only. Actual product may vary. Your photo is not stored.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
