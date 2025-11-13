import { useRef, useState } from 'react';
import Papa from 'papaparse';
import { CSVRow, ProjectModule } from '@/types/project.types';
import { validateCSVRow, csvRowToModule, ValidationError } from '@/utils/validation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

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
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />

        <div className="mt-4">
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Choose CSV File
              </>
            )}
          </Button>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">or drag and drop</p>

        <Button
          type="button"
          variant="link"
          onClick={downloadTemplate}
          className="mt-3"
        >
          <Download className="h-4 w-4" />
          Download Sample CSV Template
        </Button>

        <div className="mt-4 space-y-1">
          <p className="text-xs text-muted-foreground">
            Required columns: Module, Design (days), Front-end (days), Back-end (days), Design Performers, Development Performers
          </p>
          <p className="text-xs text-muted-foreground">
            Decimal format: Both dot (2.5) and comma (2,5) are supported
          </p>
        </div>
      </div>

      {successMessage && (
        <Alert className="border-green-600 dark:border-green-400">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-600 dark:text-green-400">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
