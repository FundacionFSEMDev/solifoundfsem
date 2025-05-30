import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { WorkExperience } from '../types';
import WorkExperienceModal from './WorkExperienceModal';

interface ExpLaboralProps {
  workExperience: WorkExperience[];
  onAddWorkExperience: (workData: Omit<WorkExperience, 'id'>) => Promise<void>;
  onUpdateWorkExperience: (id: string, workData: Omit<WorkExperience, 'id'>) => Promise<void>;
  onDeleteWorkExperience: (id: string) => Promise<void>;
}

const ExpLaboral: React.FC<ExpLaboralProps> = ({
  workExperience,
  onAddWorkExperience,
  onUpdateWorkExperience,
  onDeleteWorkExperience
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<WorkExperience | null>(null);

  const handleEdit = (exp: WorkExperience) => {
    setSelectedExperience(exp);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta experiencia laboral?')) {
      await onDeleteWorkExperience(id);
    }
  };

  const handleSave = async (workData: Omit<WorkExperience, 'id'>) => {
    if (selectedExperience) {
      await onUpdateWorkExperience(selectedExperience.id, workData);
    } else {
      await onAddWorkExperience(workData);
    }
    setIsModalOpen(false);
    setSelectedExperience(null);
  };

  return (
    <div className="space-y-6">
      <button 
        className="btn btn-secondary inline-flex items-center"
        onClick={() => {
          setSelectedExperience(null);
          setIsModalOpen(true);
        }}
      >
        <Plus size={16} className="mr-2" />
        Añadir experiencia
      </button>

      {workExperience.length === 0 ? (
        <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
          <p>No hay información de experiencia laboral disponible</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workExperience.map((exp) => (
            <div key={exp.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{exp.puesto}</h3>
                <div className="flex space-x-2">
                  <button 
                    className="p-1 hover:text-primary transition-colors"
                    onClick={() => handleEdit(exp)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    className="p-1 hover:text-red-500 transition-colors"
                    onClick={() => handleDelete(exp.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-gray-600">{exp.empresa}</p>
              <p className="text-sm text-gray-500">
                {new Date(exp.fecha_inicio).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
                {exp.is_current_job ? ' - Actual' : exp.fecha_fin ? ` - ${new Date(exp.fecha_fin).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}` : ''}
              </p>
              {exp.descripcion && (
                <div className="mt-2 text-gray-600 whitespace-pre-line">
                  {exp.descripcion}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <WorkExperienceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedExperience(null);
        }}
        onSave={handleSave}
        initialData={selectedExperience}
      />
    </div>
  );
};

export default ExpLaboral;