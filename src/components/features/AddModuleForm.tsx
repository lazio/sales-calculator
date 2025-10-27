import { useState } from 'react';
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
    <div className="bg-gray-50 border-2 border-primary-200 rounded-lg p-4 mb-4 animate-fade-in">
      <h4 className="text-base font-semibold text-gray-800 mb-3">Add New Module</h4>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Module Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Module Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., User Authentication"
            className={`w-full px-3 py-2 border-2 rounded-lg outline-none transition-all ${
              errors.name
                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Effort Days */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Effort (days)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Design</label>
              <input
                type="number"
                min="0"
                value={designDays}
                onChange={(e) => setDesignDays(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Frontend</label>
              <input
                type="number"
                min="0"
                value={frontendDays}
                onChange={(e) => setFrontendDays(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Backend</label>
              <input
                type="number"
                min="0"
                value={backendDays}
                onChange={(e) => setBackendDays(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              />
            </div>
          </div>
          {errors.days && (
            <p className="mt-1 text-sm text-red-600">{errors.days}</p>
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
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              No performers available. Add rates first or performers will be created with default $1000 rate.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Add Module
          </button>
        </div>
      </form>
    </div>
  );
}
