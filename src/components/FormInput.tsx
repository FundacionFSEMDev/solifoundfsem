import React from 'react';
import { FormInputProps } from '../types';

const FormInput: React.FC<FormInputProps> = ({
  label,
  type,
  id,
  name,
  placeholder,
  value,
  onChange,
  required = false,
  error
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="form-label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`form-input ${error ? 'border-red-500' : ''}`}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
};

export default FormInput;