import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Download, Trash2 } from 'lucide-react';
import { UserProfile, Education, WorkExperience } from '../../types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userEducation, setUserEducation] = useState<Education[]>([]);
  const [userExperience, setWorkExperience] = useState<WorkExperience[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('loggedusers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchUserEducation = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .eq('user_id', userId)
        .order('fecha_inicio', { ascending: false });

      if (error) throw error;
      setUserEducation(data || []);
    } catch (error) {
      console.error('Error fetching user education:', error);
    }
  };

  const fetchUserExperience = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('work_experience')
        .select('*')
        .eq('user_id', userId)
        .order('fecha_inicio', { ascending: false });

      if (error) throw error;
      setWorkExperience(data || []);
    } catch (error) {
      console.error('Error fetching user experience:', error);
    }
  };

  const handleUserSelect = async (userId: string) => {
    setSelectedUser(userId);
    await Promise.all([
      fetchUserEducation(userId),
      fetchUserExperience(userId)
    ]);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      // Delete user's education records
      await supabase
        .from('education')
        .delete()
        .eq('user_id', userId);

      // Delete user's work experience records
      await supabase
        .from('work_experience')
        .delete()
        .eq('user_id', userId);

      // Delete user's profile
      await supabase
        .from('loggedusers')
        .delete()
        .eq('user_id', userId);

      // Delete auth user
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      // Update local state
      setUsers(users.filter(user => user.user_id !== userId));
      setSelectedUser(null);
      setUserEducation([]);
      setWorkExperience([]);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error al eliminar el usuario. Por favor, inténtalo de nuevo.');
    }
  };

  const downloadUserCV = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('loggedusers')
        .select('cv_data, cv_filename')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (!data.cv_data || !data.cv_filename) {
        alert('Este usuario no tiene CV subido');
        return;
      }

      // Convert base64 to blob
      const byteCharacters = atob(data.cv_data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.cv_filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CV:', error);
      alert('Error al descargar el CV. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Situación Laboral
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha de Registro
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr 
                key={user.id} 
                className={`hover:bg-gray-50 ${selectedUser === user.user_id ? 'bg-gray-50' : ''}`}
                onClick={() => handleUserSelect(user.user_id!)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.nombre} {user.apellido}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.telefono}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.situacion_laboral === 'Trabajo'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.situacion_laboral || 'No especificado'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadUserCV(user.user_id!);
                    }}
                    className="text-primary hover:text-primary-light mr-3"
                    title="Descargar CV"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteUser(user.user_id!);
                    }}
                    className="text-red-500 hover:text-red-600"
                    title="Eliminar usuario"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Información Detallada
          </h3>

          {/* User's Education */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">Formación</h4>
            {userEducation.length > 0 ? (
              <div className="space-y-3">
                {userEducation.map((edu) => (
                  <div key={edu.id} className="bg-gray-50 p-3 rounded-md">
                    <div className="font-medium">{edu.titulo}</div>
                    <div className="text-sm text-gray-600">{edu.institucion}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(edu.fecha_inicio).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}
                      {edu.fecha_fin ? ` - ${new Date(edu.fecha_fin).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long'
                      })}` : ' - Actual'}
                    </div>
                    {edu.descripcion && (
                      <div className="text-sm text-gray-600 mt-1">{edu.descripcion}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No hay información de formación disponible</p>
            )}
          </div>

          {/* User's Work Experience */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">Experiencia Laboral</h4>
            {userExperience.length > 0 ? (
              <div className="space-y-3">
                {userExperience.map((exp) => (
                  <div key={exp.id} className="bg-gray-50 p-3 rounded-md">
                    <div className="font-medium">{exp.puesto}</div>
                    <div className="text-sm text-gray-600">{exp.empresa}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(exp.fecha_inicio).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}
                      {exp.is_current_job ? 
                        ' - Actual' : 
                        exp.fecha_fin ? 
                          ` - ${new Date(exp.fecha_fin).toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'long'
                          })}` : 
                          ''
                      }
                    </div>
                    {exp.descripcion && (
                      <div className="text-sm text-gray-600 mt-1">{exp.descripcion}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No hay información de experiencia laboral disponible</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;