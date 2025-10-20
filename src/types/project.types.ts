export interface ProjectModule {
  id: string;
  name: string;
  designDays: number;
  frontendDays: number;
  backendDays: number;
  designPerformers: string[];
  developmentPerformers: string[];
  isEnabled: boolean;
}

export interface CSVRow {
  Module: string;
  'Design (days)': string | number;
  'Front-end (days)': string | number;
  'Back-end (days)': string | number;
  'Design Performers': string;
  'Development Performers': string;
}
