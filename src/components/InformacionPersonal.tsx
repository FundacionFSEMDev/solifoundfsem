import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Pencil, FileUp, X } from 'lucide-react';
import { UserProfile, Achievement, CVFile } from '../types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface InformacionPersonalProps {
  userProfile: UserProfile;
  cvFile: CVFile | null;
  onUpdateProfile: (updatedProfile: Partial<UserProfile>) => void;
  onUpdateCV: (cvFile: CVFile | null) => void;
}

const InformacionPersonal: React.FC<InformacionPersonalProps> = ({
  userProfile,
  cvFile,
  onUpdateProfile,
  onUpdateCV
}) => {
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [personalFormData, setPersonalFormData] = useState({
    nacionalidad: '',
    residencia: '',
    tipo_documento: '',
    numero_documento: '',
    situacion_laboral: ''
  });

  useEffect(() => {
    setPersonalFormData({
      nacionalidad: userProfile.nacionalidad || '',
      residencia: userProfile.residencia || '',
      tipo_documento: userProfile.tipo_documento || '',
      numero_documento: userProfile.numero_documento || '',
      situacion_laboral: userProfile.situacion_laboral || ''
    });
  }, [userProfile]);

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPersonalFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('loggedusers')
        .update(personalFormData)
        .eq('user_id', user.id);

      if (error) throw error;

      onUpdateProfile(personalFormData);
      setIsEditingPersonal(false);
    } catch (error) {
      console.error('Error updating personal info:', error);
      alert('Error al actualizar la información personal. Por favor, inténtalo de nuevo.');
    }
  };

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor, sube un archivo PDF');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo no debe superar los 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const reader = new FileReader();
      reader.onload = async () => {
        const binaryStr = reader.result;
        
        const { error } = await supabase
          .from('loggedusers')
          .update({
            cv_data: binaryStr,
            cv_filename: file.name,
            cv_updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;

        onUpdateCV({
          filename: file.name,
          lastUpdated: new Date().toISOString()
        });
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error uploading CV:', error);
      alert('Error al subir el CV. Por favor, inténtalo de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveCV = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('loggedusers')
        .update({
          cv_data: null,
          cv_filename: null,
          cv_updated_at: null
        })
        .eq('user_id', user.id);

      if (error) throw error;
      onUpdateCV(null);
    } catch (error) {
      console.error('Error removing CV:', error);
      alert('Error al eliminar el CV. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <>
      {/* CV Upload Section */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Curriculum Vitae</h2>
          {cvFile && (
            <button
              onClick={handleRemoveCV}
              className="text-red-500 hover:text-red-600 transition-colors"
              title="Eliminar CV"
            >
              <X size={20} />
            </button>
          )}
        </div>
        
        {cvFile ? (
          <div className="mt-4">
            <div className="flex items-center space-x-4">
              <FileUp size={24} className="text-primary" />
              <div>
                <p className="font-medium">{cvFile.filename}</p>
                <p className="text-sm text-gray-500">
                  Actualizado: {new Date(cvFile.lastUpdated).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
            <label className="btn btn-secondary mt-4 cursor-pointer inline-block">
              <input
                type="file"
                accept=".pdf"
                onChange={handleCVUpload}
                className="hidden"
              />
              Actualizar CV
            </label>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-gray-600 mb-4">
              Sube tu CV en formato PDF (máximo 5MB)
            </p>
            <label className={`btn btn-primary cursor-pointer inline-block ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <input
                type="file"
                accept=".pdf"
                onChange={handleCVUpload}
                disabled={isUploading}
                className="hidden"
              />
              {isUploading ? 'Subiendo...' : 'Subir CV'}
            </label>
          </div>
        )}
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Información Personal</h2>
          <button
            onClick={() => setIsEditingPersonal(true)}
            className="btn btn-secondary inline-flex items-center"
          >
            <Pencil size={16} className="mr-2" />
            Editar información
          </button>
        </div>

        {!isEditingPersonal && (!userProfile.nacionalidad || !userProfile.residencia || !userProfile.tipo_documento || !userProfile.numero_documento || !userProfile.situacion_laboral) && (
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md mb-6">
            Tienes datos por rellenar, por favor, actualiza el perfil haciendo click en "Editar información"
          </div>
        )}

        {isEditingPersonal ? (
          <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Nacionalidad</label>
                <input
                  type="text"
                  name="nacionalidad"
                  value={personalFormData.nacionalidad}
                  onChange={handlePersonalInfoChange}
                  className="form-input"
                  placeholder="Ej: Española"
                />
              </div>

              <div>
                <label className="form-label">Residencia actual</label>
                <input
                  type="text"
                  name="residencia"
                  value={personalFormData.residencia}
                  onChange={handlePersonalInfoChange}
                  className="form-input"
                  placeholder="Ej: Madrid"
                />
              </div>

              <div>
                <label className="form-label">Tipo de Documento</label>
                <select
                  name="tipo_documento"
                  value={personalFormData.tipo_documento}
                  onChange={handlePersonalInfoChange}
                  className="form-input"
                >
                  <option value="">Seleccionar...</option>
                  <option value="DNI">DNI</option>
                  <option value="NIE">NIE</option>
                  <option value="NIF">NIF</option>
                </select>
              </div>

              <div>
                <label className="form-label">Nº de documento</label>
                <input
                  type="text"
                  name="numero_documento"
                  value={personalFormData.numero_documento}
                  onChange={handlePersonalInfoChange}
                  className="form-input"
                  placeholder="Ej: 12345678A"
                />
              </div>

              <div>
                <label className="form-label">Situación Laboral</label>
                <select
                  name="situacion_laboral"
                  value={personalFormData.situacion_laboral}
                  onChange={handlePersonalInfoChange}
                  className="form-input"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Trabajo">Trabajo</option>
                  <option value="Desempleado">Desempleado</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setIsEditingPersonal(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-sm text-gray-500">Nombre completo</p>
                <p className="font-medium">{`${userProfile.nombre} ${userProfile.apellido}`}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Correo electrónico</p>
                <p className="font-medium">{userProfile.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="font-medium">{userProfile.telefono}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Nacionalidad</p>
                <p className="font-medium">{userProfile.nacionalidad || 'No especificada'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Residencia actual</p>
                <p className="font-medium">{userProfile.residencia || 'No especificada'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Documento de identidad</p>
                <p className="font-medium">
                  {userProfile.tipo_documento && userProfile.numero_documento 
                    ? `${userProfile.tipo_documento}: ${userProfile.numero_documento}`
                    : 'No especificado'
                  }
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Situación laboral</p>
                <p className="font-medium">{userProfile.situacion_laboral || 'No especificada'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Fecha de registro</p>
                <p className="font-medium">
                  {new Date(userProfile.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default InformacionPersonal;