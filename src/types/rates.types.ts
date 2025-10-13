export interface RateConfig {
  role: string;
  monthlyRate: number;
}

export const DEFAULT_RATES: RateConfig[] = [
  { role: 'Frontend Developer', monthlyRate: 8000 },
  { role: 'Backend Developer', monthlyRate: 8000 },
  { role: 'QA Engineer', monthlyRate: 6000 },
  { role: 'Project Manager', monthlyRate: 10000 },
];

export const STORAGE_KEY = 'quote-calculator-rates';
