import { useRef, useState } from 'react';
import Papa from 'papaparse';
import { CSVRow, ProjectModule } from '@/types/project.types';
import { validateCSVRow, csvRowToModule, ValidationError } from '@/utils/validation';

interface CSVImporterProps {
  onImport: (modules: ProjectModule[]) => void;
}

export default function CSVImporter({ onImport }: CSVImporterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const parseCSV = (file: File) => {
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          // Validate and transform CSV rows
          const modules: ProjectModule[] = results.data.map((row, index) => {
            const validatedRow = validateCSVRow(row, index);
            return csvRowToModule(validatedRow, index);
          });

          if (modules.length === 0) {
            setError('No valid data found in CSV file');
            setIsLoading(false);
            return;
          }

          onImport(modules);
          setSuccessMessage(`Successfully imported ${modules.length} module${modules.length > 1 ? 's' : ''}`);
          setIsLoading(false);

          // Clear success message after 3 seconds
          setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
          if (err instanceof ValidationError) {
            setError(err.message);
          } else {
            setError('Failed to parse CSV file. Please check the format.');
          }
          setIsLoading(false);
          console.error('CSV parsing error:', err);
        }
      },
      error: (err) => {
        setError(`Error reading file: ${err.message}`);
        setIsLoading(false);
      },
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setError('Please upload a CSV file');
        return;
      }
      parseCSV(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setError('Please upload a CSV file');
        return;
      }
      parseCSV(file);
    }
  };

  const downloadTemplate = () => {
    const template = `Module,Design (days),Front-end (days),Back-end (days),Design Performers,Development Performers
Authentication,3,5,8,UI Designer,"Frontend Developer, Backend Developer"
Dashboard,4.5,10.5,6.5,UI Designer,"Frontend Developer, Backend Developer, QA Engineer"
User Profile,2,4,3,"UI Designer, UX Designer","Frontend Developer, Backend Developer"`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Choose CSV File'
            )}
          </button>
        </div>

        <p className="mt-2 text-sm text-gray-600">or drag and drop</p>

        <button
          type="button"
          onClick={downloadTemplate}
          className="mt-3 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Sample CSV Template
        </button>

        <p className="mt-2 text-xs text-gray-500">
          Required columns: Module, Design (days), Front-end (days), Back-end (days), Design Performers, Development Performers
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Decimal format: Both dot (2.5) and comma (2,5) are supported
        </p>
      </div>

      {successMessage && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="ml-2 text-sm text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="ml-2 text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
