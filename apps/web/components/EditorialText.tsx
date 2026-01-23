import React, { ReactNode } from 'react';
import { Reveal } from './Reveal';

interface EditorialTextProps {
    children: ReactNode;
    className?: string;
    centered?: boolean;
    delay?: number;
}

export const EditorialText: React.FC<EditorialTextProps> = ({
    children,
    className = '',
    centered = false,
    delay = 0
}) => {
    return (
        <Reveal delay={delay}>
            <div className={`
        font-serif text-2xl md:text-4xl lg:text-5xl 
        leading-relaxed tracking-tight
        ${centered ? 'text-center' : 'text-left'}
        ${className}
      `}>
                {children}
            </div>
        </Reveal>
    );
};

interface ManifestoTextProps {
    children: ReactNode;
    delay?: number;
}

export const ManifestoText: React.FC<ManifestoTextProps> = ({ children, delay = 0 }) => {
    return (
        <Reveal delay={delay}>
            <p className="font-serif text-xl md:text-2xl lg:text-3xl leading-loose text-center max-w-4xl mx-auto opacity-90">
                {children}
            </p>
        </Reveal>
    );
};
