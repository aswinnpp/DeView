import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    wrapperClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
}

const Input = ({
    label,
    error,
    wrapperClassName,
    labelClassName,
    errorClassName,
    ...props
}: InputProps) => {
    const content = (
        <>
            {label && <label className={labelClassName}>{label}</label>}
            <input {...props} />
            {error && <span className={errorClassName}>{error}</span>}
        </>
    );

    if (wrapperClassName) {
        return <div className={wrapperClassName}>{content}</div>;
    }

    return content;
};

export default Input;
