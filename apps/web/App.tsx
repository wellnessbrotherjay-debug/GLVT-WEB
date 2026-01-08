
import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { Menu, X, Upload, Minus, Plus, Edit3, Instagram, Twitter, MessageCircle, ArrowUpRight, Monitor, Smartphone, Activity, MapPin, Wind, Zap, Droplets, Snowflake } from 'lucide-react';
import { Reveal } from './components/Reveal';

// --- Contexts ---
interface EditContextType {
  isEditing: boolean;
}
const EditContext = createContext<EditContextType>({ isEditing: false });


// --- Expandable Section Component ---
import { motion, AnimatePresence } from 'framer-motion';

const ExpandableSection: React.FC<{
  id: string;
  title: string;
  subtitle: string;
  coverImage: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}> = ({ id, title, subtitle, coverImage, children, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <section id={id} className={`relative transition-all duration-1000 ease-in-out border-b border-white/5`}>
      {/* Collapsed/Cover View */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`relative w-full overflow-hidden cursor-pointer group ${isExpanded ? 'h-[40vh]' : 'h-[80vh] md:h-screen'}`}
      >
        <EditableImage
          defaultSrc={coverImage}
          alt={title}
          className={`absolute inset-0 w-full h-full opacity-60 transition-all duration-[1.5s] ease-out ${isExpanded ? 'grayscale brightness-50' : 'grayscale-[100%] brightness-40 group-hover:grayscale-0 group-hover:scale-105'}`}
          isBackground={true}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 p-6">
          <div className={`transition-all duration-700 delay-100 ${isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-80'}`}>
            <EditableText defaultText={subtitle} tag="span" className="font-sans text-[10px] md:text-xs tracking-[0.4em] uppercase text-glvt-stone mb-4 block" />
            <h2 className="font-serif text-5xl md:text-8xl text-white tracking-tight">
              <EditableText defaultText={title} tag="span" />
            </h2>
          </div>

          <div className={`mt-12 transition-all duration-500 ${isExpanded ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <button className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-glvt-black transition-all">
              <Plus size={20} className="transition-transform duration-500 group-hover:rotate-90" />
            </button>
            <span className="block mt-4 font-sans text-[9px] tracking-widest uppercase text-white/50 group-hover:text-white transition-colors">Expand</span>
          </div>
        </div>
      </div>

      {/* Expanded Content View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden bg-glvt-sand w-full"
          >
            {/* Close strip */}
            <div onClick={() => setIsExpanded(false)} className="w-full h-12 bg-glvt-black/5 hover:bg-glvt-stone/10 cursor-pointer flex items-center justify-center transition-colors">
              <Minus size={16} className="text-glvt-black/40" />
            </div>

            <div className="w-full">
              {children}
            </div>

            {/* Bottom Close Button */}
            <div className="py-20 flex justify-center bg-inherit">
              <button
                onClick={() => {
                  setIsExpanded(false);
                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-3 border border-glvt-black/20 text-glvt-black text-[10px] tracking-super-wide uppercase hover:bg-glvt-black hover:text-white transition-all"
              >
                Close Section
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const navItems = [
    { label: 'The State', id: 'hero' },
    { label: 'Philosophy', id: 'philosophy' },
    { label: 'Practice', id: 'practice' },
    { label: 'Space', id: 'space' },
    { label: 'Ritual', id: 'ritual' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-700 ease-in-out border-b ${isScrolled ? 'bg-glvt-black/90 backdrop-blur-md border-white/10 py-4' : 'bg-transparent py-8 border-transparent'}`}
      >
        <div className="container mx-auto px-6 md:px-12 flex justify-between items-center max-w-[1600px]">
          <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer z-50">
            <Logo
              className="h-6 md:h-8"
              color={"#FFFFFF"}
            />
          </div>

          <div className="hidden lg:flex items-center gap-12">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-[9px] font-sans font-medium tracking-super-wide uppercase text-white/70 hover:text-white transition-colors duration-300"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => scrollToSection('enter')}
              className="ml-6 px-6 py-2 border border-white text-white text-[9px] font-sans font-medium tracking-super-wide uppercase transition-all duration-500 hover:bg-white hover:text-glvt-black"
            >
              Inquire
            </button>
          </div>

          <button className="lg:hidden z-50 p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-glvt-black z-30 flex items-center justify-center transition-all duration-500 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="font-serif text-3xl text-white tracking-widest uppercase hover:text-glvt-stone"
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
    <section className="relative h-screen w-full flex items-center justify-center bg-glvt-black overflow-hidden">
      <EditableImage
        defaultSrc="/ladies-gym/gym-exterior.jpg"
        alt="Hero Background"
        className="absolute inset-0 w-full h-full opacity-40"
        isBackground={true}
        parallaxSpeed={3}
      />

      <div className="relative z-10 text-center px-6 max-w-6xl">
        <Reveal direction="up" delay={0.3}>
          <h1 className="text-white font-serif text-6xl md:text-9xl lg:text-[12rem] leading-[0.9] tracking-tight">
            <EditableText defaultText="GLVT" tag="div" className="mb-8 font-light tracking-[0.2em]" />
            <span className="italic font-light opacity-60 block text-4xl md:text-6xl tracking-normal mt-4"><EditableText defaultText="Where the body is honored." tag="span" /></span>
          </h1>
          <button className="mt-12 group cursor-pointer py-4 px-12 transition-all duration-700 relative overflow-hidden inline-block">
            <span className="font-sans text-[11px] md:text-sm text-white tracking-[0.4em] uppercase border-b border-white/20 group-hover:border-white pb-4 transition-all relative z-10">
              Enter GLVT
            </span>
          </button>
        </Reveal>
      </div>
    </section>
  );
};

