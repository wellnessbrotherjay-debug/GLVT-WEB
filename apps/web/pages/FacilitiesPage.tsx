
import React from 'react';
import { Reveal } from '../components/Reveal';
import { EditableText, EditableImage } from '../App';

const FacilitiesPage: React.FC = () => {
    const spaces = [
        { title: "Main Floor", img: "/gym-4.jpg" },
        { title: "Cardio Lab", img: "/gym-1.jpg" },
        { title: "Movement Studio", img: "/ladies-gym/gym-lounge.jpg" },
        { title: "Changing Suites", img: "/gym-4.jpg" },
    ];

    return (
        <div className="pt-32 pb-20 px-6 min-h-screen bg-white">
            <div className="container mx-auto">
                <Reveal>
                    <h1 className="font-sans font-light text-5xl md:text-7xl text-black mb-16 uppercase tracking-widest">
                        <EditableText defaultText="Our Spaces." tag="span" />
                    </h1>
                </Reveal>

                <div className="space-y-32">
                    {spaces.map((space, i) => (
                        <Reveal key={i} delay={i * 0.2}>
                            <div className={`flex flex-col md:flex-row gap-12 items-center ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                                <div className="w-full md:w-3/5 h-[60vh] relative overflow-hidden group">
                                    <EditableImage defaultSrc={space.img} alt={space.title} className="w-full h-full object-cover grayscale-[10%] transition-transform duration-[1.5s] ease-out group-hover:scale-105" />
                                </div>
                                <div className="w-full md:w-2/5">
                                    <div className="h-[1px] w-12 bg-black mb-6"></div>
                                    <h2 className="font-serif text-4xl mb-4">{space.title}</h2>
                                    <p className="font-sans text-sm opacity-60 max-w-xs leading-relaxed">
                                        Designed for focus, performance, and tranquility.
                                    </p>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FacilitiesPage;
