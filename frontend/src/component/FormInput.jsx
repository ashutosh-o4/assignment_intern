import { forwardRef } from "react";
import "../pages/Auth.css";

/**
 * Reusable input component for forms.
 *
 * @param {Object} props
 * @param {string} props.label
 * @param {string} props.type
 * @param {string} props.name
 * @param {string} props.value
 * @param {function} props.onChange
 * @param {string} [props.error]
 * @param {React.Ref} ref
 */
const FormInput = forwardRef(({ label, type, name, value, onChange, error, ...rest }, ref) => {
  return (
    <div className="form-group">
      <label htmlFor={name} className="form-label">{label}</label>
      <input
        ref={ref}
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`form-input ${error ? "input-error" : ""}`}
        {...rest}
      />
      {/* 
        We use visibility: hidden/visible to reserve space. 
        This prevents UI jumping when validation errors appear or disappear.
      */}
      <div 
        className="form-error"
        style={{ visibility: error ? "visible" : "hidden" }}
      >
        {error || " "}
      </div>
    </div>
  );
});

FormInput.displayName = "FormInput";
export default FormInput;
