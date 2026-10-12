import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCcw, Image as ImageIcon } from 'lucide-react';

export default function CameraScanner({ onClose, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Live camera streaming is not supported in this browser. You can still take or upload a photo below.");
      return;
    }

    try {
      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } }
        });
      } catch (e) {
        // Fallback for devices rejecting constraints
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("Autoplay was prevented:", playErr);
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access live camera stream. You can take or choose a photo using the button below.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64 image
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Stop camera and pass image back
      stopCamera();
      onCapture(imageData);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        stopCamera();
        onCapture(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="w-full max-w-lg p-4 relative h-full flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center text-white mb-4 pt-4">
          <h2 className="text-xl font-serif font-bold">Scan Perfume</h2>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
            <X size={24} />
          </button>
        </div>

        {/* Viewfinder */}
        <div className="flex-1 relative bg-black rounded-3xl overflow-hidden border border-white/20 flex items-center justify-center shadow-2xl">
          {error ? (
            <div className="text-center p-8">
              <p className="text-red-400 mb-4">{error}</p>
              <div className="flex flex-col gap-3 items-center">
                <button onClick={startCamera} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-white hover:bg-white/20">
                  <RefreshCcw size={18} /> Retry Camera
                </button>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()} 
                  className="flex items-center gap-2 bg-white text-luxury-900 px-5 py-2.5 rounded-full font-semibold hover:bg-luxury-100 shadow-lg"
                >
                  <ImageIcon size={18} /> Take or Choose Photo
                </button>
              </div>
            </div>
          ) : (
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Target Reticle Overlay */}
          {!error && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-white/50 rounded-xl relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-gold rounded-tl-xl -mt-0.5 -ml-0.5"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-gold rounded-tr-xl -mt-0.5 -mr-0.5"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-gold rounded-bl-xl -mb-0.5 -ml-0.5"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-gold rounded-br-xl -mb-0.5 -mr-0.5"></div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="py-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-6">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 bg-white/15 rounded-full text-white hover:bg-white/25 transition flex items-center justify-center shadow"
              title="Upload from Photo Library or Take Photo"
            >
              <ImageIcon size={22} />
            </button>
            <button 
              onClick={handleCapture}
              disabled={!!error}
              className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/50 hover:bg-white/30 hover:border-white transition-all disabled:opacity-50"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-luxury-900 shadow-lg">
                <Camera size={32} />
              </div>
            </button>
            <div className="w-12 h-12" /> {/* Spacer */}
          </div>
          <p className="text-xs text-white/60">Tap shutter to scan, or photo icon to choose from library</p>
        </div>

      </div>
      <canvas ref={canvasRef} className="hidden" />
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />
    </div>
  );
}
