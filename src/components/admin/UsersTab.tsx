import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Download, Trash2, Eye, GraduationCap, Briefcase } from 'lucide-react';
import { UserProfile, Education, WorkExperience } from '../../types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<{
    education: Education[];
    experience: WorkExperience[];
  } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: users, error } = await supabase
        .from('loggedusers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
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
      return data || [];
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
      return data || [];
    } catch (error) {
      console.error('Error fetching user experience:', error);
    }
  };

  const handleUserSelect = async (userId: string) => {
    try {
      if (selectedUserId === userId) {
        setSelectedUserId(null);
        setUserDetails(null);
        return;
      }
      
      setSelectedUserId(userId);
      const [education, experience] = await Promise.all([
        fetchUserEducation(userId),
        fetchUserExperience(userId)
      ]);
      setUserDetails({ education, experience });
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const { error: educationError } = await supabase
        .from('education')
        .delete()
        .eq('user_id', userId);

      if (educationError) throw educationError;

      const { error: experienceError } = await supabase
        .from('work_experience')
        .delete()
        .eq('user_id', userId);

      if (experienceError) throw experienceError;

      const { error: profileError } = await supabase
        .from('loggedusers')
        .delete()
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Update local state
      setUsers(users.filter(user => user.user_id !== userId));
      setUserDetails(null);
      alert('Usuario eliminado correctamente');
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
        .eq('id', userId)
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
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando usuarios...</p>
        </div>
      ) : (
    <>
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teléfono
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
                className={`hover:bg-gray-50 ${selectedUserId === user.user_id ? 'bg-gray-50' : ''}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {user.nombre} {user.apellido}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {user.tipo_documento && user.numero_documento ? 
                      `${user.tipo_documento}: ${user.numero_documento}` :
                      'No especificado'
                    }
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.telefono}</div>
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
                    onClick={() => handleUserSelect(user.user_id!)}
                    className="text-primary hover:text-primary-light mr-3"
                    title="Ver detalles"
                  >
                    <Eye size={18} />
                  </button>
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

      {selectedUserId && userDetails && (
        <div className="border-t border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Información Detallada
              </h3>
              <button
                onClick={() => {
                  setSelectedUserId(null);
                  setUserDetails(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Cerrar
              </button>
            </div>

            {/* User Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Education Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-4">
                  <GraduationCap className="text-primary mr-2" size={20} />
                  <h4 className="text-md font-medium text-gray-700">Formación</h4>
                </div>
                {userDetails.education.length > 0 ? (
                  <div className="space-y-3">
                    {userDetails.education.map((edu) => (
                      <div key={edu.id} className="bg-white p-3 rounded-md shadow-sm">
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

              {/* Work Experience Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-4">
                  <Briefcase className="text-primary mr-2" size={20} />
                  <h4 className="text-md font-medium text-gray-700">Experiencia Laboral</h4>
                </div>
                {userDetails.experience.length > 0 ? (
                  <div className="space-y-3">
                    {userDetails.experience.map((exp) => (
                      <div key={exp.id} className="bg-white p-3 rounded-md shadow-sm">
                        <div className="font-medium">{exp.puesto}</div>
                        <div className="text-sm text-gray-600">{exp.empresa}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(exp.fecha_inicio).toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'long' 
                          })}
                          {exp.is_current_job ? ' - Actual' : exp.fecha_fin ? 
                            ` - ${new Date(exp.fecha_fin).toLocaleDateString('es-ES', { 
                              year: 'numeric', 
                              month: 'long'
                            })}` : ''}
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
          </div>
        </div>
      )}
    </div>
    </>
    )}
    </div>
  );
};

export default UsersTab;