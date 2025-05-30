import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          <Link to="/solifound" className="text-2xl font-bold text-primary">
            <img 
              src="https://fundacionsanezequiel.org/wp-content/uploads/2025/05/SOLIFOUND_V4_alpha2.0.png" 
              alt="Solifound Logo" 
              className="h-12 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-4">
            <Link 
              to="/solifound" 
              className={`text-sm font-medium transition-colors hover:text-primary hover:scale-105 ${
                location.pathname === '/solifound' ? 'text-primary' : 'text-gray-800'
              }`}
            >
              Inicio
            </Link>
            <Link 
              to="/login" 
              className="btn btn-secondary"
            >
              Iniciar Sesión
            </Link>
            <Link 
              to="/registro" 
              className="btn btn-primary"
            >
              Registrarse
            </Link>
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
              to="/solifound" 
              className={`font-medium py-2 transition-colors ${
                location.pathname === '/solifound' ? 'text-primary' : 'text-gray-800'
              }`}
            >
              Inicio
            </Link>
            <Link 
              to="/login" 
              className="btn btn-secondary w-full text-center"
            >
              Iniciar Sesión
            </Link>
            <Link 
              to="/registro" 
              className="btn btn-primary w-full text-center"
            >
              Registrarse
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;