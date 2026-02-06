import React from 'react';

interface FormFieldProps {
    label: string;
    name: string;
    value: string | boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    disabled?: boolean;
    type?: 'text' | 'email' | 'date' | 'checkbox' | 'textarea' | 'select';
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
    rows?: number;
    error?: string;
}


export const FormField: React.FC<FormFieldProps> = ({
    label,
    name,
    value,
    onChange,
    disabled = false,
    type = 'text',
    placeholder,
    required = false,
    options,
    rows = 4,
    error
}) => {
    const errorStyle: React.CSSProperties = {
        color: '#ef4444',
        fontSize: '12px',
        marginTop: '4px',
        display: 'block'
    };

    const inputErrorStyle: React.CSSProperties = error ? {
        borderColor: '#ef4444',
        boxShadow: '0 0 0 1px rgba(239, 68, 68, 0.3)'
    } : {};

    if (type === 'checkbox') {
        return (
            <div className="form-group checkbox-group">
                <label className="form-label checkbox-label">
                    <input
                        type="checkbox"
                        name={name}
                        checked={value as boolean}
                        onChange={onChange}
                        disabled={disabled}
                    />
                    {label} {required && '*'}
                </label>
                {error && <span style={errorStyle}>{error}</span>}
            </div>
        );
    }

    if (type === 'textarea') {
        return (
            <div className="form-group">
                <label className="form-label">
                    {label} {required && '*'}
                </label>
                <textarea
                    className="form-textarea"
                    name={name}
                    value={value as string}
                    onChange={onChange}
                    disabled={disabled}
                    rows={rows}
                    placeholder={placeholder}
                    style={inputErrorStyle}
                />
                {error && <span style={errorStyle}>{error}</span>}
            </div>
        );
    }

    if (type === 'select' && options) {
        return (
            <div className="form-group">
                <label className="form-label">
                    {label} {required && '*'}
                </label>
                <select
                    className="form-input"
                    name={name}
                    value={value as string}
                    onChange={onChange}
                    disabled={disabled}
                    style={inputErrorStyle}
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && <span style={errorStyle}>{error}</span>}
            </div>
        );
    }

    return (
        <div className="form-group">
            <label className="form-label">
                {label} {required && '*'}
            </label>
            <input
                className="form-input"
                type={type}
                name={name}
                value={value as string}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                style={inputErrorStyle}
            />
            {error && <span style={errorStyle}>{error}</span>}
        </div>
    );
};


interface ProfileSectionProps {
    title: string;
    children: React.ReactNode;
    optional?: boolean;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ title, children, optional = false }) => {
    return (
        <section className="profile-section">
            <h3 className="section-title">
                {title} {optional && <span className="optional-label">(Optional)</span>}
            </h3>
            <div className="form-grid">
                {children}
            </div>
        </section>
    );
};

interface ArrayFieldProps {
    items: string[];
    field: 'skills' | 'languages';
    isEditing: boolean;
    onChange: (field: 'skills' | 'languages', index: number, value: string) => void;
    onAdd: (field: 'skills' | 'languages') => void;
    onRemove: (field: 'skills' | 'languages', index: number) => void;
    label: string;
}

export const ArrayField: React.FC<ArrayFieldProps> = ({
    items,
    field,
    isEditing,
    onChange,
    onAdd,
    onRemove,
    label
}) => {
    return (
        <section className="profile-section">
            <h3 className="section-title">{label}</h3>
            <div className="skills-container">
                {items.map((item, index) => (
                    <div key={index} className="skill-item">
                        {isEditing ? (
                            <div className="skill-input-group">
                                <input
                                    className="skill-input"
                                    value={item}
                                    onChange={(e) => onChange(field, index, e.target.value)}
                                    placeholder={`Enter ${label.toLowerCase().slice(0, -1)}`}
                                />
                                <button
                                    className="remove-skill-btn"
                                    onClick={() => onRemove(field, index)}
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <span className="skill-tag">{item}</span>
                        )}
                    </div>
                ))}
                {isEditing && (
                    <button className="add-skill-btn" onClick={() => onAdd(field)}>
                        Add {label.slice(0, -1)}
                    </button>
                )}
                {!isEditing && items.length === 0 && (
                    <p className="no-data">No {label.toLowerCase()} added yet</p>
                )}
            </div>
        </section>
    );
};
