interface FormFieldProps {
  label?: string | React.ReactNode;
  error?: string;
  children?: React.ReactNode;
}

export default function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="field is-horizontal">
      <div className="field-label is-normal">
        {label && <label className="label">{label}</label>}
      </div>
      <div className="field-body">
        <div className="field">
          <div className="control">{children}</div>
          {error && <p className="help is-danger">{error}</p>}
        </div>
      </div>
    </div>
  );
}
