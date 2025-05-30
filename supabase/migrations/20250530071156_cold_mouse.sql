/*
  # Add Additional Personal Information Fields

  1. Changes
    - Add new columns to loggedusers table:
      - nacionalidad (text)
      - residencia (text)
      - tipo_documento (text with check constraint)
      - numero_documento (text)
      - situacion_laboral (text with check constraint)

  2. Purpose
    - Allow users to provide additional personal information
    - Ensure data consistency with check constraints
*/

ALTER TABLE loggedusers
ADD COLUMN nacionalidad text,
ADD COLUMN residencia text,
ADD COLUMN tipo_documento text CHECK (tipo_documento IN ('DNI', 'NIE', 'NIF')),
ADD COLUMN numero_documento text,
ADD COLUMN situacion_laboral text CHECK (situacion_laboral IN ('Trabajo', 'Desempleado'));