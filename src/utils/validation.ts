import { FormData, FormErrors } from '../types';

export const validateLoginForm = (data: FormData): FormErrors => {
  const errors: FormErrors = {};

  if (!data.email) {
    errors.email = 'El correo electrónico es obligatorio';
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'El correo electrónico no es válido';
  }

  if (!data.password) {
    errors.password = 'La contraseña es obligatoria';
  } else if (data.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  return errors;
};

export const validateRegistrationForm = (data: FormData): FormErrors => {
  const errors: FormErrors = {};

  if (!data.nombre) {
    errors.nombre = 'El nombre es obligatorio';
  }

  if (!data.apellido) {
    errors.apellido = 'El apellido es obligatorio';
  }

  if (!data.email) {
    errors.email = 'El correo electrónico es obligatorio';
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'El correo electrónico no es válido';
  }

  if (!data.telefono) {
    errors.telefono = 'El teléfono es obligatorio';
  } else if (!/^\d{9,15}$/.test(data.telefono.replace(/\s+/g, ''))) {
    errors.telefono = 'El teléfono no es válido';
  }

  if (!data.password) {
    errors.password = 'La contraseña es obligatoria';
  } else if (data.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden';
  }

  return errors;
};