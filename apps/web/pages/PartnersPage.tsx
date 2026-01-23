
import React from 'react';
import { Reveal } from '../components/Reveal';
import { EditableImage, EditableText } from '../App';

const PartnersPage: React.FC = () => {
    const partners = [
        {
            name: "Number One Wellness",
            description: "Access to Bali's premier recovery centre. Ice baths, hot pools, and infrared saunas.",
            image: "https://images.unsplash.com/photo-1601597111158-2fceff2926d0?q=80&w=2574&auto=format&fit=crop",
            features: ["Sauna", "Ice Bath", "Hot Pool"]
        },
        {
            name: "TS Suites",
            description: "Exclusive access to the rooftop infinity pool and lounge deck.",
            image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2667&auto=format&fit=crop",
            features: ["Rooftop Pool", "Lounge", "Events"]
        }
    ];

    return (
        <div className="pt-32 pb-20 px-6 min-h-screen bg-glvt-sand">
            <div className="container mx-auto">
                <Reveal>
                    <h1 className="font-sans font-light text-5xl md:text-7xl text-glvt-obsidian mb-12 uppercase tracking-widest">
                        <EditableText defaultText="Partners." tag="span" />
                    </h1>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {partners.map((p, i) => (
                        <Reveal key={i} delay={i * 0.2}>
                            <div className="group cursor-pointer overflow-hidden">
                                <div className="aspect-video overflow-hidden mb-6 relative bg-gray-100">
                                    <EditableImage defaultSrc={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" />
                                </div>
                                <h3 className="font-sans text-2xl font-medium uppercase tracking-wide mb-2">{p.name}</h3>
                                <p className="font-sans text-sm text-gray-600 mb-4 font-light tracking-wide leading-relaxed">{p.description}</p>
                                <div className="flex gap-3">
                                    {p.features.map(f => (
                                        <span key={f} className="text-[10px] uppercase tracking-widest border border-glvt-obsidian/20 px-3 py-1 bg-white/50">
                                            {f}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PartnersPage;
