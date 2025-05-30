// Type definitions for the application

export interface FormInputProps {
  label: string;
  type: string;
  id: string;
  name: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
}

export interface FormData {
  [key: string]: string;
}

export interface UserProfile {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  created_at: string;
  nacionalidad?: string;
  residencia?: string;
  tipo_documento?: 'DNI' | 'NIE' | 'NIF';
  numero_documento?: string;
  situacion_laboral?: 'Trabajo' | 'Desempleado';
  cv_filename?: string;
  cv_updated_at?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  earned_at: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface Education {
  id: string;
  titulo: string;
  institucion: string;
  fecha_inicio: string;
  fecha_fin?: string;
  descripcion?: string;
}

export interface WorkExperience {
  id: string;
  empresa: string;
  puesto: string;
  fecha_inicio: string;
  fecha_fin?: string;
  descripcion?: string;
  is_current_job: boolean;
}

export interface CVFile {
  filename: string;
  lastUpdated: string;
}