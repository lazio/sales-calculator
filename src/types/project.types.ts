export interface ProjectModule {
  id: string;
  name: string;
  frontendDays: number;
  backendDays: number;
  performers: string[];
  isEnabled: boolean;
}

export interface CSVRow {
  Module: string;
  'Front-end': string;
  'Back-end': string;
  Performer: string;
}
