import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MultiSelect from '@/components/common/MultiSelect';

interface AddModuleFormProps {
  availablePerformers: string[];
  onSubmit: (moduleData: {
    name: string;
    designDays: number;
    frontendDays: number;
    backendDays: number;
    designPerformers: string[];
    developmentPerformers: string[];
  }) => void;
  onCancel: () => void;
}

export default function AddModuleForm({
  availablePerformers,
  onSubmit,
  onCancel
}: AddModuleFormProps) {
  const [name, setName] = useState('');
  const [designDays, setDesignDays] = useState<number | ''>('');
  const [frontendDays, setFrontendDays] = useState<number | ''>('');
  const [backendDays, setBackendDays] = useState<number | ''>('');
  const [designPerformers, setDesignPerformers] = useState<string[]>([]);
  const [developmentPerformers, setDevelopmentPerformers] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Module name is required';
    }

    const design = designDays === '' ? 0 : designDays;
    const frontend = frontendDays === '' ? 0 : frontendDays;
    const backend = backendDays === '' ? 0 : backendDays;

    if (design === 0 && frontend === 0 && backend === 0) {
      newErrors.days = 'At least one effort day should be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit({
      name: name.trim(),
      designDays: designDays === '' ? 0 : designDays,
      frontendDays: frontendDays === '' ? 0 : frontendDays,
      backendDays: backendDays === '' ? 0 : backendDays,
      designPerformers,
      developmentPerformers
    });

    // Reset form
    setName('');
    setDesignDays('');
    setFrontendDays('');
    setBackendDays('');
    setDesignPerformers([]);
    setDevelopmentPerformers([]);
    setErrors({});
  };

  return (
    <Card className="rounded-xl mb-2">
      <CardHeader className="pb-3">
        <CardTitle>Add New Module</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
        {/* Module Name */}
        <div>
          <Label className="mb-1">
            Module Name <span className="text-destructive">*</span>
          </Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., User Authentication"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Effort Days */}
        <div>
          <Label className="mb-1">Effort (days)</Label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground mb-1">Design</Label>
              <Input
                type="number"
                min="0"
                value={designDays}
                onChange={(e) => setDesignDays(Math.max(0, Number(e.target.value)))}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1">Frontend</Label>
              <Input
                type="number"
                min="0"
                value={frontendDays}
                onChange={(e) => setFrontendDays(Math.max(0, Number(e.target.value)))}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1">Backend</Label>
              <Input
                type="number"
                min="0"
                value={backendDays}
                onChange={(e) => setBackendDays(Math.max(0, Number(e.target.value)))}
              />
            </div>
          </div>
          {errors.days && (
            <p className="mt-1 text-sm text-destructive">{errors.days}</p>
          )}
        </div>

        {/* Design Performers */}
        {availablePerformers.length > 0 && (
          <MultiSelect
            options={availablePerformers}
            selected={designPerformers}
            onChange={setDesignPerformers}
            placeholder="Select design team..."
            label="Design Performers"
          />
        )}

        {/* Development Performers */}
        {availablePerformers.length > 0 && (
          <MultiSelect
            options={availablePerformers}
            selected={developmentPerformers}
            onChange={setDevelopmentPerformers}
            placeholder="Select development team..."
            label="Development Performers"
          />
        )}

        {availablePerformers.length === 0 && (
          <Alert>
            <AlertDescription>
              No performers available. Add rates first or performers will be created with default $1000 rate.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
          >
            Add Module
          </Button>
        </div>
      </form>
      </CardContent>
    </Card>
  );
}
