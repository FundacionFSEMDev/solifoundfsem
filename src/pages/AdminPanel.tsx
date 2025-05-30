import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Users, Briefcase, GraduationCap, Target } from 'lucide-react';
import LoggedNavbar from '../components/LoggedNavbar';
import UsersTab from '../components/admin/UsersTab';
import OfertasTab from '../components/admin/OfertasTab';
import FormacionesTab from '../components/admin/FormacionesTab';
import ProgramasTab from '../components/admin/ProgramasTab';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

type TabType = 'users' | 'ofertas' | 'formaciones' | 'programas';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('users');

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAuthorized(false);
        setLoading(false);
        navigate('/login');
        return;
      }

      // Check if the user is admin by querying their profile
      const { data: profile, error } = await supabase
        .from('loggedusers')
        .select('email')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (profile?.email === 'sistemas@fundacionsanezequiel.org') {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
      
    } catch (error) {
      console.error('Error checking authorization:', error);
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
            <p className="text-gray-600 mb-6">
              No tienes permisos para acceder al panel de administración.
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="btn btn-primary"
            >
              Volver al Perfil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LoggedNavbar />
      <div className="pt-24 pb-12 px-4">
        <div className="container-custom">
          <h1 className="text-3xl font-bold text-primary mb-8">Panel de Administración</h1>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 bg-white p-1 rounded-lg shadow-sm">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center justify-center flex-1 py-2 px-4 rounded-md transition-all ${
                activeTab === 'users'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users size={18} className="mr-2" />
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab('ofertas')}
              className={`flex items-center justify-center flex-1 py-2 px-4 rounded-md transition-all ${
                activeTab === 'ofertas'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Briefcase size={18} className="mr-2" />
              Ofertas
            </button>
            <button
              onClick={() => setActiveTab('formaciones')}
              className={`flex items-center justify-center flex-1 py-2 px-4 rounded-md transition-all ${
                activeTab === 'formaciones'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <GraduationCap size={18} className="mr-2" />
              Formaciones
            </button>
            <button
              onClick={() => setActiveTab('programas')}
              className={`flex items-center justify-center flex-1 py-2 px-4 rounded-md transition-all ${
                activeTab === 'programas'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Target size={18} className="mr-2" />
              Programas
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'ofertas' && <OfertasTab />}
          {activeTab === 'formaciones' && <FormacionesTab />}
          {activeTab === 'programas' && <ProgramasTab />}
        </div>
      </div>
    </div>
  );
};


export default AdminPanel