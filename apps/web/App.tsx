
import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { Menu, X, Upload, Minus, Plus, Edit3, Instagram, Twitter, MessageCircle, ArrowUpRight, Monitor, Smartphone, Activity, MapPin, Wind, Zap, Droplets, Snowflake } from 'lucide-react';
import { Reveal } from './components/Reveal';

// --- Contexts ---
interface EditContextType {
  isEditing: boolean;
}
const EditContext = createContext<EditContextType>({ isEditing: false });

// --- Components ---

const Logo: React.FC<{ className?: string; color?: string }> = ({ className = "h-8 md:h-12", color = "currentColor" }) => (
  <div className={`font-serif flex items-center transition-colors duration-500 ${className}`} style={{ color }}>
    <span className="text-inherit tracking-[0.25em] font-medium uppercase">GLVT</span>
  </div>
);

const EditableLink: React.FC<{
  href: string;
  className?: string;
  children: React.ReactNode;
}> = ({ href: initialHref, className, children }) => {
  const { isEditing } = useContext(EditContext);
  const [href, setHref] = useState(initialHref);

  const handleClick = (e: React.MouseEvent) => {
    if (isEditing) {
      e.preventDefault();
      const newUrl = prompt("Enter URL for this link:", href);
      if (newUrl !== null) {
        setHref(newUrl);
      }
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`${className} ${isEditing ? 'cursor-alias ring-1 ring-blue-500 rounded px-1' : ''}`}
    >
      {children}
    </a>
  );
};

