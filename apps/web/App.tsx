
import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { Menu, X, Upload, Minus, Plus, Edit3, Instagram, Twitter, MessageCircle, ArrowUpRight, Monitor, Smartphone, Activity, MapPin, Wind, Zap, Droplets, Snowflake, Search, User } from 'lucide-react';
import { Reveal } from './components/Reveal';
import { FullscreenSection } from './components/FullscreenSection';
import { BackgroundController } from './components/BackgroundController';
import { VideoHero } from './components/VideoHero';
import { EditorialText, ManifestoText } from './components/EditorialText';
import PartnersPage from './pages/PartnersPage';
import MembershipPage from './pages/MembershipPage';
import FacilitiesPage from './pages/FacilitiesPage';
import ClassesPage from './pages/ClassesPage';

type Page = 'home' | 'membership' | 'classes' | 'facilities' | 'partners';

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

export const EditableImage: React.FC<{
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

export const EditableText: React.FC<{
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

const Navigation: React.FC<{ currentPage: Page; setPage: (p: Page) => void }> = ({ currentPage, setPage }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { id: Page; label: string }[] = [
    { id: 'membership', label: 'Membership' },
    { id: 'classes', label: 'Classes' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'partners', label: 'Partners' },
  ];

  const handleNavClick = (page: Page) => {
    setPage(page);
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${isScrolled || isMenuOpen ? 'bg-glvt-obsidian/95 backdrop-blur-md py-4 shadow-lg' : 'bg-transparent py-6'} px-6 md:px-12 flex justify-between items-center text-white`}>
        {/* Left: Branding & Locator */}
        <div className="flex items-center gap-8 flex-1">
          <button onClick={() => setPage('home')}>
            <Logo className={`h-6 md:h-8 transition-all duration-500`} color="white" />
          </button>

          <button className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-widest hover:text-glvt-champagne transition-colors">
            <MapPin size={14} />
            <span>Find a Club</span>
          </button>
        </div>

        {/* Center: Service Pillars (Hybrid Nav) */}
        <div className="hidden lg:flex gap-8 justify-center flex-[2]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`font-sans text-[10px] tracking-super-wide uppercase hover:text-glvt-champagne transition-colors relative group ${currentPage === item.id ? 'text-glvt-champagne' : ''}`}
            >
              {item.label}
              <span className={`absolute -bottom-2 left-0 h-[1px] bg-glvt-champagne transition-all duration-300 ${currentPage === item.id ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </button>
          ))}
        </div>

        {/* Right: Utilities & Mobile Toggle */}
        <div className="flex-1 flex justify-end items-center gap-6">
          <button className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-widest hover:text-glvt-champagne transition-colors">
            <Search size={14} />
            <span>Search</span>
          </button>
          <button className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-widest hover:text-glvt-champagne transition-colors">
            <User size={14} />
            <span>Sign In</span>
          </button>

          <button className="lg:hidden z-50 text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-glvt-obsidian z-40 flex items-center justify-center transition-all duration-500 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="font-serif text-3xl text-white tracking-widest uppercase hover:text-glvt-champagne transition-colors"
            >
              {item.label}
            </button>
          ))}
          <div className="w-12 h-[1px] bg-white/20 my-4"></div>
          <button onClick={() => handleNavClick('home')} className="font-sans text-sm tracking-widest uppercase text-white hover:text-glvt-champagne">Home</button>
        </div>
      </div>
    </>
  );
};

// --- NEW LUXURY SECTIONS ---

const Section01Hero: React.FC<{ onCtaClick: () => void }> = ({ onCtaClick }) => {
  return (
    <VideoHero
      videoSrc="https://customer-625e9kfx1zh9uf3o.cloudflarestream.com/b85db180d8cb003e98d5abbacc4bbb5a/manifest/video.m3u8"
      title="GLVT"
      subtitle="The Women’s Body Club"
      tagline="A house where movement becomes presence. Where the female body is honored — not pushed."
      ctaText="Request Invitation"
      onCtaClick={onCtaClick}
    />
  );
};