const PhilosophySection: React.FC = () => {
  return (
    <section className="bg-glvt-sand pt-32 pb-40 px-6 md:px-12">
      <div className="max-w-4xl mx-auto text-center mb-32">
        <Reveal>
          <EditableText defaultText="THE PHILOSOPHY" tag="div" className="font-sans text-[10px] tracking-[0.4em] uppercase text-glvt-stone mb-8" />
          <h2 className="font-serif text-4xl md:text-5xl text-glvt-black leading-tight mb-8">
            <EditableText defaultText="GLVT is not a method. It is a return." tag="span" />
          </h2>
        </Reveal>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
        {[
          {
            letter: "G",
            title: "GROUNDED",
            desc: "Presence. Root. Calm. Strength begins when you are grounded. Nothing aggressive. Nothing loud."
          },
          {
            letter: "L",
            title: "LONGEVITY",
            desc: "Movement that honors time. Built for a long life. We do not train for today."
          },
          {
            letter: "V",
            title: "VITALITY",
            desc: "Real energy. Vitality is the new power. You leave more alive than you arrived."
          },
          {
            letter: "T",
            title: "TRUTH",
            desc: "Honoring the body. Train in truth. No punishment. No pressure. No masks."
          }
        ].map((item, idx) => (
          <Reveal key={idx} delay={idx * 0.1}>
            <div className="text-center group hover:-translate-y-2 transition-transform duration-700">
              <div className="font-serif text-8xl md:text-9xl text-glvt-stone/10 mb-6 group-hover:text-glvt-stone/20 transition-colors duration-500">
                {item.letter}
              </div>
              <h3 className="font-sans text-xs font-bold tracking-[0.3em] text-glvt-black uppercase mb-4">
                <EditableText defaultText={item.title} tag="span" />
              </h3>
              <p className="font-sans text-[11px] leading-relaxed text-glvt-charcoal/70 max-w-[200px] mx-auto">
                <EditableText defaultText={item.desc} tag="span" />
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

const SpaceSection: React.FC = () => {
  return (
    <div className="bg-glvt-black text-glvt-cream">
      {/* Immersive Intro */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <EditableImage
          defaultSrc="https://images.unsplash.com/photo-1519664824562-b4bc73f9713c?q=80&w=2760&auto=format&fit=crop"
          alt="Club Architecture"
          className="absolute inset-0 w-full h-full opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000"
          isBackground={true}
          parallaxSpeed={3}
        />
        <div className="relative z-10 text-center px-6 max-w-5xl">
          <Reveal direction="up">
            <EditableText defaultText="THE SANCTUARY" tag="div" className="font-sans text-[10px] tracking-[0.8em] uppercase text-glvt-stone mb-10" />
            <h1 className="font-serif text-5xl md:text-[10rem] leading-none tracking-tighter mb-12">
              <EditableText defaultText="THE SPACE" tag="div" />
            </h1>
            <p className="font-sans text-sm md:text-lg font-light tracking-wide max-w-2xl mx-auto opacity-60 leading-relaxed">
              <EditableText defaultText="The space holds you so your body can let go." tag="span" />
            </p>
            <button className="mt-12 px-8 py-3 border border-glvt-stone text-glvt-stone text-[10px] tracking-super-wide uppercase hover:bg-glvt-stone hover:text-glvt-black transition-all duration-500">
              <EditableText defaultText="Arrange your visit" tag="span" />
            </button>
          </Reveal>
        </div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
          <div className="w-[1px] h-20 bg-white"></div>
        </div>
      </section>

      {/* Facility Grid - Editorial Inspired */}
      <section className="py-40 px-6 md:px-12 bg-[#0A0A0A]">
        <div className="container mx-auto max-w-[1600px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 px-4">
            {/* Merged Visuals from Ladies Gym & Club */}
            {/* Row 1 */}
            <div className="lg:col-span-2 group relative h-[70vh] overflow-hidden bg-glvt-charcoal cursor-pointer">
              <EditableImage
                defaultSrc="/ladies-gym/gym-reception.jpg"
                alt="Reception"
                className="opacity-60 grayscale-[30%] group-hover:grayscale-0 group-hover:scale-102 transition-all duration-[2s]"
                isBackground={true}
              />
              <div className="absolute bottom-10 left-10 z-10">
                <Reveal delay={0.2}>
                  <h3 className="font-serif text-4xl text-white tracking-widest uppercase opacity-80">
                    <EditableText defaultText="ARRIVAL" tag="span" />
                  </h3>
                </Reveal>
              </div>
            </div>

            <div className="group relative h-[70vh] overflow-hidden bg-glvt-charcoal cursor-pointer">
              <EditableImage
                defaultSrc="/ladies-gym/gym-interior.jpg"
                alt="Interior"
                className="opacity-60 grayscale-[30%] group-hover:scale-102 transition-all duration-[2s]"
                isBackground={true}
              />
              <div className="absolute bottom-10 left-10 z-10">
                <Reveal delay={0.3}>
                  <h3 className="font-serif text-3xl text-white tracking-widest uppercase opacity-80">
                    <EditableText defaultText="INTERIOR" tag="span" />
                  </h3>
                </Reveal>
              </div>
            </div>

            {/* Row 2 */}
            <div className="group relative h-[70vh] overflow-hidden bg-glvt-charcoal cursor-pointer">
              <EditableImage
                defaultSrc="/ladies-gym/gym-lady-1.jpg"
                alt="Ritual"
                className="opacity-50 grayscale-[30%] group-hover:scale-102 transition-all duration-[2s]"
                isBackground={true}
              />
              <div className="absolute bottom-10 left-10 z-10">
                <Reveal delay={0.4}>
                  <h3 className="font-serif text-3xl text-white tracking-widest uppercase opacity-80">
                    <EditableText defaultText="RITUAL" tag="span" />
                  </h3>
                </Reveal>
              </div>
            </div>

            <div className="group relative h-[70vh] overflow-hidden bg-glvt-charcoal cursor-pointer">
              <EditableImage
                defaultSrc="/ladies-gym/gym-lady-2.jpg"
                alt="Elegance"
                className="opacity-50 grayscale-[30%] group-hover:scale-102 transition-all duration-[2s]"
                isBackground={true}
              />
              <div className="absolute bottom-10 left-10 z-10">
                <Reveal delay={0.5}>
                  <h3 className="font-serif text-3xl text-white tracking-widest uppercase opacity-80">
                    <EditableText defaultText="ELEGANCE" tag="span" />
                  </h3>
                </Reveal>
              </div>
            </div>

            <div className="group relative h-[70vh] overflow-hidden bg-glvt-charcoal cursor-pointer">
              <EditableImage
                defaultSrc="/ladies-gym/gym-lounge.jpg"
                alt="Lounge"
                className="opacity-50 grayscale-[30%] group-hover:grayscale-0 group-hover:scale-102 transition-all duration-[2s]"
                isBackground={true}
              />
              <div className="absolute bottom-10 left-10 z-10">
                <Reveal delay={0.6}>
                  <h3 className="font-serif text-3xl text-white tracking-widest uppercase opacity-80">
                    <EditableText defaultText="REST" tag="span" />
                  </h3>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Large Statement Image */}
      <section className="h-[90vh] w-full relative overflow-hidden flex items-center justify-center">
        <EditableImage
          defaultSrc="https://images.unsplash.com/photo-1542332213-9b5a5a3fab35?q=80&w=2940&auto=format&fit=crop"
          alt="Interior Statement"
          isBackground={true}
          parallaxSpeed={2}
          className="brightness-[0.4] grayscale"
        />
        <div className="relative z-10 text-center">
          <Reveal>
            <h2 className="text-white/20 font-serif text-[6rem] md:text-[18rem] tracking-tighter leading-none italic select-none">Sanctuary</h2>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

const PracticeSection: React.FC = () => {
  return (
    <section className="bg-glvt-sand pt-40 pb-40 px-6 md:px-12">
      <div className="container mx-auto max-w-[1600px]">
        <Reveal>
          <div className="mb-20">
            <EditableText defaultText="THE PRACTICE" tag="h2" className="font-serif text-5xl md:text-7xl text-glvt-black mb-6 leading-none" />
            <div className="max-w-xl">
              <EditableText
                defaultText="We don’t train to exhaust the body. We move to understand it."
                tag="p"
                className="font-sans text-xs md:text-sm font-light text-glvt-charcoal/70 tracking-wide leading-relaxed"
              />
            </div>

            <div className="mt-12 space-y-4">
              {["Intelligent Movement", "Functional Strength", "Nervous System Regulation", "Feminine Vitality"].map(concept => (
                <div key={concept} className="font-sans text-[10px] tracking-widest uppercase text-glvt-stone">{concept}</div>
              ))}
            </div>

            <button className="mt-12 px-8 py-3 border border-glvt-black text-[10px] tracking-super-wide uppercase hover:bg-glvt-black hover:text-white transition-all duration-500">
              <EditableText defaultText="Explore the practice" tag="span" />
            </button>
          </div>
        </Reveal>

        <div className="space-y-32">
          {/* Practice Visuals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <Reveal width="100%">
              <div className="relative h-[70vh] overflow-hidden group rounded-sm">
                <EditableImage
                  defaultSrc="https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=2787&auto=format&fit=crop"
                  alt="Practice Visual"
                  isBackground={true}
                  className="grayscale-[50%] hover:grayscale-0 transition-all duration-1000"
                />
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="space-y-8 max-w-lg">
                <EditableText defaultText="MOVEMENT" tag="h3" className="font-serif text-4xl md:text-6xl text-glvt-black" />
                <EditableText
                  defaultText="Movement redefined as art. Our specialized training zones are designed to maximize both aesthetic results and physical longevity."
                  tag="p"
                  className="font-sans text-sm md:text-base font-light text-glvt-charcoal/80 leading-loose"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

const RitualSection: React.FC = () => {
  return (
    <section className="bg-glvt-black py-40 px-6 md:px-12 text-white min-h-screen flex flex-col justify-center">
      <div className="container mx-auto max-w-4xl text-center">
        <Reveal>
          <EditableText defaultText="THE RITUAL" tag="div" className="font-sans text-[10px] tracking-[0.4em] uppercase text-glvt-stone mb-10" />
          <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-12">
            <EditableText defaultText="You don’t choose a class. You choose how you want to feel." tag="span" />
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-20">
            {[
              "Grounding Practice",
              "Longevity Movement",
              "Vitality Flow",
              "Truth Session"
            ].map(item => (
              <div key={item} className="border border-white/10 py-8 px-4 hover:bg-white/5 transition-colors duration-500 cursor-pointer group">
                <h3 className="font-serif text-2xl md:text-3xl text-glvt-cream group-hover:text-white transition-colors">
                  <EditableText defaultText={item} tag="span" />
                </h3>
              </div>
            ))}
          </div>

          <button className="px-10 py-3 bg-white text-glvt-black text-[10px] font-bold tracking-super-wide uppercase hover:bg-glvt-stone transition-all duration-500">
            <EditableText defaultText="Begin the ritual" tag="span" />
          </button>
        </Reveal>
      </div>
    </section>
  );
};

const MembershipSection: React.FC = () => {
  return (
    <section id="membership" className="bg-glvt-linen py-40 border-t border-glvt-stone/10">
      <div className="container mx-auto px-6 text-center">
        <Reveal>
          <h2 className="font-serif text-5xl md:text-7xl text-glvt-black mb-20">
            <EditableText defaultText="MEMBERSHIP" tag="span" />
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { name: "Drop In", sub: "Single Session" },
            { name: "5 Pack", sub: "Class Package" },
            { name: "10 Pack", sub: "Class Package" }
          ].map((tier, i) => (
            <div key={i} className="py-12 px-8 border border-glvt-stone/20 hover:border-glvt-black transition-all duration-1000 hover:bg-white/30 backdrop-blur-sm group rounded-sm">
              <span className="font-sans text-[10px] tracking-super-wide uppercase text-glvt-stone mb-4 block group-hover:text-glvt-black transition-colors">
                <EditableText defaultText={tier.sub} tag="span" />
              </span>
              <h3 className="font-serif text-3xl text-glvt-black">
                <EditableText defaultText={tier.name} tag="span" />
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const EnterSection: React.FC = () => {
  return (
    <section className="bg-glvt-sand py-40 flex flex-col items-center justify-center min-h-[80vh]">
      <div className="text-center space-y-12 px-6 max-w-3xl">
        <Reveal>
          <h2 className="font-serif text-4xl md:text-6xl text-glvt-black leading-tight">
            <EditableText defaultText="GLVT is not for everyone." tag="span" />
            <br />
            <span className="opacity-60 italic text-3xl md:text-5xl mt-4 block">
              <EditableText defaultText="It’s for those ready to return to their body." tag="span" />
            </span>
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="pt-12 flex flex-col md:flex-row gap-6 justify-center">
            <button
              onClick={() => window.location.href = 'https://glvt-web-booking.vercel.app/glvt/launch'}
              className="px-10 py-4 bg-glvt-black text-white text-[10px] font-bold tracking-super-wide uppercase hover:bg-glvt-charcoal transition-all shadow-xl"
            >
              <EditableText defaultText="Begin" tag="span" />
            </button>
            <button
              onClick={() => window.open('https://wa.me/8618616700279', '_blank')}
              className="px-10 py-4 border border-glvt-black text-glvt-black text-[10px] font-bold tracking-super-wide uppercase hover:bg-glvt-stone/10 transition-all"
            >
              <EditableText defaultText="Request a session" tag="span" />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

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
  const [showIntro, setShowIntro] = useState(true);

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
      <div className={`min-h-screen bg-glvt-black text-glvt-black font-sans selection:bg-glvt-stone selection:text-white ${isEditing ? 'ring-4 ring-blue-500' : ''}`}>

        {showIntro && <VideoIntro onComplete={() => setShowIntro(false)} />}

        <Navigation />

        <main className="min-h-screen">
          <div id="hero">
            <HeroSection />
          </div>

          <ExpandableSection
            id="philosophy"
            title="Philosophy"
            subtitle="The Core"
            coverImage="https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=2787&auto=format&fit=crop"
          >
            <PhilosophySection />
          </ExpandableSection>

          <ExpandableSection
            id="practice"
            title="Practice"
            subtitle="The Movement"
            coverImage="https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=2787&auto=format&fit=crop"
          >
            <PracticeSection />
          </ExpandableSection>

          <ExpandableSection
            id="space"
            title="THE SPACE"
            subtitle="The Sanctuary"
            coverImage="/ladies-gym/gym-interior.jpg"
          >
            <SpaceSection />
          </ExpandableSection>

          <ExpandableSection
            id="ritual"
            title="Ritual"
            subtitle="The Experience"
            coverImage="https://images.unsplash.com/photo-1519664824562-b4bc73f9713c?q=80&w=2760&auto=format&fit=crop"
          >
            <RitualSection />
          </ExpandableSection>

          <div id="enter">
            <EnterSection />
          </div>

        </main>

        <Footer />

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-2xl transition-all duration-300 ${isEditing ? 'bg-blue-600 text-white rotate-0' : 'bg-white text-black/50 hover:bg-black hover:text-white -rotate-12'}`}
          title="Toggle Visual Editor (Cmd+E)"
        >
          <Edit3 size={20} />
        </button>

      </div >
    </EditContext.Provider >
  );
};

export default App;
