import { useRef, useState } from 'react';
import { Camera, X, SwitchCamera, Upload, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface PhotoCaptureProps {
  onPhotoCapture: (photoUrl: string) => void;
}

export function PhotoCapture({ onPhotoCapture }: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('UNSUPPORTED');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        toast.success('Kamera berhasil diaktifkan');
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      
      let errorMessage = '';
      
      if (error.message === 'UNSUPPORTED') {
        errorMessage = 'Browser Anda tidak mendukung akses kamera. Gunakan browser modern atau upload foto.';
        setCameraError('unsupported');
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Izin kamera ditolak. Klik icon kamera di address bar untuk mengizinkan akses, lalu refresh halaman.';
        setCameraError('permission');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'Kamera tidak ditemukan. Pastikan perangkat Anda memiliki kamera.';
        setCameraError('notfound');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'Kamera sedang digunakan aplikasi lain. Tutup aplikasi tersebut dan coba lagi.';
        setCameraError('inuse');
      } else {
        errorMessage = 'Tidak dapat mengakses kamera. Gunakan tombol Upload untuk mengunggah foto.';
        setCameraError('unknown');
      }
      
      toast.error(errorMessage);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setCameraError(null);
  };

  const switchCamera = async () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setTimeout(() => startCamera(), 100);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        context.drawImage(video, 0, 0);
        const photoUrl = canvas.toDataURL('image/png');
        onPhotoCapture(photoUrl);
        toast.success('Foto berhasil diambil!');
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error('File harus berupa gambar');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          onPhotoCapture(result);
          toast.success('Foto berhasil diunggah!');
        }
      };
      reader.readAsDataURL(file);
      
      // Reset input
      event.target.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full max-w-2xl aspect-[4/3] bg-black rounded-lg overflow-hidden">
        {isStreaming ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                onClick={switchCamera}
                className="bg-white/90 hover:bg-white"
              >
                <SwitchCamera className="size-5" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={stopCamera}
                className="bg-white/90 hover:bg-white"
              >
                <X className="size-5" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
            <Button
              size="lg"
              onClick={startCamera}
              className="gap-2"
            >
              <Camera className="size-5" />
              Buka Kamera
            </Button>
            
            <div className="text-white/70 text-sm">atau</div>
            
            <Button
              size="lg"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="size-5" />
              Upload Foto
            </Button>

            {cameraError && (
              <div className="mt-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 max-w-md">
                <div className="flex gap-3 items-start">
                  <AlertCircle className="size-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-white/90">
                    {cameraError === 'permission' && (
                      <>
                        <p className="font-semibold mb-1">Izin Kamera Diperlukan</p>
                        <p>Klik icon kamera/gembok di address bar browser Anda, lalu izinkan akses kamera dan refresh halaman.</p>
                      </>
                    )}
                    {cameraError === 'unsupported' && (
                      <>
                        <p className="font-semibold mb-1">Browser Tidak Didukung</p>
                        <p>Gunakan Chrome, Firefox, Safari, atau Edge versi terbaru. Atau gunakan tombol Upload.</p>
                      </>
                    )}
                    {cameraError === 'notfound' && (
                      <>
                        <p className="font-semibold mb-1">Kamera Tidak Ditemukan</p>
                        <p>Pastikan perangkat Anda memiliki kamera atau gunakan tombol Upload.</p>
                      </>
                    )}
                    {cameraError === 'inuse' && (
                      <>
                        <p className="font-semibold mb-1">Kamera Sedang Digunakan</p>
                        <p>Tutup aplikasi lain yang menggunakan kamera, lalu coba lagi.</p>
                      </>
                    )}
                    {cameraError === 'unknown' && (
                      <>
                        <p className="font-semibold mb-1">Kesalahan Kamera</p>
                        <p>Silakan gunakan tombol Upload untuk mengunggah foto dari galeri Anda.</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <canvas ref={canvasRef} className="hidden" />

      {isStreaming && (
        <Button
          size="lg"
          onClick={capturePhoto}
          className="gap-2 min-w-[200px]"
        >
          <Camera className="size-5" />
          Ambil Foto
        </Button>
      )}
    </div>
  );
}