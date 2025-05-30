import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Education } from '../types';
import EducationModal from './EducationModal';

interface FormacionProps {
  education: Education[];
  onAddEducation: (educationData: Omit<Education, 'id'>) => Promise<void>;
  onUpdateEducation: (id: string, educationData: Omit<Education, 'id'>) => Promise<void>;
  onDeleteEducation: (id: string) => Promise<void>;
}

const Formacion: React.FC<FormacionProps> = ({
  education,
  onAddEducation,
  onUpdateEducation,
  onDeleteEducation
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState<Education | null>(null);

  const handleEdit = (edu: Education) => {
    setSelectedEducation(edu);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta formación?')) {
      await onDeleteEducation(id);
    }
  };

  const handleSave = async (educationData: Omit<Education, 'id'>) => {
    if (selectedEducation) {
      await onUpdateEducation(selectedEducation.id, educationData);
    } else {
      await onAddEducation(educationData);
    }
    setIsModalOpen(false);
    setSelectedEducation(null);
  };

  return (
    <div className="space-y-6">
      <button 
        className="btn btn-secondary inline-flex items-center"
        onClick={() => {
          setSelectedEducation(null);
          setIsModalOpen(true);
        }}
      >
        <Plus size={16} className="mr-2" />
        Añadir formación
      </button>

      {education.length === 0 ? (
        <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
          <p>No hay información de formación disponible</p>
        </div>
      ) : (
        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{edu.titulo}</h3>
                <div className="flex space-x-2">
                  <button 
                    className="p-1 hover:text-primary transition-colors"
                    onClick={() => handleEdit(edu)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    className="p-1 hover:text-red-500 transition-colors"
                    onClick={() => handleDelete(edu.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-gray-600">{edu.institucion}</p>
              <p className="text-sm text-gray-500">
                {new Date(edu.fecha_inicio).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
                {edu.fecha_fin ? ` - ${new Date(edu.fecha_fin).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}` : ' - Actual'}
              </p>
              {edu.descripcion && (
                <div className="mt-2 text-gray-600 whitespace-pre-line">
                  {edu.descripcion}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <EducationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEducation(null);
        }}
        onSave={handleSave}
        initialData={selectedEducation}
      />
    </div>
  );
};

export default Formacion;