const Section02Statement: React.FC = () => {
  return (
    <FullscreenSection data-bg="bg-glvt-obsidian" className="text-glvt-sand px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <EditorialText centered className="italic">
          GLVT is a state of being.
        </EditorialText>
        <EditorialText centered delay={0.3}>
          A return to the body.
        </EditorialText>
        <EditorialText centered delay={0.6}>
          To truth.
        </EditorialText>
        <EditorialText centered delay={0.9} className="opacity-100">
          To the soft strength of being a woman.
        </EditorialText>

        <div className="pt-12">
          <ManifestoText delay={1.2}>
            Here, everything breathes.<br />
            Everything is felt.<br />
            Nothing needs noise.
          </ManifestoText>
        </div>
      </div>
    </FullscreenSection>
  );
};

const Section03WhatIs: React.FC = () => {
  return (
    <FullscreenSection data-bg="bg-white" className="text-glvt-obsidian px-6 md:px-12 lg:px-24">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Editorial Text */}
        <div className="space-y-8 order-2 lg:order-1">
          <EditorialText className="text-glvt-obsidian border-l-2 border-glvt-obsidian/10 pl-8">
            A movement and presence club,<br />
            created exclusively for women,<br />
            inside a fashion environment that inspires<br />
            elegance, calm, and inner beauty.
          </EditorialText>
          <div className="space-y-4 pt-4">
            <p className="font-serif text-2xl italic">Here, movement is ritual.</p>
            <p className="font-serif text-2xl italic">Strength is elegance.</p>
            <p className="font-serif text-2xl italic">Woman is the center.</p>
          </div>
        </div>

        {/* Right: Slow Vertical Video placeholder */}
        <div className="order-1 lg:order-2">
          <Reveal delay={0.4}>
            <div className="aspect-[3/4] rounded-[60px] overflow-hidden shadow-2xl bg-glvt-sand/20">
              <img
                src="https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=1000"
                alt="Breathing movement"
                className="w-full h-full object-cover grayscale-[20%] mix-blend-multiply opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </Reveal>
        </div>
      </div>
    </FullscreenSection>
  );
};

const Section04HeroImage: React.FC = () => {
  return (
    <FullscreenSection data-bg="bg-glvt-sand" className="relative overflow-hidden text-glvt-sand">
      <div className="absolute inset-0 w-full h-full -z-10">
        <img
          src="https://images.unsplash.com/photo-1531384695744-b3fb1485181b?auto=format&fit=crop&q=80&w=1600"
          alt="The GLVT Woman"
          className="w-full h-full object-cover scale-110"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="absolute bottom-24 left-0 w-full text-center">
        <Reveal>
          <h2 className="font-serif text-glvt-sand text-3xl md:text-5xl uppercase tracking-widest px-6">
            The GLVT Woman
          </h2>
          <p className="font-sans text-glvt-sand/80 text-xs md:text-sm tracking-[0.3em] mt-4 uppercase">
            The woman who has already chosen to honor herself.
          </p>
        </Reveal>
      </div>
    </FullscreenSection>
  );
};

