import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    wrapperClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    wrapperClassName,
    labelClassName,
    errorClassName,
    ...props
}, ref) => {
    const content = (
        <>
            {label && <label className={labelClassName}>{label}</label>}
            <input ref={ref} {...props} />
            {error && <span className={errorClassName}>{error}</span>}
        </>
    );

    if (wrapperClassName) {
        return <div className={wrapperClassName}>{content}</div>;
    }

    return content;
});

Input.displayName = 'Input';

export default Input;
