import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, UserPlus } from 'lucide-react';
import FormInput from '../components/FormInput';
import LoadingHamster from '../assets/loadinghamster';
import { createClient } from '@supabase/supabase-js';
import { validateRegistrationForm } from '../utils/validation';
import { FormData, FormErrors } from '../types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const Registro: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateRegistrationForm(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    if (!termsAccepted) {
      setErrors({ terms: 'Debes aceptar los términos y condiciones' });
      return;
    }
    
    setIsSubmitting(true);
    
    // Register user with Supabase Auth
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // Insert user data into loggedusers table
      const { error: insertError } = await supabase
        .from('loggedusers')
        .insert([
          {
            nombre: formData.nombre,
            apellido: formData.apellido,
            email: formData.email,
            telefono: formData.telefono,
            gdpr_accepted: termsAccepted ? 'SI' : 'NO',
            user_id: authData.user?.id
          }
        ]);

      if (insertError) throw insertError;

      setIsSubmitting(false);
      setRegistrationSuccess(true);

      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      setIsSubmitting(false);
      setErrors({ submit: 'Error al registrar usuario. Por favor, inténtalo de nuevo.' });
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md scale-in">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Crear cuenta</h2>
          <p className="text-gray-600">
            Únete a Solifound y comienza a colaborar
          </p>
        </div>
        
        {registrationSuccess ? (
          <div className="flex flex-col items-center justify-center p-4">
            <LoadingHamster />
            <p className="text-primary mt-4">Cargando...</p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Nombre"
                  type="text"
                  id="nombre"
                  name="nombre"
                  placeholder="Juan"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  error={errors.nombre}
                />
                
                <FormInput
                  label="Apellido"
                  type="text"
                  id="apellido"
                  name="apellido"
                  placeholder="Pérez"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                  error={errors.apellido}
                />
              </div>
              
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
                label="Teléfono"
                type="tel"
                id="telefono"
                name="telefono"
                placeholder="123456789"
                value={formData.telefono}
                onChange={handleChange}
                required
                error={errors.telefono}
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
              
              <FormInput
                label="Confirmar Contraseña"
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                error={errors.confirmPassword}
              />
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                Acepto los <a href="#" className="text-primary hover:text-primary-light">Términos de Servicio</a> y la <a href="#" className="text-primary hover:text-primary-light">Política de Privacidad</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center btn btn-primary"
            > 
              <span className="flex items-center">
                <UserPlus size={16} className="mr-2" />
                Crear Cuenta
              </span>
            </button>
          </form>
        )}
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-light inline-flex items-center">
              Inicia sesión
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registro;