const Section05Experience: React.FC = () => {
  const experiences = [
    {
      title: "Entering",
      lines: ["Warm light.", "Embracing silence.", "A space that recognizes you."],
      image: "/experience-entering.jpg"
    },
    {
      title: "During",
      lines: ["Movement becomes ritual.", "Breath becomes language.", "Strength becomes elegance."],
      image: "/experience-during.jpg"
    },
    {
      title: "Leaving",
      lines: ["Aligned body.", "Calm mind.", "More present soul."],
      image: "/experience-leaving.jpg"
    }
  ];

  return (
    <FullscreenSection data-bg="bg-glvt-sand" className="px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {experiences.map((exp, i) => (
            <Reveal key={i} delay={i * 0.3}>
              <div className="flex flex-col h-full group">
                <div className="aspect-[4/5] overflow-hidden mb-8 relative bg-glvt-obsidian/5">
                  <EditableImage
                    defaultSrc={exp.image}
                    alt={exp.title}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105 grayscale-[10%]"
                  />
                  <div className="absolute inset-0 bg-glvt-obsidian/10 group-hover:bg-transparent transition-colors duration-700" />
                </div>

                <div className="text-center space-y-4">
                  <h3 className="font-serif text-3xl md:text-4xl text-glvt-obsidian italic">{exp.title}</h3>
                  <div className="w-8 h-[1px] bg-glvt-obsidian/20 mx-auto" />
                  <div className="space-y-2">
                    {exp.lines.map((line, j) => (
                      <p key={j} className="font-sans text-xs md:text-sm text-glvt-obsidian/70 tracking-widest uppercase">{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </FullscreenSection>
  );
};

const Section06Philosophy: React.FC = () => {
  return (
    <FullscreenSection data-bg="bg-white" className="text-glvt-obsidian px-6">
      <div className="max-w-4xl mx-auto space-y-16 text-center">
        <EditorialText centered className="font-bold">
          The body is not a project.<br />
          It is a home.
        </EditorialText>

        <ManifestoText delay={0.5}>
          GLVT honors the body's soft intelligence,<br />
          its feminine strength,<br />
          its vital breath,<br />
          its inner truth,<br />
          and its purposeful movement.
        </ManifestoText>

        <ManifestoText delay={1.0}>
          Here, a woman does not transform for others.<br />
          She returns to herself.
        </ManifestoText>
      </div>
    </FullscreenSection>
  );
};

const Section07MovementStyle: React.FC = () => {
  return (
    <FullscreenSection data-bg="bg-glvt-greige" className="px-6 md:px-12 lg:px-24">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <Reveal>
          <div className="space-y-8">
            <h2 className="font-serif text-4xl md:text-5xl text-white">Movement as Style</h2>
            <p className="font-serif text-xl md:text-2xl text-white/80 leading-relaxed">
              At GLVT, the body becomes style.<br />
              A gesture of elegance.<br />
              A language of presence.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.4}>
          <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000"
              alt="Movement as style"
              className="w-full h-full object-cover"
            />
          </div>
        </Reveal>
      </div>
    </FullscreenSection>
  );
};

const Section08Triad: React.FC = () => {
  // ... values ...
  const values = [
    { title: "MASTERY", desc: "Refined technique.\nElegance as discipline." },
    { title: "INTEGRITY", desc: "Every gesture honors the body.\nEvery decision is born from truth." },
    { title: "PRESENCE", desc: "Calm as power.\nStillness as strength." }
  ];

  return (
    <FullscreenSection data-bg="bg-glvt-obsidian" className="text-glvt-sand px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-20">
          {values.map((val, i) => (
            <Reveal key={i} delay={i * 0.3}>
              <div className="text-center space-y-6">
                <h3 className="font-sans text-xs uppercase tracking-[0.3em] text-glvt-champagne">{val.title}</h3>
                <p className="font-serif text-xl md:text-2xl leading-relaxed whitespace-pre-line">{val.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </FullscreenSection>
  );
};

const Section09FourWords: React.FC = () => {
  const words = ["GROUNDING", "LONGEVITY", "VITALITY", "TRUTH"];

  return (
    <FullscreenSection data-bg="bg-white" className="text-glvt-obsidian px-6">
      <div className="text-center space-y-12">
        {words.map((word, i) => (
          <Reveal key={i} delay={i * 0.2}>
            <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight">{word}</h2>
          </Reveal>
        ))}
        <Reveal delay={1.0}>
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-glvt-obsidian/60 mt-16">
            The emotional architecture of GLVT.
          </p>
        </Reveal>
      </div>
    </FullscreenSection>
  );
};

const Section10House: React.FC = () => {
  return (
    <FullscreenSection data-bg="bg-glvt-sand" className="relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <Reveal>
          <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200"
              alt="The House"
              className="w-full h-full object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={0.4}>
          <div className="space-y-6">
            <h2 className="font-serif text-4xl md:text-5xl text-glvt-obsidian">GLVT is a sanctuary created for women.</h2>
            <p className="font-serif text-xl md:text-2xl text-glvt-obsidian/70 leading-relaxed">
              A space where calm leads,<br />
              light embraces,<br />
              and the body finds its sacred place.
            </p>
          </div>
        </Reveal>
      </div>
    </FullscreenSection>
  );
};

const Section11Symbol: React.FC = () => {
  return (
    <FullscreenSection data-bg="bg-black" className="text-glvt-sand px-6">
      <div className="max-w-3xl mx-auto text-center space-y-12">
        <Reveal>
          <div className="text-8xl md:text-9xl opacity-10 mb-8">🐆</div>
        </Reveal>

        <EditorialText centered delay={0.3}>
          The panther is sensed, not seen.
        </EditorialText>

        <ManifestoText delay={0.6}>
          A soft, elegant, unbreakable shadow.
        </ManifestoText>

        <Reveal delay={0.9}>
          <p className="font-sans text-sm uppercase tracking-[0.3em] text-glvt-champagne">
            The panther is presence.<br />
            A silent guardian of the GLVT woman.
          </p>
        </Reveal>
      </div>
    </FullscreenSection>
  );
};

const Section12Invitation: React.FC<{ onCtaClick: () => void }> = ({ onCtaClick }) => {
  return (
    <FullscreenSection data-bg="bg-glvt-sand" className="text-glvt-obsidian px-6">
      <div className="max-w-3xl mx-auto text-center space-y-12">
        <EditorialText centered>
          GLVT is a place for women who choose to honor themselves.
        </EditorialText>

        <ManifestoText delay={0.4}>
          Who seek presence,<br />
          inner beauty,<br />
          conscious movement,<br />
          and a life of emotional elegance.
        </ManifestoText>

        <Reveal delay={0.8}>
          <div className="space-y-6 pt-8">
            <p className="font-serif text-2xl italic">
              If this energy lives in you,<br />
              if you felt it while reading,<br />
              if your body said yes…
            </p>

            <button
              onClick={onCtaClick}
              className="
                inline-block mt-8 px-12 py-5
                font-sans text-xs uppercase tracking-[0.3em]
                bg-glvt-obsidian text-glvt-sand
                hover:bg-glvt-obsidian/90
                transition-all duration-700
                hover:scale-[1.02]
                shadow-xl
              "
            >
              Request Invitation
            </button>
          </div>
        </Reveal>
      </div>
    </FullscreenSection>
  );
};

const Section13Footer: React.FC = () => {
  return (
    <FullscreenSection data-bg="bg-black" className="text-glvt-sand px-6">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <Reveal>
          <h2 className="font-serif text-4xl md:text-5xl mb-8">GLVT</h2>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="space-y-4 font-serif text-lg md:text-xl opacity-80">
            <p>Honor the body.</p>
            <p>Movement as ritual.</p>
            <p>Strength as presence.</p>
            <p className="italic">Built to be felt.</p>
          </div>
        </Reveal>

        <Reveal delay={0.6}>
          <div className="pt-12 border-t border-glvt-sand/10 mt-12">
            <p className="font-sans text-xs tracking-widest opacity-50">© 2026 GLVT. All rights reserved.</p>
          </div>
        </Reveal>
      </div>
    </FullscreenSection>
  );
};

const HeroSection: React.FC = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-glvt-obsidian">
      {/* HERO (0:00–0:05) - Full screen, video loop, no sound, slow */}
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[20%]"
        autoPlay muted loop playsInline
        src="https://customer-625e9kfx1zh9uf3o.cloudflarestream.com/b85db180d8cb003e98d5abbacc4bbb5a/manifest/video.m3u8"
      >
        {/* Safari supports HLS natively. For other browsers, we'd need hls.js, but since the user is on Mac, this prioritizes their experience. */}
      </video>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-glvt-sand z-10 p-6">
        <h1 className="font-serif text-6xl md:text-[15vw] leading-none tracking-tighter opacity-90 mb-4 mix-blend-overlay animate-fade-in text-whitetext-shadow-lg">GLVT</h1>
        <div className="w-12 h-[1px] bg-glvt-sand/50 mb-6"></div>
        <p className="font-sans text-[10px] md:text-sm tracking-super-wide uppercase opacity-80 animate-fade-in-up delay-300">
          <EditableText defaultText="Grounded. Longevity. Vitality. Truth." tag="span" />
        </p>
      </div>
    </div>
  );
};

const ServicePillars: React.FC = () => {
  const services = [
    { id: 'classes', title: 'Signature Classes', desc: 'Precision-backed group fitness.', image: '/gym-4.jpg' },
    { id: 'training', title: 'Personal Training', desc: 'One-on-one coaching.', image: '/gym-1.jpg' },
    { id: 'pilates', title: 'Pilates', desc: 'Studio sessions for core strength.', image: '/ladies-gym/gym-lounge.jpg' },
    { id: 'spa', title: 'The Spa', desc: 'Recovery and regeneration.', image: '/gym-4.jpg' },
  ];

  return (
    <section className="bg-glvt-sand py-20">
      <div className="container mx-auto px-6">
        <div className="mb-20 text-center">
          <h2 className="font-sans font-light text-4xl md:text-6xl text-glvt-obsidian mb-4 uppercase tracking-widest">
            <EditableText defaultText="Elevate Your Ritual." tag="span" />
          </h2>
        </div>

        <div className="space-y-20 md:space-y-32">
          {services.map((service, idx) => (
            <div key={service.id} className={`flex flex-col md:flex-row gap-12 items-center ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
              <div className="w-full md:w-1/2 h-[50vh] relative overflow-hidden group">
                <EditableImage defaultSrc={service.image} alt={service.title} className="w-full h-full object-cover grayscale-[10%] transition-transform duration-[1.5s] ease-out group-hover:scale-110 group-hover:translate-x-4" />
              </div>
              <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
                <h3 className="font-sans font-medium text-3xl md:text-5xl text-glvt-obsidian uppercase tracking-wide">
                  <EditableText defaultText={service.title} tag="span" />
                </h3>
                <p className="font-sans text-sm tracking-wide text-glvt-charcoal/80 max-w-md mx-auto md:mx-0">
                  <EditableText defaultText={service.desc} tag="span" />
                </p>
                <button className="border-b border-glvt-obsidian pb-1 text-xs uppercase tracking-widest hover:text-glvt-champagne hover:border-glvt-champagne transition-all duration-300 hover:scale-[1.03] origin-left">
                  Discover {service.title}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const LocationSection: React.FC = () => {
  return (
    <section className="bg-glvt-obsidian text-glvt-sand py-20 px-6">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="font-sans font-light text-4xl md:text-6xl mb-6 uppercase tracking-widest">
            <EditableText defaultText="Find Your Sanctuary." tag="span" />
          </h2>
          <p className="font-sans text-sm tracking-wide mb-8 opacity-80">
            <EditableText defaultText="Locate a GLVT club near you." tag="span" />
          </p>
          <div className="flex gap-4">
            <input type="text" placeholder="Enter Zip or City" className="bg-transparent border border-glvt-sand/30 px-4 py-3 text-sm tracking-widest w-full md:w-80 focus:outline-none focus:border-glvt-sand" />
            <button className="bg-glvt-sand text-glvt-obsidian px-8 py-3 text-xs uppercase tracking-widest hover:bg-white transition-all duration-300 hover:scale-[1.03]">
              Search
            </button>
          </div>
        </div>
        <div className="h-[400px] border border-glvt-sand/10 relative overflow-hidden bg-glvt-charcoal/20 group">
          <iframe
            src="https://maps.google.com/maps?q=TS+Suites+Seminyak+Bali&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0, filter: 'grayscale(100%) invert(90%) contrast(1.2) brightness(0.8)' }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="opacity-60 group-hover:opacity-100 transition-opacity duration-700"
          ></iframe>
          <div className="absolute inset-0 pointer-events-none border border-glvt-sand/10"></div>
        </div>
      </div>
    </section>
  )
}

const AmenitiesShowcase: React.FC = () => {
  const amenities = [
    { name: 'Infrared Sauna', desc: 'Deep tissue recovery.', image: '/gym-4.jpg' },
    { name: 'Private Lounge', desc: 'Member-only workspace.', image: '/gym-1.jpg' },
    { name: 'Cold Plunge', desc: 'Contrast therapy.', image: '/ladies-gym/gym-lounge.jpg' },
  ];

  return (
    <section className="bg-white py-20 px-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-end mb-12">
          <h2 className="font-sans font-light text-3xl md:text-5xl text-glvt-obsidian uppercase tracking-widest">
            <EditableText defaultText="The Sanctuary." tag="span" />
          </h2>
          <a href="#" className="font-sans text-xs uppercase tracking-widest underline">View All Spaces</a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {amenities.map((item, i) => (
            <div key={i} className="group cursor-pointer overflow-hidden">
              <div className="aspect-[3/4] overflow-hidden mb-4 relative bg-gray-100">
                <EditableImage defaultSrc={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 group-hover:translate-x-2" />
                <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 text-[10px] uppercase tracking-wide z-10">
                  Amenity
                </div>
              </div>
              <h3 className="font-sans text-sm font-medium uppercase tracking-wide mb-1">{item.name}</h3>
              <p className="font-sans text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const MembershipSection: React.FC = () => {
  return (
    <section className="bg-glvt-greige py-20 flex flex-col items-center justify-center text-center px-6">
      <Reveal>
        <h2 className="font-sans font-light text-5xl md:text-8xl text-white mb-8 uppercase tracking-widest">
          <EditableText defaultText="Join the Club." tag="span" />
        </h2>
        <p className="font-sans text-sm md:text-base tracking-[0.2em] text-white/80 mb-12 max-w-2xl">
          <EditableText defaultText="Access award-winning spaces, expert training, and a community dedicated to high performance." tag="span" />
        </p>
        <div className="flex flex-col md:flex-row gap-6">
          <button
            onClick={() => window.location.href = '#'}
            className="px-12 py-4 border border-white text-white text-xs tracking-[0.25em] uppercase hover:bg-white hover:text-glvt-greige transition-all duration-500"
          >
            Explore Membership
          </button>
          <button
            onClick={() => window.location.href = '#'}
            className="px-12 py-4 bg-glvt-obsidian text-white text-xs tracking-[0.25em] uppercase hover:bg-glvt-black transition-all duration-500"
          >
            Member Login
          </button>
        </div>
      </Reveal>
    </section>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-glvt-obsidian text-white pt-20 pb-10 border-t border-white/10 text-sm">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <Logo className="h-8 md:h-10" color="white" />
            <p className="opacity-60 text-xs leading-relaxed max-w-xs font-sans tracking-wide">
              <EditableText defaultText="Honoring the body through space, ritual, and community." tag="span" />
            </p>
            <div className="pt-4">
              <p className="text-xs font-bold text-glvt-champagne mb-2">Put your HSA/FSA to work.</p>
              <p className="text-[10px] opacity-60">We accept health savings accounts for all memberships.</p>
            </div>
          </div>

          {/* Column 2: Account */}
          <div>
            <h4 className="font-sans font-bold text-sm mb-6 uppercase tracking-widest">Account</h4>
            <ul className="space-y-4 opacity-70 text-xs tracking-wide">
              <li><a href="#" className="hover:text-glvt-champagne transition-colors">Sign In</a></li>
              <li><a href="#" className="hover:text-glvt-champagne transition-colors">Register</a></li>
              <li><a href="#" className="hover:text-glvt-champagne transition-colors">Order Status</a></li>
              <li><a href="#" className="hover:text-glvt-champagne transition-colors">Returns</a></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="font-sans font-bold text-sm mb-6 uppercase tracking-widest">Company</h4>
            <ul className="space-y-4 opacity-70 text-xs tracking-wide">
              <li><a href="#" className="hover:text-glvt-champagne transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-glvt-champagne transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-glvt-champagne transition-colors">Sweat Collective</a></li>
              <li><a href="#" className="hover:text-glvt-champagne transition-colors">Media</a></li>
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div>
            <h4 className="font-sans font-bold text-sm mb-6 uppercase tracking-widest">Connect</h4>
            <ul className="space-y-4 opacity-70 text-xs tracking-wide">
              <li><a href="#" className="hover:text-glvt-champagne transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-glvt-champagne transition-colors">Live Chat</a></li>
              <li><a href="#" className="hover:text-glvt-champagne transition-colors">Store Locator</a></li>
              <li className="pt-4"><button className="bg-white text-glvt-obsidian px-6 py-2 uppercase text-[10px] font-bold tracking-widest hover:bg-glvt-champagne transition-colors">Download App</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 text-[10px] uppercase tracking-widest">
          <p>© 2026 GLVT. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">California Privacy Rights</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const App: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [page, setPage] = useState<Page>('home');

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

        <Navigation currentPage={page} setPage={setPage} />

        <main
          className={page === 'home' ? 'snap-y snap-proximity h-screen overflow-y-auto overflow-x-hidden scroll-smooth' : ''}
          style={page === 'home' ? { maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)' } : {}}
        >
          {page === 'home' && (
            <>
              {/* Background Color Controller */}
              <BackgroundController />

              <Section01Hero onCtaClick={() => setPage('membership')} />
              <Section02Statement />
              <Section03WhatIs />
              <Section04HeroImage />
              <Section05Experience />
              <Section06Philosophy />
              <Section07MovementStyle />
              <Section08Triad />
              <Section09FourWords />
              <Section10House />
              <Section11Symbol />
              <Section12Invitation onCtaClick={() => setPage('membership')} />
              <Section13Footer />
            </>
          )}

          {page === 'membership' && <MembershipPage />}
          {page === 'classes' && <ClassesPage />}
          {page === 'facilities' && <FacilitiesPage />}
          {page === 'partners' && <PartnersPage />}
        </main>

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
