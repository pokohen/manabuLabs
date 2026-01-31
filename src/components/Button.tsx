import React from 'react';
import { Icon } from './Icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral' | 'outline' | 'ghost' | 'none';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    isLoading?: boolean;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant,
    size = 'md',
    fullWidth = false,
    isLoading = false,
    children,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors cursor-pointer focus:outline focus:outline-2 focus:outline-blue-500 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-zinc-500 hover:bg-zinc-600 text-white',
        success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        warning: 'bg-orange-500 hover:bg-orange-600 text-white',
        danger: 'bg-red-500 hover:bg-red-600 text-white',
        neutral: 'bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-600',
        outline: 'border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800',
        ghost: 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800',
        none: '',
    };

    const sizeStyles = {
        xs: 'py-1.5 px-3 text-sm',
        sm: 'py-2 px-3 text-sm',
        md: 'py-3 px-4 text-base',
        lg: 'py-4 px-4 text-lg font-bold',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`.trim();

    return (
        <button
            className={buttonClasses}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <Icon name="spinner" size="sm" className="-ml-1 mr-2" />
                    로딩 중...
                </>
            ) : (
                children
            )}
        </button>
    );
};
