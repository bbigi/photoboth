import { useState } from 'react';
import { PhotoCapture } from './components/PhotoCapture';
import { PhotoGallery } from './components/PhotoGallery';
import { TemplateSelector } from './components/TemplateSelector';
import { PhotoPreview } from './components/PhotoPreview';
import { CollageCreator } from './components/CollageCreator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Camera, Images, Grid2x2 } from 'lucide-react';
import { templates } from './components/TemplateSelector';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';

interface Photo {
  id: string;
  url: string;
  template?: string;
}

export default function App() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('none');
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [activeTab, setActiveTab] = useState('capture');

  const handlePhotoCapture = (photoUrl: string) => {
    const newPhoto: Photo = {
      id: Date.now().toString(),
      url: photoUrl,
    };
    setPhotos(prev => [newPhoto, ...prev]);
    toast.success('Foto berhasil diambil!');
    setActiveTab('gallery');
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
    toast.success('Foto berhasil dihapus');
  };

  const handleSelectPhoto = (photo: Photo) => {
    setPreviewPhoto(photo);
    if (photo.template) {
      setSelectedTemplate(photo.template);
    }
  };

  const applyTemplateToCanvas = (photoUrl: string, templateId: string): Promise<string> => {
    return new Promise((resolve) => {
      const template = templates.find(t => t.id === templateId);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const frameWidth = template?.frame?.width || 0;
        canvas.width = img.width + frameWidth * 2;
        canvas.height = img.height + frameWidth * 2;

        if (ctx) {
          // Draw frame background
          if (template?.frame) {
            ctx.fillStyle = template.frame.color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          // Draw image with filter
          ctx.save();
          if (template?.filter) {
            ctx.filter = template.filter;
          }
          ctx.drawImage(img, frameWidth, frameWidth, img.width, img.height);
          ctx.restore();

          // Draw overlay
          if (template?.overlay) {
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, 'rgba(255,100,0,0.2)');
            gradient.addColorStop(1, 'rgba(255,50,100,0.3)');
            ctx.fillStyle = gradient;
            ctx.fillRect(frameWidth, frameWidth, img.width, img.height);
          }
        }

        resolve(canvas.toDataURL('image/png'));
      };

      img.src = photoUrl;
    });
  };

  const handleApplyTemplate = async () => {
    if (previewPhoto && selectedTemplate !== 'none') {
      const processedUrl = await applyTemplateToCanvas(previewPhoto.url, selectedTemplate);
      
      setPhotos(prev =>
        prev.map(p =>
          p.id === previewPhoto.id
            ? { ...p, url: processedUrl, template: selectedTemplate }
            : p
        )
      );
      
      toast.success('Template berhasil diterapkan!');
      setPreviewPhoto(null);
    } else if (selectedTemplate === 'none') {
      toast.info('Pilih template terlebih dahulu');
    }
  };

  const handleResetTemplate = () => {
    if (previewPhoto) {
      // In a real app, we'd store the original photo separately
      toast.info('Fitur reset akan menghapus template yang diterapkan');
    }
  };

  const downloadPhoto = async (photo: Photo) => {
    let urlToDownload = photo.url;

    // Apply template if selected and different from current
    if (selectedTemplate !== 'none' && selectedTemplate !== photo.template) {
      urlToDownload = await applyTemplateToCanvas(photo.url, selectedTemplate);
    }

    const link = document.createElement('a');
    link.href = urlToDownload;
    link.download = `photo-${photo.id}.png`;
    link.click();
    
    toast.success('Foto berhasil didownload!');
  };

  const downloadSelectedPhotos = async (photoIds: string[]) => {
    const selectedPhotos = photos.filter(p => photoIds.includes(p.id));
    
    for (const photo of selectedPhotos) {
      let urlToDownload = photo.url;
      
      // Apply current template if selected
      if (selectedTemplate !== 'none' && selectedTemplate !== photo.template) {
        urlToDownload = await applyTemplateToCanvas(photo.url, selectedTemplate);
      }
      
      const link = document.createElement('a');
      link.href = urlToDownload;
      link.download = `photo-${photo.id}.png`;
      link.click();
      
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    toast.success(`${selectedPhotos.length} foto berhasil didownload!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Photo Booth Interaktif</h1>
          <p className="text-muted-foreground">
            Ambil foto, pilih template, dan download hasil karya Anda
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="capture" className="gap-2">
              <Camera className="size-4" />
              <span className="hidden sm:inline">Ambil Foto</span>
              <span className="sm:hidden">Kamera</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2">
              <Images className="size-4" />
              <span className="hidden sm:inline">Galeri</span>
              <span className="sm:hidden">Foto</span>
              {photos.length > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  {photos.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="collage" className="gap-2">
              <Grid2x2 className="size-4" />
              <span className="hidden sm:inline">Kolase</span>
              <span className="sm:hidden">Kolase</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="capture" className="space-y-6">
            <PhotoCapture onPhotoCapture={handlePhotoCapture} />
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onSelectTemplate={setSelectedTemplate}
            />
            
            <PhotoGallery
              photos={photos}
              onDeletePhoto={handleDeletePhoto}
              onSelectPhoto={handleSelectPhoto}
              onDownloadSelected={downloadSelectedPhotos}
              onDownloadSingle={downloadPhoto}
            />
          </TabsContent>

          <TabsContent value="collage" className="space-y-6">
            <CollageCreator availablePhotos={photos} />
          </TabsContent>
        </Tabs>
      </div>

      {previewPhoto && (
        <PhotoPreview
          photo={previewPhoto}
          currentTemplate={selectedTemplate}
          onClose={() => setPreviewPhoto(null)}
          onApplyTemplate={handleApplyTemplate}
          onDownload={downloadPhoto}
          onResetTemplate={handleResetTemplate}
        />
      )}

      <Toaster />
    </div>
  );
}