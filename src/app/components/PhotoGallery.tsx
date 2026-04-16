import { useState } from 'react';
import { Check, Download, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';

interface Photo {
  id: string;
  url: string;
  template?: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  onDeletePhoto: (id: string) => void;
  onSelectPhoto: (photo: Photo) => void;
  onDownloadSelected: (photoIds: string[]) => void;
  onDownloadSingle: (photo: Photo) => void;
}

export function PhotoGallery({
  photos,
  onDeletePhoto,
  onSelectPhoto,
  onDownloadSelected,
  onDownloadSingle,
}: PhotoGalleryProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === photos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds ( new Set ( photos . map ( p => p . id ))) ;  
    }
  };

  const handleDownloadSelected = () => {
    onDownloadSelected(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Belum ada foto. Ambil foto pertama Anda!</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={selectAll}
            className="gap-2"
          >
            <Check className="size-4" />
            {selectedIds.size === photos.length ? 'Hapus Semua Pilihan' : 'Pilih Semua'}
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} dari {photos.length} foto dipilih
          </span>
        </div>
        
        {selectedIds.size > 0 && (
          <Button
            onClick={handleDownloadSelected}
            className="gap-2"
            size="sm"
          >
            <Download className="size-4" />
            Download {selectedIds.size} Foto
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative group aspect-square bg-muted rounded-lg overflow-hidden border-2 transition-all"
            style={{
              borderColor: selectedIds.has(photo.id) ? 'hsl(var(--primary))' : 'transparent'
            }}
          >
            <img
              src={photo.url}
              alt="Captured"
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => onSelectPhoto(photo)}
            />
            
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="icon"
                variant="secondary"
                onClick={() => onDownloadSingle(photo)}
                className="size-10"
              >
                <Download className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                onClick={() => onDeletePhoto(photo.id)}
                className="size-10"
              >
                <Trash2 className="size-4" />
              </Button>  
            </div>

            <div className="absolute top-2 left-2 z-10">
              <Checkbox
                checked={selectedIds.has(photo.id)}
                onCheckedChange={() => toggleSelection(photo.id)}
                className="bg-white border-2"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
