import { Check } from 'lucide-react';

export interface Template {
  id: string;
  name: string;
  frame?: {
    color: string;
    width: number;
  };
  filter ?: string;  
  overlay?: {
    type: 'gradient' | 'pattern';
    value: string;
  };
}

const templates: Template[] = [
  {
    id: 'none',
    name: 'Tanpa Template',
  },
  {
    id: 'classic-white',
    name: 'Bingkai Putih',
    frame: {
      color: '#ffffff',
      width: 20,
    },
  },
  {
    id: 'classic-black',
    name: 'Bingkai Hitam',
    frame: {
      color: '#000000',
      width: 20,
    },
  },
  {
    id: 'polaroid',
    name: 'Polaroid',
    frame: {
      color: '#f5f5f5',
      width: 15,
    },
  },
  {
    id: 'gold-frame',
    name: 'Bingkai Emas',
    frame: {
      color: '#FFD700',
      width: 25,
    },
  },
  {
    id: 'vintage',
    name: 'Vintage',
    filter: 'sepia(80%) contrast(110%)',
  },
  {
    id: 'bw',
    name: 'Hitam Putih',
    filter: 'grayscale(100%)',
  },
  {
    id: 'cool',
    name: 'Cool',
    filter: 'hue-rotate(180deg) saturate(120%)',
  },
  {
    id: 'warm',
    name: 'Warm',
    filter: 'sepia(40%) saturate(150%)',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    overlay: {
      type: 'gradient',
      value: 'linear-gradient(to bottom, rgba(255,100,0,0.2), rgba(255,50,100,0.3))',
    },
  },
];

interface TemplateSelectorProps {
  selectedTemplate: string;  
  onSelectTemplate: (templateId: string) => void;
}

export function TemplateSelector({ selectedTemplate, onSelectTemplate }: TemplateSelectorProps) {
  return (
    <div className="w-full">
      <h3 className="font-semibold mb-3">Pilih Template</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template.id)}
            className="relative p-3 rounded-lg border-2 transition-all hover:bg-accent"
            style={{
              borderColor: selectedTemplate === template.id ? 'hsl(var(--primary))' : 'hsl(var(--border))',
            }}
          >
            <div className="aspect-square rounded bg-gradient-to-br from-gray-200 to-gray-300 mb-2 flex items-center justify-center overflow-hidden">
              <div
                className="w-full h-full"  
                style={{
                  ...(template.frame && {
                    border: `${template.frame.width}px solid ${template.frame.color}`,
                    boxSizing: 'border-box',
                  }),
                  ...(template.filter && {
                    filter: template.filter,  
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }),
                  ...(template.overlay && {
                    background: template.overlay.value,
                  }),
                }}
              />
            </div>
            <p className="text-xs font-medium text-center truncate">{template.name}</p>
            
            {selectedTemplate === template.id && (
              <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                <Check className="size-3" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export { templates };
