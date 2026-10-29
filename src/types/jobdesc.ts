export interface KPITarget {
  metric: string;
  target: string;
  weight: number; // percentage
  frequency: string;
}

export interface JobDescription {
  jobCode: string;
  title: string;
  division: string;
  level: 'Direksi / Eksekutif' | 'Manajemen Proyek' | 'Spesialis Ahli' | 'Teknis & Lapangan';
  reportsTo: string;
  purpose: string;
  responsibilities: {
    category: string;
    items: string[];
  }[];
  authorities: string[];
  kpiTargets: KPITarget[];
  qualifications: {
    education: string;
    certifications: string[];
    experience: string;
  };
}
