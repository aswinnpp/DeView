import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const FormInput: React.FC<FormInputProps> = ({ label, ...props }) => {
    return (
        <div>
            {label && (
                <label style={{ display: 'block', marginBottom: 8, color: '#cbd5e1', fontSize: 14 }}>
                    {label}
                </label>
            )}
            <input
                {...props}
                style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0f172a',
                    border: '1px solid #475569',
                    borderRadius: 6,
                    color: 'white',
                    fontSize: 14,
                    boxSizing: 'border-box',
                    ...props.style
                }}
            />
        </div>
    );
};

export default FormInput;
