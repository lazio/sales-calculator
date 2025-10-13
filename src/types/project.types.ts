export interface ProjectModule {
  id: string;
  name: string;
  isMVP: boolean;
  frontendDays: number;
  backendDays: number;
  performers: string[];
  isEnabled: boolean;
}

export interface CSVRow {
  Module: string;
  MVP: string;
  'Front-end': string;
  'Back-end': string;
  Performer: string;
}
