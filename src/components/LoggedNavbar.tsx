import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const LoggedNavbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const checkAdminStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAdmin(user?.id === '597ea0f1-5ed3-4764-8260-eabb8602b44a');
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    checkAdminStatus();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [checkAdminStatus]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-1' : 'bg-transparent py-2'
      }`}
    >
      <div className="container-custom px-6">
        <div className="flex items-center justify-between">
          <Link to="/profile" className="text-2xl font-bold text-primary">
            <img 
              src="https://fundacionsanezequiel.org/wp-content/uploads/2025/05/SOLIFOUND_V4_alpha2.0.png" 
              alt="Solifound Logo" 
              className="h-12 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/profile" 
              className={`nav-link ${location.pathname === '/profile' ? 'text-primary' : 'text-gray-800'}`}
            >
              Perfil
            </Link>
            <Link 
              to="/ofertas" 
              className={`nav-link ${location.pathname === '/ofertas' ? 'text-primary' : 'text-gray-800'}`}
            >
              Ofertas
            </Link>
            <Link 
              to="/formaciones" 
              className={`nav-link ${location.pathname === '/formaciones' ? 'text-primary' : 'text-gray-800'}`}
            >
              Formaciones
            </Link>
            <Link 
              to="/programas" 
              className={`nav-link ${location.pathname === '/programas' ? 'text-primary' : 'text-gray-800'}`}
            >
              Programas
            </Link>
            <Link 
              to="/citas" 
              className={`nav-link ${location.pathname === '/citas' ? 'text-primary' : 'text-gray-800'}`}
            >
              Citas
            </Link>
            {isAdmin && (
              <Link 
                to="/adminpanel" 
                className={`nav-link ${location.pathname === '/adminpanel' ? 'text-primary' : 'text-gray-800'}`}
              >
                Panel Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="nav-link text-red-500 hover:text-red-600"
            >
              Cerrar Sesión
            </button>
          </nav>

          <button 
            className="md:hidden focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X size={24} className="text-primary" />
            ) : (
              <Menu size={24} className="text-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white p-4 shadow-lg animate-fade-in">
          <div className="flex flex-col space-y-4">
            <Link 
              to="/profile" 
              className={`nav-link-mobile ${location.pathname === '/profile' ? 'text-primary' : 'text-gray-800'}`}
            >
              Perfil
            </Link>
            <Link 
              to="/ofertas" 
              className={`nav-link-mobile ${location.pathname === '/ofertas' ? 'text-primary' : 'text-gray-800'}`}
            >
              Ofertas
            </Link>
            <Link 
              to="/formaciones" 
              className={`nav-link-mobile ${location.pathname === '/formaciones' ? 'text-primary' : 'text-gray-800'}`}
            >
              Formaciones
            </Link>
            <Link 
              to="/programas" 
              className={`nav-link-mobile ${location.pathname === '/programas' ? 'text-primary' : 'text-gray-800'}`}
            >
              Programas
            </Link>
            <Link 
              to="/citas" 
              className={`nav-link-mobile ${location.pathname === '/citas' ? 'text-primary' : 'text-gray-800'}`}
            >
              Citas
            </Link>
            {isAdmin && (
              <Link 
                to="/adminpanel" 
                className={`nav-link-mobile ${location.pathname === '/adminpanel' ? 'text-primary' : 'text-gray-800'}`}
              >
                Panel Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="nav-link-mobile text-red-500 hover:text-red-600 w-full text-left"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default LoggedNavbar;