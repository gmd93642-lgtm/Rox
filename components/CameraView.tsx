import React, { useRef, useEffect } from 'react';

interface CameraViewProps {
  active: boolean;
  onCapture: (imageSrc: string) => void;
  triggerCapture: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({ active, onCapture, triggerCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (active) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.error("Camera access denied:", err));
    } else {
        // Stop tracks
        const stream = videoRef.current?.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
    }
  }, [active]);

  useEffect(() => {
    if (triggerCapture && active && videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        // Remove prefix for API
        const base64 = dataUrl.split(',')[1];
        onCapture(base64);
      }
    }
  }, [triggerCapture, active, onCapture]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 -z-10 bg-black">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-full object-cover opacity-60 grayscale contrast-125 brightness-75"
      />
      {/* HUD Overlay Lines */}
      <div className="absolute inset-0 border-[20px] border-cyan-500/20 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-red-500/50 rounded-lg pointer-events-none flex items-center justify-center">
         <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
      </div>
      <div className="absolute top-10 right-10 text-red-500 font-header animate-pulse">
        REC ● VISION_MODULE_ACTIVE
      </div>
    </div>
  );
};

export default CameraView;