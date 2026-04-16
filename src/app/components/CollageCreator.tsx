import { useState, useRef, useEffect } from 'react';
import { Download, X, Plus, Code, Terminal, Cpu, Binary } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface Photo {
  id: string;
  url: string;
  template?: string;
}

interface CollageTemplate {
  id: string;
  name: string;
  bgColor: string;
  accentColor: string;
  theme: 'classic' | 'code-dark' | 'code-light' | 'matrix' | 'terminal';
}

const collageTemplates: CollageTemplate[] = [
  {
    id: 'classic',
    name: 'Klasik',
    bgColor: '#ffffff',
    accentColor: '#e5e5e5',
    theme: 'classic',
  },
  {
    id: 'code-dark',
    name: 'Dark Code',
    bgColor: '#1e1e1e',
    accentColor: '#007acc',
    theme: 'code-dark',
  },
  {
    id: 'code-light',
    name: 'Light Code',
    bgColor: '#f5f5f5',
    accentColor: '#0066cc',
    theme: 'code-light',
  },
  {
    id: 'matrix',
    name: 'Matrix',
    bgColor: '#000000',
    accentColor: '#00ff00',
    theme: 'matrix',
  },
  {
    id: 'terminal',
    name: 'Terminal',
    bgColor: '#0c0c0c',
    accentColor: '#00ff41',
    theme: 'terminal',
  },
];

interface CollageCreatorProps {
  availablePhotos: Photo[];
}

