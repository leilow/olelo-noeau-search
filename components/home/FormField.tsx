'use client';

interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isFocused: boolean;
  isHovered: boolean;
  hasValue: boolean;
  type?: 'text' | 'email';
  as?: 'input' | 'textarea';
  rows?: number;
  required?: boolean;
}

const inputBaseClass =
  'w-full px-4 py-3 border-2 text-text font-body focus:outline-none transition-colors';
const inputFocusedClass = 'bg-highlight border-highlight';
const inputHoverClass = 'bg-button border-highlight';
const inputDefaultClass = 'border-text/20';
const labelClass = 'block font-body mb-2 text-sm font-medium';
const labelStyle = { color: '#3d3424' };
const inputStyle = { color: '#2c2416' };
const inputBgStyle = { backgroundColor: '#FBF4E6' };

function inputClassName(isFocused: boolean, isHovered: boolean, hasValue: boolean): string {
  if (isFocused || hasValue) return `${inputBaseClass} ${inputFocusedClass}`;
  if (isHovered) return `${inputBaseClass} ${inputHoverClass}`;
  return `${inputBaseClass} ${inputDefaultClass}`;
}

function inputBg(isFocused: boolean, isHovered: boolean, hasValue: boolean): React.CSSProperties {
  if (isFocused || hasValue || isHovered) return inputStyle;
  return { ...inputStyle, ...inputBgStyle };
}

export default function FormField({
  id,
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  onMouseEnter,
  onMouseLeave,
  isFocused,
  isHovered,
  hasValue,
  type = 'text',
  as = 'input',
  rows = 3,
  required = false,
}: FormFieldProps) {
  const className = `${inputClassName(isFocused, isHovered, hasValue)} ${
    as === 'textarea' ? 'rounded-lg resize-none' : 'rounded-none'
  }`;

  return (
    <div>
      <label htmlFor={id} className={labelClass} style={labelStyle}>
        {label} {required && '*'}
      </label>
      {as === 'textarea' ? (
        <textarea
          id={id}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          rows={rows}
          className={className}
          style={inputBg(isFocused, isHovered, hasValue)}
        />
      ) : (
        <input
          type={type}
          id={id}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className={className}
          style={inputBg(isFocused, isHovered, hasValue)}
        />
      )}
    </div>
  );
}
