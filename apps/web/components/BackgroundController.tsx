import React, { useEffect, useState } from 'react';

export const BackgroundController: React.FC = () => {
    const [bgColor, setBgColor] = useState('bg-glvt-obsidian');

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bg = entry.target.getAttribute('data-bg');
                    if (bg) {
                        setBgColor(bg);
                    }
                }
            });
        }, {
            threshold: 0.5 // Trigger when 50% of section is visible
        });

        const sections = document.querySelectorAll('section[data-bg]');
        sections.forEach(section => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    return (
        <div
            className={`fixed inset-0 w-full h-full -z-10 transition-colors duration-[1000ms] ease-in-out ${bgColor}`}
        />
    );
};
