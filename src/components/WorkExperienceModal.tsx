import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import FormInput from './FormInput';
import { FormErrors } from '../types';

interface WorkExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: WorkExperience | null;
  onSave: (workData: {
    empresa: string;
    puesto: string;
    fecha_inicio: string;
    fecha_fin?: string;
    descripcion?: string;
    is_current_job: boolean;
  }) => void;
}

const WorkExperienceModal: React.FC<WorkExperienceModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    empresa: '',
    puesto: '',
    fecha_inicio: '',
    fecha_fin: '',
    descripcion: '',
    is_current_job: false
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        empresa: initialData.empresa,
        puesto: initialData.puesto,
        fecha_inicio: initialData.fecha_inicio,
        fecha_fin: initialData.fecha_fin || '',
        descripcion: initialData.descripcion || '',
        is_current_job: initialData.is_current_job
      });
    } else {
      setFormData({
        empresa: '',
        puesto: '',
        fecha_inicio: '',
        fecha_fin: '',
        descripcion: '',
        is_current_job: false
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    const today = new Date();

    if (!formData.empresa.trim()) {
      newErrors.empresa = 'La empresa es obligatoria';
    }

    if (!formData.puesto.trim()) {
      newErrors.puesto = 'El puesto es obligatorio';
    }

    if (!formData.fecha_inicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es obligatoria';
    } else if (new Date(formData.fecha_inicio) > today) {
      newErrors.fecha_inicio = 'La fecha de inicio no puede ser futura';
    }

    if (!formData.is_current_job && formData.fecha_fin) {
      if (new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
        newErrors.fecha_fin = 'La fecha de fin no puede ser anterior a la fecha de inicio';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSave = {
        ...formData,
        fecha_fin: formData.is_current_job ? undefined : formData.fecha_fin
      };
      await onSave(dataToSave);
      setFormData({
        empresa: '',
        puesto: '',
        fecha_inicio: '',
        fecha_fin: '',
        descripcion: '',
        is_current_job: false
      });
      onClose();
    } catch (error) {
      console.error('Error saving work experience:', error);
      setErrors({ submit: 'Error al guardar la experiencia laboral. Por favor, inténtalo de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: newValue,
      // Clear end date if current job is checked
      ...(name === 'is_current_job' && newValue ? { fecha_fin: '' } : {})
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleClose = () => {
    setFormData({
      empresa: '',
      puesto: '',
      fecha_inicio: '',
      fecha_fin: '',
      descripcion: '',
      is_current_job: false
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {initialData ? 'Editar Experiencia Laboral' : 'Añadir Experiencia Laboral'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Empresa"
            type="text"
            id="empresa"
            name="empresa"
            placeholder="Ej: Google"
            value={formData.empresa}
            onChange={handleChange}
            error={errors.empresa}
            required
          />

          <FormInput
            label="Puesto"
            type="text"
            id="puesto"
            name="puesto"
            placeholder="Ej: Desarrollador Full Stack"
            value={formData.puesto}
            onChange={handleChange}
            error={errors.puesto}
            required
          />

          <FormInput
            label="Fecha de inicio"
            type="date"
            id="fecha_inicio"
            name="fecha_inicio"
            value={formData.fecha_inicio}
            onChange={handleChange}
            error={errors.fecha_inicio}
            required
          />

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="is_current_job"
              name="is_current_job"
              checked={formData.is_current_job}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="is_current_job" className="ml-2 block text-sm text-gray-900">
              Trabajo actual
            </label>
          </div>

          {!formData.is_current_job && (
            <FormInput
              label="Fecha de finalización"
              type="date"
              id="fecha_fin"
              name="fecha_fin"
              value={formData.fecha_fin}
              onChange={handleChange}
              error={errors.fecha_fin}
            />
          )}

          <div className="mb-4">
            <label htmlFor="descripcion" className="form-label">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className="form-input min-h-[100px]"
              placeholder="Describe tus responsabilidades y logros..."
            />
          </div>
          
          {errors.submit && (
            <p className="text-red-500 text-sm mt-2">{errors.submit}</p>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkExperienceModal;