
import React from 'react';
import { Reveal } from '../components/Reveal';
import { EditableText } from '../App';

const MembershipPage: React.FC = () => {
    return (
        <div className="pt-32 pb-20 px-6 min-h-screen bg-glvt-obsidian text-glvt-sand">
            <div className="container mx-auto max-w-4xl">
                <Reveal>
                    <h1 className="font-sans font-light text-5xl md:text-8xl text-white mb-20 uppercase tracking-widest leading-none">
                        <EditableText defaultText="Join the Ritual." tag="span" />
                    </h1>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-black">
                    {/* Tier 1 */}
                    <Reveal delay={0.2}>
                        <div className="bg-glvt-sand p-8 md:p-12 flex flex-col justify-between min-h-[500px] border border-transparent hover:border-white/20 transition-all duration-500">
                            <div>
                                <h3 className="font-serif text-3xl mb-2">Foundation</h3>
                                <p className="font-sans text-xs uppercase tracking-widest opacity-60 mb-8">Monthly Access</p>
                                <div className="text-4xl font-light mb-8">$250<span className="text-sm align-top opacity-50">/mo</span></div>
                                <ul className="space-y-4 font-sans text-sm tracking-wide opacity-80">
                                    <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-black rounded-full"></span>Unlimited Gym Access</li>
                                    <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-black rounded-full"></span>Group Classes Included</li>
                                    <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-black rounded-full"></span>Locker Service</li>
                                </ul>
                            </div>
                            <button className="w-full py-4 mt-8 bg-black text-white text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors border border-black">Select</button>
                        </div>
                    </Reveal>

                    {/* Tier 2 */}
                    <Reveal delay={0.4}>
                        <div className="bg-[#1a1a1a] text-white p-8 md:p-12 flex flex-col justify-between min-h-[500px] border border-white/10 hover:border-glvt-champagne transition-all duration-500">
                            <div>
                                <h3 className="font-serif text-3xl mb-2 text-glvt-champagne">Ascension</h3>
                                <p className="font-sans text-xs uppercase tracking-widest opacity-60 mb-8">All Access + Recovery</p>
                                <div className="text-4xl font-light mb-8">$400<span className="text-sm align-top opacity-50">/mo</span></div>
                                <ul className="space-y-4 font-sans text-sm tracking-wide opacity-80">
                                    <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-glvt-champagne rounded-full"></span>Everything in Foundation</li>
                                    <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-glvt-champagne rounded-full"></span>Partner Access (Number One)</li>
                                    <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-glvt-champagne rounded-full"></span>Rooftop Pool Access</li>
                                    <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-glvt-champagne rounded-full"></span>Laundry Service</li>
                                </ul>
                            </div>
                            <button className="w-full py-4 mt-8 bg-glvt-champagne text-black text-xs uppercase tracking-[0.2em] hover:bg-white transition-colors">Select</button>
                        </div>
                    </Reveal>
                </div>
            </div>
        </div>
    );
};

export default MembershipPage;
