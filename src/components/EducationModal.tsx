import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import FormInput from './FormInput';
import { FormErrors } from '../types';

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Education | null;
  onSave: (educationData: {
    titulo: string;
    institucion: string;
    fecha_inicio: string;
    fecha_fin?: string;
    descripcion?: string;
  }) => void;
}

const EducationModal: React.FC<EducationModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    institucion: '',
    fecha_inicio: '',
    fecha_fin: '',
    descripcion: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        titulo: initialData.titulo,
        institucion: initialData.institucion,
        fecha_inicio: initialData.fecha_inicio,
        fecha_fin: initialData.fecha_fin || '',
        descripcion: initialData.descripcion || ''
      });
    } else {
      setFormData({
        titulo: '',
        institucion: '',
        fecha_inicio: '',
        fecha_fin: '',
        descripcion: ''
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    const today = new Date();

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es obligatorio';
    }

    if (!formData.institucion.trim()) {
      newErrors.institucion = 'La institución es obligatoria';
    }

    if (!formData.fecha_inicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es obligatoria';
    } else if (new Date(formData.fecha_inicio) > today) {
      newErrors.fecha_inicio = 'La fecha de inicio no puede ser futura';
    }

    if (formData.fecha_fin && new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
      newErrors.fecha_fin = 'La fecha de fin no puede ser anterior a la fecha de inicio';
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
      await onSave(formData);
      setFormData({
        titulo: '',
        institucion: '',
        fecha_inicio: '',
        fecha_fin: '',
        descripcion: ''
      });
      onClose();
    } catch (error) {
      console.error('Error saving education:', error);
      setErrors({ submit: 'Error al guardar la formación. Por favor, inténtalo de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      titulo: '',
      institucion: '',
      fecha_inicio: '',
      fecha_fin: '',
      descripcion: ''
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
          {initialData ? 'Editar Formación' : 'Añadir Formación'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Título"
            type="text"
            id="titulo"
            name="titulo"
            placeholder="Ej: Grado en Ingeniería Informática"
            value={formData.titulo}
            onChange={handleChange}
            error={errors.titulo}
            required
          />

          <FormInput
            label="Institución"
            type="text"
            id="institucion"
            name="institucion"
            placeholder="Ej: Universidad de Madrid"
            value={formData.institucion}
            onChange={handleChange}
            error={errors.institucion}
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

          <FormInput
            label="Fecha de finalización"
            type="date"
            id="fecha_fin"
            name="fecha_fin"
            value={formData.fecha_fin}
            error={errors.fecha_fin}
            onChange={handleChange}
          />

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
              placeholder="Describe tu formación..."
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

export default EducationModal;