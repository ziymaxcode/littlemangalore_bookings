import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Menu, X, MapPin, Phone, Instagram, CheckCircle2, Tent, Zap, ChevronDown, Maximize2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-text">
      {/* SECTION 1 — NAVBAR */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-background shadow-md py-3" : "bg-transparent py-5"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
              isScrolled ? "bg-primary text-white" : "bg-white text-primary"
            )}>
              <Tent className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className={cn(
                "font-serif font-bold text-lg leading-tight transition-colors",
                isScrolled ? "text-primary" : "text-white"
              )}>Little</span>
              <span className={cn(
                "font-serif font-bold text-lg leading-tight transition-colors",
                isScrolled ? "text-primary" : "text-white"
              )}>Mangalore</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('about')} className={cn("text-sm font-medium hover:text-accent transition-colors", isScrolled ? "text-text" : "text-white/90")}>The Resort</button>
            <button onClick={() => scrollToSection('offerings')} className={cn("text-sm font-medium hover:text-accent transition-colors", isScrolled ? "text-text" : "text-white/90")}>The Turf</button>
            <button onClick={() => scrollToSection('gallery')} className={cn("text-sm font-medium hover:text-accent transition-colors", isScrolled ? "text-text" : "text-white/90")}>Gallery</button>
          </div>

          {/* Book Now Button & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <Link to="/booking" className="hidden md:inline-flex items-center justify-center px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-light transition-colors">
              Book Now
            </Link>
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className={cn("w-6 h-6", isScrolled ? "text-primary" : "text-white")} />
              ) : (
                <Menu className={cn("w-6 h-6", isScrolled ? "text-primary" : "text-white")} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background shadow-lg border-t border-gray-100 py-4 px-4 flex flex-col gap-4">
            <button onClick={() => scrollToSection('about')} className="text-left text-text font-medium py-2 border-b border-gray-100">The Resort</button>
            <button onClick={() => scrollToSection('offerings')} className="text-left text-text font-medium py-2 border-b border-gray-100">The Turf</button>
            <button onClick={() => scrollToSection('gallery')} className="text-left text-text font-medium py-2 border-b border-gray-100">Gallery</button>
            <Link to="/booking" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white text-sm font-medium rounded-full mt-2">
              Book Now
            </Link>
          </div>
        )}
      </nav>

      {/* SECTION 2 — HERO SECTION */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
            alt="Little Mangalore Resort" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* Dark overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight"
          >
            Escape to <span className="text-accent">Little Mangalore</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-white/90 font-sans mb-10 max-w-2xl mx-auto"
          >
            Turf, Traditions, and Tranquility. Welcome to the heart of Thokottu.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/booking?tab=resort" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 bg-accent text-white text-base font-medium rounded-full hover:bg-[#248263] transition-colors gap-2">
              <Tent className="w-5 h-5" /> Book a Stay
            </Link>
            <Link to="/booking?tab=turf" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 bg-black/40 backdrop-blur-sm border border-white/30 text-white text-base font-medium rounded-full hover:bg-black/60 transition-colors gap-2">
              <Zap className="w-5 h-5" /> Book the Turf
            </Link>
          </motion.div>
        </div>

        {/* Scroll Down Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/70 animate-bounce cursor-pointer"
          onClick={() => scrollToSection('about')}
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </section>

      {/* SECTION 3 — WELCOME / ABOUT SECTION */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Image */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.1)] border-2 border-accent/20 animate-[float_6s_ease-in-out_infinite]">
              <img 
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Resort Exterior" 
                className="w-full h-[500px] object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent/10 rounded-full blur-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-10" />
          </motion.div>

          {/* Right Column - Content */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="space-y-6"
          >
            <div className="inline-block">
              <span className="text-accent text-sm font-bold tracking-widest uppercase">Welcome to Little Mangalore</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary leading-tight">
              Nature's Playground. <br />
              <span className="text-accent">Coastal Comfort.</span>
            </h2>
            
            <div className="space-y-4 text-text-muted text-lg leading-relaxed">
              <p>
                Experience the soul of the coast and the spirit of the game. Nestled near the Arabian Sea, we offer premium turf facilities, events you'll remember, and stays that feel like home.
              </p>
              <p>
                Experience the warmth of Mangalorean hospitality combined with modern amenities designed for your ultimate comfort and enjoyment.
              </p>
            </div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mt-4"
            >
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-text">Prime Location</h4>
                <p className="text-sm text-text-muted">Just 10 minutes from Mangalore city!</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 4 — OUR OFFERINGS */}
      <section id="offerings" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="text-center mb-16"
          >
            <span className="text-accent text-sm font-bold tracking-widest uppercase mb-2 block">Our Offerings</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary">Experience the Best of Both Worlds</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1 - The Resort */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUpVariant}
              whileHover={{ scale: 1.02 }}
              className="group relative rounded-2xl overflow-hidden min-h-[420px] shadow-lg transition-transform duration-300"
            >
              <img 
                src="https://images.unsplash.com/photo-1542314831-c6a4d1409e1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="The Resort" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                    <Tent className="w-5 h-5" />
                  </div>
                  <span className="text-white font-bold tracking-wider uppercase text-sm">The Resort</span>
                </div>
                
                <div className="space-y-6">
                  <p className="text-white/90 text-lg">Authentic dining, relaxing environments, and impeccable service.</p>
                  
                  <ul className="space-y-3">
                    {['Premium AC Rooms', 'Lush Green Gardens', 'Bonfire & BBQ Setup'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-white/90">
                        <CheckCircle2 className="w-5 h-5 text-accent" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to="/booking?tab=resort" className="inline-flex items-center text-white font-semibold hover:text-accent transition-colors group/link">
                    Book a Stay <span className="ml-2 transform group-hover/link:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Card 2 - The Turf */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUpVariant}
              whileHover={{ scale: 1.02 }}
              className="group relative rounded-2xl overflow-hidden min-h-[420px] shadow-lg transition-transform duration-300"
            >
              <img 
                src="https://images.unsplash.com/photo-1518605368461-1e1e11111111?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="The Turf" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-white font-bold tracking-wider uppercase text-sm">The Turf</span>
                </div>
                
                <div className="space-y-6">
                  <p className="text-white/90 text-lg">Play like a pro on our all-season turf. Perfect for football or cricket under the floodlights.</p>
                  
                  <ul className="space-y-3">
                    {['High-Quality Artificial Grass', 'Bright LED Floodlights', 'Cricket & Football Ready'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-white/90">
                        <CheckCircle2 className="w-5 h-5 text-accent" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to="/booking?tab=turf" className="inline-flex items-center text-white font-semibold hover:text-accent transition-colors group/link">
                    Book the Turf <span className="ml-2 transform group-hover/link:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — GALLERY */}
      <section id="gallery" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariant}
          className="text-center mb-12"
        >
          <span className="text-accent text-sm font-bold tracking-widest uppercase mb-2 block">Gallery</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary">Glimpses of Little Mangalore</h2>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[
            "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Riverside sunset
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Boat
            "https://images.unsplash.com/photo-1585320806297-9794b3e4ce88?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Garden steps
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Resort exterior
            "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Pool
            "https://images.unsplash.com/photo-1511886929837-354d827aae26?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"  // Event/Amenities
          ].map((src, index) => (
            <motion.div 
              key={index}
              variants={fadeUpVariant}
              className="group relative rounded-2xl overflow-hidden h-[280px] cursor-pointer"
            >
              <img 
                src={src} 
                alt={`Gallery image ${index + 1}`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/40 transition-colors duration-300 flex items-center justify-center">
                <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 w-8 h-8" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* SECTION 6 — BOOK YOUR EXPERIENCE (CTA Banner) */}
      <section className="relative bg-primary py-24 px-4 overflow-hidden">
        {/* Decorative Semicircle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] max-w-[1200px] aspect-[2/1] bg-accent rounded-b-full opacity-10" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
          >
            <span className="text-accent text-sm font-bold tracking-widest uppercase mb-4 block">Plan Your Visit</span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-10">Book Your Experience</h2>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/booking?tab=resort" className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 bg-white text-primary text-lg font-bold rounded-full hover:bg-background transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Book a Stay
              </Link>
              <Link to="/booking?tab=turf" className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 bg-accent text-white text-lg font-bold rounded-full hover:bg-[#248263] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Book the Turf
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 7 — FOOTER */}
      <footer className="bg-[#111111] text-white pt-20 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1 - Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white text-[#111111] flex items-center justify-center">
                <Tent className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg leading-tight text-white">Little</span>
                <span className="font-serif font-bold text-lg leading-tight text-white">Mangalore</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your perfect coastal getaway and premium sports destination. Experience the best of relaxation and recreation.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 font-serif">Quick Links</h4>
            <ul className="space-y-4">
              <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-gray-400 hover:text-accent transition-colors">Home</button></li>
              <li><button onClick={() => scrollToSection('about')} className="text-gray-400 hover:text-accent transition-colors">The Resort</button></li>
              <li><button onClick={() => scrollToSection('offerings')} className="text-gray-400 hover:text-accent transition-colors">The Turf</button></li>
              <li><button onClick={() => scrollToSection('gallery')} className="text-gray-400 hover:text-accent transition-colors">Gallery</button></li>
            </ul>
          </div>

          {/* Column 3 - Contact Us */}
          <div>
            <h4 className="font-bold text-lg mb-6 font-serif">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span>Kallapu, Thokottu,<br />Karnataka 575017</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                <span>+91 8050006565</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                <span>+91 9845647865</span>
              </li>
            </ul>
          </div>

          {/* Column 4 - Find Us */}
          <div>
            <h4 className="font-bold text-lg mb-6 font-serif">Find Us</h4>
            <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-800">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3890.316885621868!2d74.8516035!3d12.8227878!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba35b0021c33c1d%3A0x7d9f7e8b8f8b8b8b!2sLittle%20Mangalore!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
              ></iframe>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Little Mangalore. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
