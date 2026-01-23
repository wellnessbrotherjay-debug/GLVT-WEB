import React from 'react';

interface VideoHeroProps {
    videoSrc?: string;
    title: string;
    subtitle: string;
    tagline?: string;
    ctaText?: string;
    onCtaClick?: () => void;
}

export const VideoHero: React.FC<VideoHeroProps> = ({
    videoSrc,
    title,
    subtitle,
    tagline,
    ctaText = "Request Invitation",
    onCtaClick
}) => {
    return (
        <div className="relative h-screen w-full overflow-hidden bg-glvt-obsidian snap-start">
            {/* Video Background */}
            {videoSrc ? (
                <video
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                    autoPlay
                    muted
                    loop
                    playsInline
                >
                    <source src={videoSrc} type="video/mp4" />
                </video>
            ) : (
                // Placeholder gradient for ritual movement aesthetic
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-stone-900 to-black" />
            )}

            {/* Overlay Content */}
            <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-7xl">
                <div className="space-y-6 md:space-y-8">
                    {/* Title */}
                    <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-glvt-sand leading-none tracking-tight">
                        {title}
                    </h1>

                    {/* Subtitle */}
                    <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-glvt-sand/90 leading-relaxed max-w-2xl">
                        {subtitle}
                    </h2>

                    {/* Tagline */}
                    {tagline && (
                        <p className="font-sans text-sm md:text-base text-glvt-sand/70 tracking-wide max-w-xl leading-relaxed">
                            {tagline}
                        </p>
                    )}

                    {/* CTA */}
                    <button
                        onClick={onCtaClick}
                        className="
              inline-block mt-8
              px-8 py-4
              font-sans text-xs uppercase tracking-widest
              bg-transparent border border-glvt-sand/30
              text-glvt-sand
              hover:bg-glvt-sand hover:text-glvt-obsidian
              transition-all duration-700
              hover:scale-[1.02]
            "
                    >
                        {ctaText}
                    </button>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
                <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-glvt-sand/50 to-transparent" />
            </div>
        </div>
    );
};
