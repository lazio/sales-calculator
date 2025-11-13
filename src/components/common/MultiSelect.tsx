import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, X } from 'lucide-react';

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
}

export default function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select...',
  label
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchTerm('');
    }
  };

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      {label && (
        <Label className="mb-1">{label}</Label>
      )}

      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            type="button"
            className="w-full justify-between"
          >
            <span className={selected.length === 0 ? 'text-muted-foreground' : ''}>
              {selected.length === 0
                ? placeholder
                : `${selected.length} selected`}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          {/* Search Input */}
          <div className="p-2 border-b">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="h-8 text-sm"
              autoFocus
            />
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map(option => (
                <label
                  key={option}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer"
                >
                  <Checkbox
                    checked={selected.includes(option)}
                    onCheckedChange={() => toggleOption(option)}
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected Items Display */}
      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selected.map(item => (
            <Badge
              key={item}
              variant="secondary"
              className="inline-flex items-center gap-1"
            >
              {item}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(item);
                }}
                className="hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
