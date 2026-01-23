import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { Menu, X, Upload, Minus, Plus, Edit3, Instagram, Twitter, MessageCircle, ArrowUpRight, Monitor, Smartphone, Activity, MapPin, Wind, Zap, Droplets, Snowflake, Search, User } from 'lucide-react';
import { Reveal } from './components/Reveal';
import { FullscreenSection } from './components/FullscreenSection';
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

    return <Tag className={className} onClick={onClick} style={scaleStyle}>{text}</Tag>;
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
            const newOffset = scrollProgress * parallaxSpeed * 100;
            setOffset(newOffset);
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [parallaxSpeed]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setSrc(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isEditing) return;
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        startPosRef.current = { ...position };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !isEditing) return;
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;
        const newX = Math.max(0, Math.min(100, startPosRef.current.x + (deltaX / 5)));
        const newY = Math.max(0, Math.min(100, startPosRef.current.y + (deltaY / 5)));
        setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleWheel = (e: React.WheelEvent) => {
        if (!isEditing) return;
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        setScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
    };

    if (isEditing) {
        return (
            <div
                ref={containerRef}
                className={`relative group ${isBackground ? 'absolute inset-0' : ''}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <div className="absolute top-2 right-2 z-50 hidden group-hover:flex gap-2 bg-white shadow-lg rounded-md p-2 border border-gray-200">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1 hover:bg-gray-100 text-black rounded"
                        title="Upload Image"
                    >
                        <Upload size={14} />
                    </button>
                </div>
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
    }

    return (
        <div ref={containerRef} className={isBackground ? 'absolute inset-0' : ''}>
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

// --- Components ---

const Logo: React.FC<{ className?: string; color?: string }> = ({ className = "h-8 md:h-12", color = "currentColor" }) => (
    <div className={`font-serif flex items-center transition-colors duration-500 ${className}`} style={{ color }}>
        <span className="text-inherit tracking-[0.25em] font-medium uppercase">GLVT</span>
    </div>
);

// --- Navigation ---

const Navigation: React.FC<{ currentPage: Page; setPage: (p: Page) => void }> = ({ currentPage, setPage }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks: { id: Page, label: string }[] = [
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
                    {navLinks.map((link) => (
                        <button
                            key={link.id}
                            onClick={() => setPage(link.id)}
                            className={`font-sans text-[10px] tracking-super-wide uppercase hover:text-glvt-champagne transition-colors relative group ${currentPage === link.id ? 'text-glvt-champagne' : ''}`}
                        >
                            {link.label}
                            <span className={`absolute -bottom-2 left-0 h-[1px] bg-glvt-champagne transition-all duration-300 ${currentPage === link.id ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
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
                    {navLinks.map((link) => (
                        <button
                            key={link.id}
                            onClick={() => handleNavClick(link.id)}
                            className="font-serif text-3xl text-white tracking-widest uppercase hover:text-glvt-champagne transition-colors"
                        >
                            {link.label}
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
        <div className="relative h-screen w-full overflow-hidden bg-glvt-obsidian snap-start">
            {/* HERO Video - Full screen, video loop, no sound, slow */}
            <video
                className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[20%]"
                autoPlay muted loop playsInline
                src="https://customer-625e9kfx1zh9uf3o.cloudflarestream.com/b85db180d8cb003e98d5abbacc4bbb5a/manifest/video.m3u8"
            >
                {/* Safari supports HLS natively. For other browsers, we'd need hls.js, but since the user is on Mac, this prioritizes their experience. */}
            </video>

            {/* Overlay Content - Updated luxury text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-glvt-sand z-10 p-6">
                <h1 className="font-serif text-6xl md:text-[15vw] leading-none tracking-tighter opacity-90 mb-4 mix-blend-overlay animate-fade-in text-white text-shadow-lg">
                    GLVT
                </h1>
                <div className="w-12 h-[1px] bg-glvt-sand/50 mb-6"></div>
                <p className="font-serif text-xl md:text-3xl tracking-tight opacity-80 animate-fade-in-up delay-300 mb-4">
                    The Women's Body Club
                </p>
                <p className="font-sans text-xs md:text-sm tracking-super-wide uppercase opacity-70 max-w-xl">
                    A house where movement becomes presence. Where the female body is honored — not pushed.
                </p>

                {/* CTA */}
                <button
                    onClick={onCtaClick}
                    className="
            inline-block mt-12 px-8 py-4
            font-sans text-xs uppercase tracking-widest
            bg-transparent border border-glvt-sand/30
            text-glvt-sand
            hover:bg-glvt-sand hover:text-glvt-obsidian
            transition-all duration-700
            hover:scale-[1.02]
          "
                >
                    Request Invitation
                </button>
            </div>
        </div>
    );
};
