
import React from 'react';
import { Reveal } from '../components/Reveal';
import { EditableText } from '../App';

const ClassesPage: React.FC = () => {
    const classes = [
        { time: "07:00", name: "Morning Ritual", type: "Yoga", intensity: "Low" },
        { time: "08:30", name: "Power Sculpt", type: "Pilates", intensity: "High" },
        { time: "10:00", name: "Kinetic Flow", type: "Mobility", intensity: "Medium" },
        { time: "17:30", name: "Metabolic", type: "HIIT", intensity: "High" },
    ];

    return (
        <div className="pt-32 pb-20 px-6 min-h-screen bg-glvt-greige text-white">
            <div className="container mx-auto max-w-5xl">
                <Reveal>
                    <h1 className="font-sans font-light text-5xl md:text-7xl mb-16 uppercase tracking-widest">
                        <EditableText defaultText="Daily Practice." tag="span" />
                    </h1>
                </Reveal>

                <div className="border-t border-white/20">
                    {classes.map((cls, i) => (
                        <Reveal key={i} delay={i * 0.15}>
                            <div className="py-8 border-b border-white/20 flex flex-col md:flex-row items-baseline justify-between hover:bg-white/5 transition-colors px-4 -mx-4">
                                <div className="flex items-baseline gap-12">
                                    <span className="font-mono text-xl opacity-60 w-16">{cls.time}</span>
                                    <div>
                                        <h3 className="font-serif text-3xl mb-1">{cls.name}</h3>
                                        <span className="font-sans text-xs uppercase tracking-widest opacity-60">{cls.type}</span>
                                    </div>
                                </div>
                                <div className="mt-4 md:mt-0 font-sans text-xs uppercase tracking-widest border border-white/30 px-3 py-1 rounded-full">
                                    {cls.intensity} Intensity
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ClassesPage;
