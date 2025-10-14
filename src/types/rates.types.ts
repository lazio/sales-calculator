export interface RateConfig {
  role: string;
  monthlyRate: number;
}

export const DEFAULT_RATES: RateConfig[] = [
  { role: 'Frontend Developer', monthlyRate: 1000 },
  { role: 'Backend Developer', monthlyRate: 1000 },
  { role: 'QA Engineer', monthlyRate: 1000 },
  { role: 'Project Manager', monthlyRate: 1000 },
];

export const STORAGE_KEY = 'quote-calculator-rates';
