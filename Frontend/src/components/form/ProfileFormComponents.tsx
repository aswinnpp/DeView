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

const inputClass = "bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.95)] py-2.5 px-3 rounded-lg text-sm outline-none placeholder:text-[rgba(255,255,255,0.45)] disabled:opacity-70";
const selectClass = "bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.95)] py-2.5 px-3 rounded-lg text-sm outline-none appearance-none bg-no-repeat bg-[right_12px_center] pr-9 disabled:opacity-70 [&_option]:bg-[#1a1a2e] [&_option]:text-white";
const selectBgImage = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.6)' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")";
const textareaClass = "bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.95)] py-2.5 px-3 rounded-lg text-sm outline-none resize-y min-h-16 placeholder:text-[rgba(255,255,255,0.45)] disabled:opacity-70";
const labelClass = "text-[13px] text-[rgba(255,255,255,0.8)] font-semibold";
const errorStyle: React.CSSProperties = { color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' };

export const FormField: React.FC<FormFieldProps> = ({
    label, name, value, onChange, disabled = false, type = 'text',
    placeholder, required = false, options, rows = 4, error
}) => {
    const inputErrorStyle: React.CSSProperties = error ? {
        borderColor: '#ef4444',
        boxShadow: '0 0 0 1px rgba(239, 68, 68, 0.3)'
    } : {};

    if (type === 'checkbox') {
        return (
            <div className="flex flex-row items-center gap-2">
                <label className={`${labelClass} flex items-center gap-2.5 cursor-pointer text-sm`}>
                    <input
                        type="checkbox"
                        name={name}
                        checked={value as boolean}
                        onChange={onChange}
                        disabled={disabled}
                        className="w-[18px] h-[18px] accent-brand-primary cursor-pointer"
                    />
                    {label} {required && '*'}
                </label>
                {error && <span style={errorStyle}>{error}</span>}
            </div>
        );
    }

    if (type === 'textarea') {
        return (
            <div className="flex flex-col gap-2">
                <label className={labelClass}>
                    {label} {required && '*'}
                </label>
                <textarea
                    className={textareaClass}
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
            <div className="flex flex-col gap-2">
                <label className={labelClass}>
                    {label} {required && '*'}
                </label>
                <select
                    className={selectClass}
                    name={name}
                    value={value as string}
                    onChange={onChange}
                    disabled={disabled}
                    style={{ ...inputErrorStyle, backgroundImage: selectBgImage }}
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
        <div className="flex flex-col gap-2">
            <label className={labelClass}>
                {label} {required && '*'}
            </label>
            <input
                className={inputClass}
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
        <section className="bg-[rgba(255,255,255,0.01)] rounded-xl p-[18px] border border-[rgba(255,255,255,0.02)]">
            <h3 className="m-0 mb-2.5 text-base font-bold text-white">
                {title} {optional && <span className="text-xs font-normal text-[rgba(255,255,255,0.5)]">(Optional)</span>}
            </h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-[18px] max-[900px]:grid-cols-1">
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
    items, field, isEditing, onChange, onAdd, onRemove, label
}) => {
    return (
        <section className="bg-[rgba(255,255,255,0.01)] rounded-xl p-[18px] border border-[rgba(255,255,255,0.02)]">
            <h3 className="m-0 mb-2.5 text-base font-bold text-white">{label}</h3>
            <div className="flex flex-wrap gap-2.5 items-center">
                {items.map((item, index) => (
                    <div key={index}>
                        {isEditing ? (
                            <div className="flex gap-2 items-center">
                                <input
                                    className="py-2 px-2.5 rounded-lg border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] text-[rgba(255,255,255,0.92)]"
                                    value={item}
                                    onChange={(e) => onChange(field, index, e.target.value)}
                                    placeholder={`Enter ${label.toLowerCase().slice(0, -1)}`}
                                />
                                <button
                                    className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#fca5a5] py-1.5 px-2.5 rounded-md cursor-pointer text-xs transition-all duration-200 hover:bg-[rgba(239,68,68,0.2)]"
                                    onClick={() => onRemove(field, index)}
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <span className="bg-[rgba(255,255,255,0.03)] text-[rgba(255,255,255,0.9)] py-2 px-3 rounded-full font-semibold">{item}</span>
                        )}
                    </div>
                ))}
                {isEditing && (
                    <button className="bg-[rgba(255,255,255,0.03)] border border-dashed border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.9)] py-2 px-3 rounded-[10px] cursor-pointer font-bold" onClick={() => onAdd(field)}>
                        Add {label.slice(0, -1)}
                    </button>
                )}
                {!isEditing && items.length === 0 && (
                    <p className="text-[rgba(255,255,255,0.5)] italic text-sm m-0">No {label.toLowerCase()} added yet</p>
                )}
            </div>
        </section>
    );
};
