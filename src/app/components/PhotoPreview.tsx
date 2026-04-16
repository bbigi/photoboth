import { useEffect, useRef } from 'react';
import { X, Download, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { templates, type Template } from './TemplateSelector';

interface Photo {
  id: string;
  url: string;
  template?: string;
}

interface PhotoPreviewProps {
  photo: Photo;
  currentTemplate: string;
  onClose: () => void;
  onApplyTemplate: () => void;
  onDownload: (photo: Photo) => void;
  onResetTemplate: () => void;
}

export function PhotoPreview({
  photo,
  currentTemplate,
  onClose,
  onApplyTemplate,
  onDownload,
  onResetTemplate,
}: PhotoPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const template = templates.find(t => t.id === currentTemplate);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const frameWidth = template?.frame?.width || 0;
        canvas.width = img.width + frameWidth * 2;
        canvas.height = img.height + frameWidth * 2;

        if (ctx) {
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw frame background if exists
          if (template?.frame) {
            ctx.fillStyle = template.frame.color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          // Draw image
          ctx.save();
          
          // Apply filter if exists
          if (template?.filter) {
            ctx.filter = template.filter;
          }
          
          ctx.drawImage(img, frameWidth, frameWidth, img.width, img.height);
          ctx.restore();

          // Draw overlay if exists
          if (template?.overlay) {
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            
            if (template.overlay.type === 'gradient') {
              // Parse gradient colors (simplified)
              gradient.addColorStop(0, 'rgba(255,100,0,0.2)');  
              gradient.addColorStop(1, 'rgba(255,50,100,0.3)');
              ctx.fillStyle = gradient;
              ctx.fillRect(frameWidth, frameWidth, img.width, img.height);
            }
          }
        }
      };

      img.src = photo.url;
    }
  }, [photo.url, currentTemplate, template]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between z-10">
          <h2 className="font-semibold">Preview Foto</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex justify-center bg-muted rounded-lg p-4">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto rounded shadow-lg"
              style={{ maxHeight: '60vh' }}
            />
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={onApplyTemplate} className="gap-2">
              <Download className="size-4" />
              Terapkan Template
            </Button>
            
            <Button
              onClick={() => onDownload(photo)}
              variant="outline"
              className="gap-2"
            >
              <Download className="size-4" />
              Download
            </Button>

            {photo.template && (
              <Button
                onClick={onResetTemplate}
                variant="outline"
                className="gap-2"
              >
                <RotateCcw className="size-4" />
                Reset Template
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
