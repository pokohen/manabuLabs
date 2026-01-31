import React from 'react';

interface NavigationCardProps {
    onClick: () => void;
    colorClass: string;
    children: React.ReactNode;
    className?: string;
}

export const NavigationCard: React.FC<NavigationCardProps> = ({
    onClick,
    colorClass,
    children,
    className = '',
}) => {
    return (
        <button
            onClick={onClick}
            className={`w-full py-5 px-6 text-white text-xl font-bold rounded-lg transition-all shadow-lg cursor-pointer ${colorClass} ${className}`}
        >
            {children}
        </button>
    );
};