export function CollageCreator({ availablePhotos }: CollageCreatorProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('code-dark');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [collageUrl, setCollageUrl] = useState<string>('');

  useEffect(() => {
    if (selectedPhotos.length === 4) {
      generateCollage();
    }
  }, [selectedPhotos, selectedTemplate]);

  const handleSelectPhoto = (photo: Photo) => {
    if (selectedPhotos.find(p => p.id === photo.id)) {
      setSelectedPhotos(prev => prev.filter(p => p.id !== photo.id));
      return;
    }

    if (selectedPhotos.length < 4) {
      setSelectedPhotos(prev => [...prev, photo]);
    } else {
      toast.info('Maksimal 4 foto untuk kolase');
    }
  };

  const generateCollage = async () => {
    if (selectedPhotos.length !== 4 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const template = collageTemplates.find(t => t.id === selectedTemplate) || collageTemplates[0];

    // Load all images first
    const images = await Promise.all(
      selectedPhotos.map(photo => {
        return new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = photo.url;
        });
      })
    );

    // Set canvas size - each photo will be same width, stacked vertically
    const photoWidth = 800; // Fixed width for consistency
    const photoHeight = 600; // Fixed height for each photo
    const spacing = 20; // Space between photos
    const padding = 60; // Padding around the collage
    const sidebarWidth = 100; // Width for decorative sidebar

    canvas.width = photoWidth + padding * 2 + sidebarWidth;
    canvas.height = photoHeight * 4 + spacing * 3 + padding * 2;

    // Fill background
    ctx.fillStyle = template.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw decorative sidebar based on theme
    drawITSidebar(ctx, template, canvas.height, sidebarWidth);

    // Draw header
    drawITHeader(ctx, template, photoWidth + sidebarWidth, padding);

    // Draw each photo
    images.forEach((img, index) => {
      const y = padding + 60 + (photoHeight + spacing) * index;
      const x = padding + sidebarWidth;
      
      // Calculate aspect ratio to fit and crop
      const imgAspect = img.width / img.height;
      const targetAspect = photoWidth / photoHeight;
      
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      
      if (imgAspect > targetAspect) {
        // Image is wider, crop width
        sw = img.height * targetAspect;
        sx = (img.width - sw) / 2;
      } else {
        // Image is taller, crop height
        sh = img.width / targetAspect;
        sy = (img.height - sh) / 2;
      }

      // Draw photo border/frame with IT theme
      ctx.fillStyle = template.accentColor;
      ctx.fillRect(x - 8, y - 8, photoWidth + 16, photoHeight + 16);
      
      ctx.drawImage(
        img,
        sx, sy, sw, sh, // Source
        x, y, photoWidth, photoHeight // Destination
      );

      // Draw photo number/label
      ctx.fillStyle = template.accentColor;
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`[${index + 1}]`, x - 60, y + photoHeight / 2);
    });

    // Draw footer
    drawITFooter(ctx, template, canvas.width, canvas.height, padding);

    const url = canvas.toDataURL('image/png');
    setCollageUrl(url);
    toast.success('Kolase berhasil dibuat!');
  };

  const drawITSidebar = (ctx: CanvasRenderingContext2D, template: CollageTemplate, height: number, width: number) => {
    ctx.fillStyle = template.theme === 'classic' ? '#f0f0f0' : template.accentColor + '20';
    ctx.fillRect(0, 0, width, height);

    // Draw binary or code symbols
    ctx.fillStyle = template.accentColor;
    ctx.font = 'bold 14px monospace';
    
    const symbols = template.theme === 'matrix' || template.theme === 'terminal' 
      ? ['0', '1', '0', '1', '1', '0', '1', '0']
      : ['{', '}', '<', '>', '(', ')', '[', ']'];
    
    for (let i = 0; i < 30; i++) {
      const symbol = symbols[i % symbols.length];
      const y = 40 + (i * 80);
      ctx.fillText(symbol, width / 2 - 7, y);
    }
  };

  const drawITHeader = (ctx: CanvasRenderingContext2D, template: CollageTemplate, width: number, y: number) => {
    ctx.fillStyle = template.accentColor;
    ctx.font = 'bold 32px monospace';
    const title = '< TECH KIDS />';
    const titleWidth = ctx.measureText(title).width;
    ctx.fillText(title, (width - titleWidth) / 2 + 50, y + 30);

    // Draw decorative line
    ctx.strokeStyle = template.accentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, y + 45);
    ctx.lineTo(width - 50, y + 45);
    ctx.stroke();

    // Draw code comment style subtitle
    ctx.font = '16px monospace';
    ctx.fillStyle = template.theme === 'code-dark' || template.theme === 'matrix' || template.theme === 'terminal'
      ? template.accentColor + 'cc'
      : template.accentColor;
    const subtitle = '// Future Programmers';
    const subtitleWidth = ctx.measureText(subtitle).width;
    ctx.fillText(subtitle, (width - subtitleWidth) / 2 + 50, y + 55);
  };

  const drawITFooter = (ctx: CanvasRenderingContext2D, template: CollageTemplate, width: number, height: number, padding: number) => {
    const y = height - padding + 20;
    
    // Draw decorative elements
    ctx.fillStyle = template.accentColor;
    ctx.font = 'bold 18px monospace';
    
    // Draw terminal-style prompt
    const footerText = template.theme === 'terminal' || template.theme === 'matrix'
      ? `$ echo "Keep Coding!" | cowsay`
      : 'console.log("Keep Coding!");';
    
    const textWidth = ctx.measureText(footerText).width;
    ctx.fillText(footerText, (width - textWidth) / 2, y);

    // Draw decorative icons/symbols
    const iconSymbols = ['⚡', '💻', '🚀', '⭐'];
    ctx.font = '24px Arial';
    iconSymbols.forEach((icon, i) => {
      ctx.fillText(icon, 120 + i * 60, y + 25);
    });
  };

  const handleDownload = () => {
    if (collageUrl) {
      const link = document.createElement('a');
      link.href = collageUrl;
      link.download = `collage-${Date.now()}.png`;
      link.click();
      toast.success('Kolase berhasil didownload!');
    }
  };

  const handleReset = () => {
    setSelectedPhotos([]);
    setCollageUrl('');
  };

  if (availablePhotos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Ambil foto terlebih dahulu untuk membuat kolase</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 rounded-lg p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Code className="size-5" />
          Pilih Template Tema IT
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
          {collageTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className="relative p-3 rounded-lg border-2 transition-all hover:scale-105"
              style={{
                borderColor: selectedTemplate === template.id ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                backgroundColor: template.bgColor,
              }}
            >
              <div className="aspect-[3/4] rounded flex flex-col items-center justify-center gap-2 overflow-hidden">
                {template.theme === 'code-dark' && <Terminal className="size-8" style={{ color: template.accentColor }} />}
                {template.theme === 'code-light' && <Code className="size-8" style={{ color: template.accentColor }} />}
                {template.theme === 'matrix' && <Binary className="size-8" style={{ color: template.accentColor }} />}
                {template.theme === 'terminal' && <Cpu className="size-8" style={{ color: template.accentColor }} />}
                {template.theme === 'classic' && <div className="text-2xl">📸</div>}
                
                <div className="text-xs font-mono" style={{ color: template.theme === 'classic' ? '#000' : template.accentColor }}>
                  {template.name}
                </div>
              </div>
            </button>
          ))}
        </div>

        <h3 className="font-semibold mb-3">Pilih 4 Foto untuk Kolase</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex gap-2">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="w-16 h-16 rounded border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden"
              >
                {selectedPhotos[index] ? (
                  <img
                    src={selectedPhotos[index].url}
                    alt={`Selected ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Plus className="size-6 text-muted-foreground/50" />
                )}
              </div>
            ))}
          </div>
          <div className="flex-1 text-sm text-muted-foreground">
            {selectedPhotos.length} dari 4 foto dipilih
          </div>
          {selectedPhotos.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              <X className="size-4 mr-2" />
              Reset
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {availablePhotos.map((photo) => {
            const isSelected = selectedPhotos.find(p => p.id === photo.id);
            return (
              <button
                key={photo.id}
                onClick={() => handleSelectPhoto(photo)}
                className="relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105"
                style={{
                  borderColor: isSelected ? 'hsl(var(--primary))' : 'transparent',
                  opacity: isSelected ? 1 : selectedPhotos.length >= 4 ? 0.5 : 1,
                }}
              >
                <img
                  src={photo.url}
                  alt="Photo"
                  className="w-full h-full object-cover"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      {selectedPhotos.findIndex(p => p.id === photo.id) + 1}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {collageUrl && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Code className="size-5" />
              Preview Kolase Tema IT
            </h3>
            <Button onClick={handleDownload} className="gap-2">
              <Download className="size-4" />
              Download Kolase
            </Button>
          </div>
          
          <div className="bg-muted rounded-lg p-6 flex justify-center">
            <img
              src={collageUrl}
              alt="Collage preview"
              className="max-w-full h-auto rounded shadow-2xl"
              style={{ maxHeight: '70vh' }}
            />
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}