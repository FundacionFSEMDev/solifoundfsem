import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import FormInput from '../components/FormInput';
import LoadingHamster from '../assets/loadinghamster';
import { validateLoginForm } from '../utils/validation';
import { FormData, FormErrors } from '../types';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateLoginForm(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setLoginSuccess(true);
      
      // Redirect user after successful login (in a real app)
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    }, 1000);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md scale-in">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Iniciar Sesión</h2>
          <p className="text-gray-600">
            Ingresa tus credenciales para acceder a tu cuenta
          </p>
        </div>
        
        {loginSuccess ? (
          <div className="flex flex-col items-center justify-center p-4">
            <LoadingHamster />
            <p className="text-primary mt-4">Cargando...</p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <FormInput
                label="Correo Electrónico"
                type="email"
                id="email"
                name="email"
                placeholder="tu@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                required
                error={errors.email}
              />
              
              <FormInput
                label="Contraseña"
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                error={errors.password}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Recordarme
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary-light">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center btn btn-primary"
            > 
              <span className="flex items-center">
                <Lock size={16} className="mr-2" />
                Iniciar Sesión
              </span>
            </button>
          </form>
        )}
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link to="/registro" className="font-medium text-primary hover:text-primary-light inline-flex items-center">
              Regístrate ahora
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;