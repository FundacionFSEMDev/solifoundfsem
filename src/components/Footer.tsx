import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Solifound</h3>
            <p className="text-gray-400 mb-4">
              Transformando la manera en que las personas se conectan y colaboran.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/solifound" className="text-gray-400 hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link to="/registro" className="text-gray-400 hover:text-white transition-colors">
                  Registrarse
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={20} className="mr-2 text-primary-light shrink-0 mt-1" />
                <span className="text-gray-400">Av. Principal 123, Ciudad</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="mr-2 text-primary-light shrink-0" />
                <span className="text-gray-400">+34 123 456 789</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="mr-2 text-primary-light shrink-0" />
                <span className="text-gray-400">info@solifound.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {currentYear} Solifound. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;