const EditableImage: React.FC<{
  defaultSrc: string;
  alt: string;
  className?: string;
  parallaxSpeed?: number;
  isBackground?: boolean;
}> = ({ defaultSrc, alt, className = "", parallaxSpeed = 0, isBackground = false }) => {
  const { isEditing } = useContext(EditContext);
  const [src, setSrc] = useState(defaultSrc);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [scale, setScale] = useState(parallaxSpeed ? 1.2 : 1.0);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });

  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (parallaxSpeed === 0 || window.innerWidth < 768) return;
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      if (scrollProgress >= 0 && scrollProgress <= 1) {
        setOffset((scrollProgress - 0.5) * parallaxSpeed * 20);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [parallaxSpeed]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditing) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    startPosRef.current = { ...position };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const sensitivity = 0.15 / scale;

      setPosition({
        x: Math.max(0, Math.min(100, startPosRef.current.x - dx * sensitivity)),
        y: Math.max(0, Math.min(100, startPosRef.current.y - dy * sensitivity))
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, scale]);

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSrc(url);
    }
  };

  const adjustScale = (delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(prev => Math.max(1.0, Math.min(3.0, prev + delta)));
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className} ${isEditing ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
      onMouseDown={handleMouseDown}
      style={{ cursor: isEditing ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      {isEditing && (
        <div className="absolute top-2 right-2 z-50 flex flex-col gap-2">
          <button onClick={handleUploadClick} className="bg-glvt-stone text-white p-2 rounded-full shadow-lg hover:bg-black transition-colors"><Upload size={16} /></button>
          <div className="bg-white/90 backdrop-blur text-black rounded-full shadow-lg flex flex-col items-center overflow-hidden">
            <button onClick={(e) => adjustScale(0.1, e)} className="p-2 hover:bg-gray-200 border-b border-gray-200"><Plus size={16} /></button>
            <button onClick={(e) => adjustScale(-0.1, e)} className="p-2 hover:bg-gray-200"><Minus size={16} /></button>
          </div>
        </div>
      )}

      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-transform duration-75 ease-out ${isBackground ? 'absolute inset-0' : ''}`}
        style={{
          objectPosition: `${position.x}% ${position.y}%`,
          transform: `translateY(${offset}px) scale(${scale})`
        }}
        draggable={false}
      />
    </div>
  );
};

const EditableText: React.FC<{
  defaultText: string;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  onClick?: () => void;
}> = ({ defaultText, className = "", tag: Tag = 'div', onClick }) => {
  const { isEditing } = useContext(EditContext);
  const [text, setText] = useState(defaultText);
  const [fontSize, setFontSize] = useState<number>(100);

  const scaleStyle = { fontSize: `${fontSize}%` };

  const handleIncrease = (e: React.MouseEvent) => { e.stopPropagation(); setFontSize(p => p + 10); };
  const handleDecrease = (e: React.MouseEvent) => { e.stopPropagation(); setFontSize(p => Math.max(10, p - 10)); };

  if (isEditing) {
    return (
      <div className="relative inline-block group border border-dashed border-transparent hover:border-glvt-stone rounded p-1 -m-1 transition-all">
        <div className="absolute -top-8 left-0 hidden group-hover:flex bg-white shadow-lg rounded-md overflow-hidden border border-gray-200 z-50">
          <button onClick={handleDecrease} className="p-1 hover:bg-gray-100 text-black"><Minus size={12} /></button>
          <span className="text-[10px] p-1 font-mono text-black">{fontSize}%</span>
          <button onClick={handleIncrease} className="p-1 hover:bg-gray-100 text-black"><Plus size={12} /></button>
        </div>
        <Tag
          className={`outline-none focus:bg-glvt-stone/10 ${className}`}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e: React.FormEvent<HTMLElement>) => setText(e.currentTarget.innerText)}
          style={scaleStyle}
          onClick={onClick}
        >
          {text}
        </Tag>
      </div>
    );
  }

  return <Tag className={className} style={scaleStyle} onClick={onClick}>{text}</Tag>;
};

const VideoIntro: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
    }
  }, []);

  const handleEnter = () => {
    setVisible(false);
    setTimeout(onComplete, 1200);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] bg-glvt-black flex items-center justify-center transition-opacity duration-1000 ease-in-out ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-70 grayscale-[20%] brightness-[70%]"
        muted
        playsInline
        loop
      >
        <source src="https://assets.mixkit.co/videos/preview/mixkit-woman-doing-exercises-on-the-simulator-in-the-gym-41315-large.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <div className="animate-fade-in-up">
          <Logo className="h-20 md:h-32 mb-10" color="white" />
          <p className="font-sans text-[11px] md:text-sm tracking-[0.5em] text-white/90 uppercase mb-20 font-light">The Ritual Begins</p>
        </div>

        <button
          onClick={handleEnter}
          className="group cursor-pointer py-4 px-16 transition-all duration-700 relative overflow-hidden"
        >
          <span className="font-sans text-[11px] md:text-sm text-white tracking-[0.6em] uppercase border-b border-white/20 group-hover:border-white pb-4 transition-all relative z-10">
            Enter
          </span>
          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
        </button>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
// Direct portal access - no modal needed

// --- Navigation ---

const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'identity', label: 'Identity' },
    { id: 'rituals', label: 'Rituals' },
    { id: 'space', label: 'Space' },
    { id: 'philosophy', label: 'Philosophy' },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${isScrolled || isMenuOpen ? 'bg-glvt-sand/90 backdrop-blur-md py-4' : 'bg-transparent py-8'} px-6 md:px-12 flex justify-between items-center mix-blend-difference text-white`}>
        <div className="flex-1">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Logo className={`h-6 md:h-8 transition-all duration-500`} color="currentColor" />
          </button>
        </div>

        <div className="hidden md:flex gap-12">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="font-sans text-[10px] tracking-super-wide uppercase hover:opacity-50 transition-opacity"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex-1 flex justify-end">
          <button className="md:hidden z-50" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-glvt-sand z-40 flex items-center justify-center transition-all duration-500 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="font-serif text-3xl text-glvt-black tracking-widest uppercase hover:text-glvt-stone transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

const HeroSection: React.FC = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-glvt-obsidian">
      {/* HERO (0:00–0:05) - Full screen, video loop, no sound, slow */}
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[20%]"
        autoPlay muted loop playsInline
        src="https://customer-625e9kfx1zh9uf3o.cloudflarestream.com/b85db180d8cb003e98d5abbacc4bbb5a/manifest/video.m3u8"
      >
        {/* Safari supports HLS natively. For other browsers, we'd need hls.js, but since the user is on Mac, this prioritizes their experience. */}
      </video>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-glvt-sand z-10 p-6">
        <h1 className="font-serif text-6xl md:text-[15vw] leading-none tracking-tighter opacity-90 mb-4 mix-blend-overlay animate-fade-in">GLVT</h1>
        <div className="w-12 h-[1px] bg-glvt-sand/50 mb-6"></div>
        <p className="font-sans text-[10px] md:text-sm tracking-[0.4em] uppercase opacity-80 animate-fade-in-up delay-700">
          <EditableText defaultText="Grounded. Longevity. Vitality. Truth." tag="span" />
        </p>
      </div>
    </section>
  );
};

