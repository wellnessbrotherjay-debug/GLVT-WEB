import React, { ReactNode } from 'react';

interface FullscreenSectionProps {
    children: ReactNode;
    className?: string;
    id?: string;
    'data-bg'?: string;
}

export const FullscreenSection: React.FC<FullscreenSectionProps> = ({
    children,
    className = '',
    id,
    'data-bg': dataBg
}) => {
    return (
        <section
            id={id}
            data-bg={dataBg}
            className={`min-h-screen w-full flex items-center justify-center snap-start relative z-10 ${className}`}
        >
            {children}
        </section>
    );
};
