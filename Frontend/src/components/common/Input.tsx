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
    className,
    ...props
}, ref) => {
    const inputClassName = `${className ?? ''} ${error ? '!border-[#f87171] focus:!border-[#f87171] focus:!shadow-[0_0_0_3px_rgba(248,113,113,0.2)]' : ''}`.trim();
    const content = (
        <>
            {label && <label className={labelClassName}>{label}</label>}
            <input ref={ref} className={inputClassName} aria-invalid={!!error} {...props} />
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