const IdentitySection: React.FC = () => {
  return (
    <section id="identity" className="min-h-screen bg-glvt-sand flex items-center justify-center py-20 px-6">
      <div className="max-w-[1600px] w-full grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
        <div className="relative h-[50vh] md:h-[70vh] w-full overflow-hidden">
          <EditableImage
            defaultSrc="/gym-4.jpg"
            alt="Identity"
            className="w-full h-full object-cover grayscale-[10%]"
          />
        </div>
        <div className="space-y-8 md:space-y-12">
          <Reveal>
            <h2 className="font-serif text-3xl md:text-6xl text-glvt-obsidian leading-tight">
              <EditableText defaultText="GLVT is a women-only space." tag="span" />
            </h2>
            <div className="space-y-4 font-sans text-xs md:text-base tracking-wide text-glvt-charcoal opacity-80 mt-8">
              <p><EditableText defaultText="Built to honor the body." tag="span" /></p>
              <p><EditableText defaultText="Built to respect time." tag="span" /></p>
              <p><EditableText defaultText="Built for truth." tag="span" /></p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
// ... (PhilosophySection remains unchanged) ...
const FashionSection: React.FC = () => {
  return (
    <section className="h-screen w-full relative group overflow-hidden">
      {/* FASHION × WELLNESS (Porsche Lifestyle → GLVT) */}
      <EditableImage
        defaultSrc="/gym-4.jpg"
        alt="Fashion"
        className="absolute inset-0 w-full h-full object-cover grayscale-[20%] transition-transform duration-[2s] group-hover:scale-105"
        isBackground={true}
      />
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute bottom-10 left-6 md:bottom-20 md:left-20 text-white max-w-xl pr-6">
        <Reveal>
          <h2 className="font-serif text-4xl md:text-7xl leading-tight mb-4 md:mb-8">
            <EditableText defaultText="What you wear becomes part of the ritual." tag="span" />
          </h2>
        </Reveal>
      </div>
    </section>
  );
};

const SpaceSection: React.FC = () => {
  return (
    <section id="space" className="h-screen w-full relative group overflow-hidden">
      {/* THE SPACE (Emotional architecture) */}
      <EditableImage
        defaultSrc="/gym-1.jpg"
        alt="Space"
        className="absolute inset-0 w-full h-full object-cover grayscale-[30%] transition-transform duration-[2s] group-hover:scale-105"
        isBackground={true}
      />
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute bottom-10 right-6 md:bottom-20 md:right-20 text-white text-right max-w-xl pl-6">
        <Reveal>
          <p className="font-serif text-3xl md:text-6xl leading-tight">
            <EditableText defaultText="Designed by women." tag="span" /><br />
            <EditableText defaultText="Built for women." tag="span" />
          </p>
        </Reveal>
      </div>
    </section>
  );
};

const StorytellingSection: React.FC = () => {
  return (
    <section className="relative h-screen w-full bg-glvt-greige overflow-hidden flex items-center justify-center">
      {/* STORYTELLING — MOVEMENT (0:16–0:30) */}
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-80 grayscale"
        autoPlay muted loop playsInline
        src="https://assets.mixkit.co/videos/preview/mixkit-athletic-woman-executing-a-sequence-of-yoga-asanas-41306-large.mp4"
      />
      <div className="relative z-10 text-center text-white mix-blend-difference px-6">
        <Reveal>
          <h2 className="font-serif text-4xl md:text-7xl mb-4 md:mb-8">
            <EditableText defaultText="This is not performance." tag="span" />
          </h2>
          <p className="font-sans text-[10px] md:text-sm tracking-[0.3em] uppercase opacity-90">
            <EditableText defaultText="This is presence." tag="span" />
          </p>
        </Reveal>
      </div>
    </section>
  );
};

const RitualsSection: React.FC = () => {
  return (
    <section id="rituals" className="bg-glvt-sand py-20 px-6 md:py-40">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Ritual 01 */}
        <div className="group">
          <div className="h-[40vh] md:h-[60vh] overflow-hidden mb-4 md:mb-8 bg-glvt-greige relative">
            <video className="w-full h-full object-cover opacity-80 grayscale transition-transform duration-1000 group-hover:scale-105" autoPlay muted loop playsInline src="https://assets.mixkit.co/videos/preview/mixkit-young-woman-stretching-her-legs-in-a-park-41312-large.mp4" />
          </div>
          <h3 className="font-serif text-xl md:text-2xl mb-2 text-glvt-black">Movement</h3>
          <p className="font-sans text-[10px] md:text-xs tracking-wide text-glvt-charcoal/70"><EditableText defaultText="Movement without punishment." tag="span" /></p>
        </div>
        {/* Ritual 02 */}
        <div className="group">
          <div className="h-[40vh] md:h-[60vh] overflow-hidden mb-4 md:mb-8 bg-glvt-greige relative">
            <EditableImage defaultSrc="/ladies-gym/gym-lounge.jpg" alt="Recovery" className="w-full h-full object-cover grayscale transition-transform duration-1000 group-hover:scale-105" />
          </div>
          <h3 className="font-serif text-xl md:text-2xl mb-2 text-glvt-black">Recovery</h3>
          <p className="font-sans text-[10px] md:text-xs tracking-wide text-glvt-charcoal/70"><EditableText defaultText="Recovery as respect." tag="span" /></p>
        </div>
        {/* Ritual 03 */}
        <div className="group">
          <div className="h-[40vh] md:h-[60vh] overflow-hidden mb-4 md:mb-8 bg-glvt-greige relative">
            <video className="w-full h-full object-cover opacity-80 grayscale transition-transform duration-1000 group-hover:scale-105" autoPlay muted loop playsInline src="https://assets.mixkit.co/videos/preview/mixkit-woman-meditating-in-nature-41300-large.mp4" />
          </div>
          <h3 className="font-serif text-xl md:text-2xl mb-2 text-glvt-black">Presence</h3>
          <p className="font-sans text-[10px] md:text-xs tracking-wide text-glvt-charcoal/70"><EditableText defaultText="Presence as power." tag="span" /></p>
        </div>
      </div>
    </section>
  );
};

const PhilosophySection: React.FC = () => {
  return (
    <section id="philosophy" className="bg-glvt-sand">
      {['Grounded', 'Longevity', 'Vitality', 'Truth'].map((word, i) => (
        <div key={word} className="h-screen flex items-center justify-center sticky top-0 bg-glvt-sand border-t border-glvt-greige/20">
          <Reveal>
            <h2 className="font-serif text-[12vw] md:text-[15vw] text-glvt-obsidian/90 tracking-tight leading-none text-center mix-blend-multiply">
              {word}
            </h2>
          </Reveal>
        </div>
      ))}
    </section>
  );
};

const ClosingSection: React.FC = () => {
  return (
    <section className="h-[80vh] bg-glvt-greige flex flex-col items-center justify-center text-center px-6">
      <Reveal>
        <h2 className="font-serif text-5xl md:text-8xl text-white mb-16">
          <EditableText defaultText="A place to return to." tag="span" />
        </h2>
        <div className="flex flex-col md:flex-row gap-6">
          <button
            onClick={() => window.location.href = 'https://glvt-web-booking.vercel.app/glvt/launch'}
            className="px-12 py-4 border border-white text-white text-xs tracking-[0.25em] uppercase hover:bg-white hover:text-glvt-greige transition-all duration-500"
          >
            Visit GLVT
          </button>
          <button
            onClick={() => window.open('https://wa.me/8618616700279', '_blank')}
            className="px-12 py-4 border border-glvt-obsidian text-glvt-obsidian text-xs tracking-[0.25em] uppercase hover:bg-glvt-obsidian hover:text-white transition-all duration-500"
          >
            Contact Studio
          </button>
        </div>
      </Reveal>
    </section>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-glvt-black text-white py-20 border-t border-white/5">
      <div className="container mx-auto px-6 text-center">
        <div className="mb-12">
          <Logo className="h-10 md:h-12 mx-auto mb-8" color="#FFFFFF" />
          <EditableText
            defaultText="GLVT — Honor the body."
            tag="p"
            className="font-serif italic text-2xl md:text-3xl text-white/80 font-light"
          />
        </div>

        {/* Minimal Socials */}
        <div className="flex justify-center items-center gap-10 mb-12 opacity-60">
          <EditableLink href="https://instagram.com/glvt_bali" className="hover:opacity-100 transition-opacity">
            <span className="font-sans text-[10px] tracking-widest uppercase">Instagram</span>
          </EditableLink>
          <EditableLink href="https://wa.me/8618616700279" className="hover:opacity-100 transition-opacity">
            <span className="font-sans text-[10px] tracking-widest uppercase">Construct</span>
          </EditableLink>
        </div>

        <div className="font-sans text-[9px] tracking-widest uppercase opacity-20">
          <EditableText defaultText="© 2025 GLVT. PRIVACY." tag="span" />
        </div>
      </div>
    </footer>
  );
};

const App: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);

  // Toggle visual editor with 'e' key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'e' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsEditing(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <EditContext.Provider value={{ isEditing }}>
      <div className={`min-h-screen bg-glvt-sand text-glvt-charcoal font-sans selection:bg-glvt-greige selection:text-white ${isEditing ? 'ring-4 ring-blue-500' : ''}`}>

        <Navigation />

        <main>
          <div id="hero">
            <HeroSection />
          </div>

          <IdentitySection />

          <StorytellingSection />

          <RitualsSection />

          <FashionSection />

          <SpaceSection />

          <PhilosophySection />

          <ClosingSection />
        </main>

        <Footer />

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-2xl transition-all duration-300 ${isEditing ? 'bg-blue-600 text-white rotate-0' : 'bg-white text-black/50 hover:bg-black hover:text-white -rotate-12'}`}
          title="Toggle Visual Editor (Cmd+E)"
        >
          <Edit3 size={20} />
        </button>

      </div>
    </EditContext.Provider>
  );
};

export default App;
