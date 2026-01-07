import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/button';
import { CustomCursor } from '@/components/effects/CustomCursor';
import { SmoothScroll } from '@/components/effects/SmoothScroll';
import {
  Heart,
  ArrowRight,
  Calendar,
  FileText,
  CreditCard,
  Shield,
  Users,
  Zap,
  CheckCircle2,
  Mic,
  ClipboardList,
  Stethoscope,
  Play,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { TestimonialCard } from "@/components/landing/TestimonialCard";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: FileText,
    title: 'AI Clinical Notes',
    description: 'SOAP notes with audio transcription and ICD-10 suggestions',
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Appointment badges, confirmation tracking, and reminders',
    gradient: 'from-emerald-400 to-green-500'
  },
  {
    icon: CreditCard,
    title: 'Insurance Billing',
    description: 'Claims-ready billing with snapshot preservation',
    gradient: 'from-teal-500 to-cyan-500'
  },
  {
    icon: Users,
    title: 'Patient Intake',
    description: 'Secure forms with phone verification',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: Shield,
    title: 'Audit Compliant',
    description: 'Complete audit trail for all clinical actions',
    gradient: 'from-emerald-600 to-teal-600'
  },
  {
    icon: Zap,
    title: 'AI Assisted',
    description: 'AI helps, clinician reviews and signs',
    gradient: 'from-lime-500 to-green-500'
  },
];

const howItWorks = [
  {
    step: '01',
    icon: Mic,
    title: 'Record or Type',
    description: 'Capture clinical encounters with voice or text input during patient visits'
  },
  {
    step: '02',
    icon: Stethoscope,
    title: 'AI Generates',
    description: 'Intelligent algorithms create structured SOAP notes with ICD-10 suggestions'
  },
  {
    step: '03',
    icon: ClipboardList,
    title: 'Review & Sign',
    description: 'Clinicians review AI suggestions, make edits, and digitally sign to finalize'
  },
];

const stats = [
  { value: '50+', label: 'HEALTHCARE FACILITIES', suffix: '' },
  { value: '10', label: 'PATIENT RECORDS', suffix: 'K+' },
  { value: '99.9', label: 'UPTIME GUARANTEE', suffix: '%' },
  { value: '<30', label: 'NOTE GENERATION', suffix: 's' },
];



const testimonials = [
  {
    name: "Dr. Sarah Kimani",
    role: "Medical Director",
    company: "Nairobi West Hospital",
    content: "Hure Care has transformed how we handle documentation. The AI suggestions are surprisingly accurate and save us hours everyday.",
    initials: "SK"
  },
  {
    name: "John Kamau",
    role: "Lead Nurse",
    company: "Aga Khan University Hospital",
    content: "The patient intake forms are a game changer. No more papers to scan, everything is digital and instantly available.",
    initials: "JK"
  },
  {
    name: "Dr. Amina Abdi",
    role: "Private Practitioner",
    company: "Mombasa Care Center",
    content: "Billing used to be a nightmare. With Hure Care, claims are generated automatically from my notes. It's magic.",
    initials: "AA"
  }
];

// 3D Floating Shapes using pure CSS transforms + Healthcare Elements
function FloatingShapes() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate floating cubes
      gsap.to('.floating-cube', {
        rotationY: 360,
        rotationX: 360,
        duration: 20,
        repeat: -1,
        ease: 'none',
        stagger: 2
      });

      // Floating animation
      gsap.to('.float-slow', {
        y: '20px',
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.float-medium', {
        y: '-25px',
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.float-fast', {
        y: '15px',
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Gradient orbs pulsing
      gsap.to('.pulse-orb', {
        scale: 1.1,
        opacity: 0.8,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.5
      });

      // DNA Helix rotation
      gsap.to('.dna-helix', {
        rotateY: 360,
        duration: 10,
        repeat: -1,
        ease: 'none'
      });

      // Heartbeat line animation
      gsap.to('.heartbeat-line', {
        strokeDashoffset: -1000,
        duration: 3,
        repeat: -1,
        ease: 'none'
      });

      // Floating pills
      gsap.to('.floating-pill', {
        rotateZ: 360,
        duration: 8,
        repeat: -1,
        ease: 'none',
        stagger: 1
      });

      // Pulse rings
      gsap.to('.pulse-ring', {
        scale: 2,
        opacity: 0,
        duration: 2,
        repeat: -1,
        stagger: 0.5,
        ease: 'power1.out'
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-30" style={{ perspective: '1000px' }}>
      {/* Gradient orbs */}
      <div className="pulse-orb absolute -top-[30%] -right-[15%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-emerald-500/30 via-green-500/20 to-transparent blur-3xl" />
      <div className="pulse-orb absolute -bottom-[40%] -left-[20%] w-[900px] h-[900px] rounded-full bg-gradient-to-tr from-teal-500/25 via-emerald-500/15 to-transparent blur-3xl" />
      <div className="pulse-orb absolute top-[30%] right-[5%] w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-green-400/20 via-emerald-400/10 to-transparent blur-3xl" />

      {/* DNA Helix Animation */}
      <div className="dna-helix absolute top-[15%] left-[8%] w-20 h-64 flex flex-col justify-between" style={{ transformStyle: 'preserve-3d' }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="relative w-full h-4 flex justify-between items-center">
            <div
              className="w-3 h-3 rounded-full bg-emerald-400/60"
              style={{ transform: `translateZ(${Math.sin(i * 0.8) * 30}px)` }}
            />
            <div className="flex-1 h-0.5 bg-gradient-to-r from-emerald-400/40 via-transparent to-teal-400/40 mx-1" />
            <div
              className="w-3 h-3 rounded-full bg-teal-400/60"
              style={{ transform: `translateZ(${Math.cos(i * 0.8) * 30}px)` }}
            />
          </div>
        ))}
      </div>

      {/* Heartbeat Monitor Line */}
      <svg className="absolute top-[60%] left-[5%] w-96 h-24 opacity-30" viewBox="0 0 400 100">
        <path
          className="heartbeat-line"
          d="M0,50 L50,50 L70,50 L80,20 L90,80 L100,30 L110,60 L120,50 L180,50 L200,50 L210,20 L220,80 L230,30 L240,60 L250,50 L350,50 L400,50"
          fill="none"
          stroke="url(#heartbeatGradient)"
          strokeWidth="2"
          strokeDasharray="500"
          strokeDashoffset="0"
        />
        <defs>
          <linearGradient id="heartbeatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
            <stop offset="30%" stopColor="#10b981" />
            <stop offset="70%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating Pills/Capsules */}
      <div className="floating-pill float-slow absolute top-[25%] right-[12%] w-12 h-5 rounded-full overflow-hidden flex">
        <div className="w-1/2 h-full bg-emerald-400/50" />
        <div className="w-1/2 h-full bg-white/30" />
      </div>
      <div className="floating-pill float-medium absolute top-[70%] right-[18%] w-10 h-4 rounded-full overflow-hidden flex rotate-45">
        <div className="w-1/2 h-full bg-teal-400/40" />
        <div className="w-1/2 h-full bg-emerald-300/30" />
      </div>
      <div className="floating-pill float-fast absolute top-[45%] left-[15%] w-8 h-3 rounded-full overflow-hidden flex -rotate-12">
        <div className="w-1/2 h-full bg-green-400/40" />
        <div className="w-1/2 h-full bg-white/20" />
      </div>

      {/* Medical Cross Symbol */}
      <div className="float-slow absolute top-[75%] left-[25%] opacity-20">
        <div className="relative w-10 h-10">
          <div className="absolute top-1/2 left-0 w-full h-2 bg-emerald-400/60 -translate-y-1/2 rounded-full" />
          <div className="absolute top-0 left-1/2 w-2 h-full bg-emerald-400/60 -translate-x-1/2 rounded-full" />
        </div>
      </div>

      {/* Pulse Rings (like heartbeat) */}
      <div className="absolute top-[35%] right-[35%]">
        <div className="pulse-ring absolute w-8 h-8 rounded-full border-2 border-emerald-400/50" />
        <div className="pulse-ring absolute w-8 h-8 rounded-full border-2 border-emerald-400/50" style={{ animationDelay: '0.5s' }} />
        <div className="pulse-ring absolute w-8 h-8 rounded-full border-2 border-emerald-400/50" style={{ animationDelay: '1s' }} />
        <div className="w-2 h-2 rounded-full bg-emerald-400/80" />
      </div>

      {/* 3D Floating cubes */}
      <div className="floating-cube float-slow absolute top-[20%] right-[15%] w-20 h-20" style={{ transformStyle: 'preserve-3d' }}>
        <div className="absolute inset-0 border-2 border-emerald-500/30 bg-emerald-500/5 backdrop-blur-sm" style={{ transform: 'translateZ(40px)' }} />
        <div className="absolute inset-0 border-2 border-emerald-500/20 bg-emerald-500/5" style={{ transform: 'translateZ(-40px)' }} />
      </div>

      <div className="floating-cube float-medium absolute top-[60%] left-[10%] w-16 h-16" style={{ transformStyle: 'preserve-3d' }}>
        <div className="absolute inset-0 border-2 border-green-500/30 bg-green-500/5 backdrop-blur-sm" style={{ transform: 'rotateY(45deg)' }} />
      </div>

      <div className="floating-cube float-fast absolute top-[40%] right-[25%] w-12 h-12" style={{ transformStyle: 'preserve-3d' }}>
        <div className="absolute inset-0 border-2 border-teal-500/40 bg-teal-500/10 rounded-lg" style={{ transform: 'rotateX(45deg) rotateY(45deg)' }} />
      </div>

      {/* Glowing ring */}
      <div className="float-slow absolute top-[15%] right-[20%] w-[350px] h-[350px]">
        <div className="absolute inset-0 rounded-full border-[25px] border-transparent animate-spin-slow"
          style={{
            background: 'linear-gradient(#0a0a0b, #0a0a0b) padding-box, conic-gradient(from 0deg, #10b981, #14b8a6, #22c55e, #10b981) border-box',
            animationDuration: '15s'
          }}
        />
      </div>

      {/* Small floating particles */}
      <div className="float-fast absolute top-[25%] left-[20%] w-3 h-3 rounded-full bg-emerald-400/60 blur-[2px]" />
      <div className="float-slow absolute top-[70%] right-[30%] w-4 h-4 rounded-full bg-green-400/50 blur-[2px]" />
      <div className="float-medium absolute top-[50%] left-[30%] w-2 h-2 rounded-full bg-teal-400/70 blur-[1px]" />
      <div className="float-fast absolute top-[35%] right-[40%] w-3 h-3 rounded-full bg-emerald-300/50 blur-[2px]" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
    </div>
  );
}

export default function Index() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animations
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      heroTl
        .to('.hero-badge', {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8
        })
        .to('.hero-title-line > span', {
          opacity: 1,
          y: 0,
          skewY: 0,
          duration: 1.2,
          stagger: 0.15
        }, '-=0.4')
        .to('.hero-subtitle', {
          opacity: 1,
          y: 0,
          duration: 0.8
        }, '-=0.6')
        .from('.hero-buttons > *', { // Keep from for elements not hidden by default
          opacity: 0,
          y: 30,
          duration: 0.6,
          stagger: 0.15
        }, '-=0.4')
        .from('.hero-scroll-indicator', {
          opacity: 0,
          y: -20,
          duration: 0.6
        }, '-=0.2');

      // Continuous scroll indicator animation
      gsap.to('.scroll-arrow', {
        y: 10,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });

      // Stats section
      gsap.from('.stat-item', {
        scrollTrigger: {
          trigger: '.stats-section',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 60,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
      });

      // Features section
      gsap.from('.features-header', {
        scrollTrigger: {
          trigger: '.features-section',
          start: 'top 85%'
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: 'power3.out'
      });

      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: '.feature-cards-grid',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 60,
        scale: 0.95,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out'
      });

      // How it works section
      gsap.from('.hiw-header', {
        scrollTrigger: {
          trigger: '.hiw-section',
          start: 'top 85%'
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: 'power3.out'
      });

      gsap.from('.hiw-step', {
        scrollTrigger: {
          trigger: '.hiw-steps',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 50,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power3.out'
      });

      // CTA section
      gsap.from('.cta-content', {
        scrollTrigger: {
          trigger: '.cta-section',
          start: 'top 85%'
        },
        opacity: 0,
        y: 60,
        scale: 0.97,
        duration: 0.9,
        ease: 'power3.out'
      });

      // Testimonials animation
      gsap.from('.testimonial-card', {
        scrollTrigger: {
          trigger: '.testimonials-section',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out'
      });


    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <SmoothScroll>
      <CustomCursor />
      <div ref={containerRef} className="min-h-screen bg-[#0a0a0b] text-white overflow-x-hidden">

        {/* Animated Background */}
        <FloatingShapes />

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-emerald-500/10">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">HURE Care</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-white/60 hover:text-emerald-400 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-white/60 hover:text-emerald-400 transition-colors">How it Works</a>
              <a href="#testimonials" className="text-sm text-white/60 hover:text-emerald-400 transition-colors">Testimonials</a>
            </nav>

            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="ghost" className="text-white/80 hover:text-emerald-400 hover:bg-emerald-500/10">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white border-0 shadow-lg shadow-emerald-500/25 group">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </header>


        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 z-10">
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center">
              {/* Badge */}
              <div className="hero-badge inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-400 mb-8 backdrop-blur-sm opacity-0">
                <Zap className="w-4 h-4" />
                <span>AI-Powered Healthcare Platform</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              {/* Title */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tight mb-8">
                <span className="hero-title-line block overflow-hidden">
                  <span className="block opacity-0">Modern Healthcare</span>
                </span>
                <span className="hero-title-line block overflow-hidden">
                  <span className="block bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent opacity-0">Documentation</span>
                </span>
              </h1>

              {/* Subtitle */}
              <p className="hero-subtitle text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed opacity-0">
                Streamline clinical notes, appointments, billing, and patient intake with intelligent automation. Built for healthcare providers.
              </p>

              {/* Buttons */}
              <div className="hero-buttons flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 h-14 text-base font-semibold group shadow-xl shadow-white/10">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30 hover:border-emerald-400 px-8 h-14 text-base font-semibold group">
                      <Play className="w-5 h-5 mr-2 fill-emerald-400" />
                      Watch Demo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl bg-black/90 border-emerald-500/20 p-0 overflow-hidden">
                    <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                          <Play className="w-8 h-8 text-emerald-500 fill-emerald-500 ml-1" />
                        </div>
                        <p className="text-emerald-400 font-medium">Demo Video Placeholder</p>
                        <p className="text-white/40 text-sm mt-2">Replace with actual demo video embed</p>
                      </div>
                      <DialogClose className="absolute top-4 right-4 rounded-full p-2 bg-black/50 hover:bg-black/70 text-white transition-colors">
                        <X className="w-4 h-4" />
                      </DialogClose>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="hero-scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center gap-2 text-white/40">
              <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
              <ArrowRight className="scroll-arrow w-4 h-4 rotate-90" />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section relative py-24 px-6 border-y border-emerald-500/10 z-10">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {stats.map((stat) => (
                <div key={stat.label} className="stat-item text-center">
                  <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
                    {stat.value}<span className="text-emerald-400">{stat.suffix}</span>
                  </div>
                  <div className="text-xs text-white/50 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features-section relative py-32 px-6 z-10">
          <div className="container mx-auto max-w-6xl">
            <div className="features-header text-center mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
                Everything you need
              </h2>
              <p className="text-lg text-white/50 max-w-2xl mx-auto">
                A complete suite of AI-powered tools to manage your healthcare practice efficiently
              </p>
            </div>

            <div className="feature-cards-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="feature-card group relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10"
                >
                  <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-emerald-400 transition-colors">{feature.title}</h3>
                    <p className="text-white/60 leading-relaxed">{feature.description}</p>
                  </div>

                  {/* Hover glow effect */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="hiw-section relative py-32 px-6 z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.03] to-transparent" />

          <div className="container mx-auto max-w-5xl relative z-10">
            <div className="hiw-header text-center mb-20">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
                How it works
              </h2>
              <p className="text-lg text-white/50 max-w-2xl mx-auto">
                From patient encounter to signed clinical note in three simple steps
              </p>
            </div>

            <div className="hiw-steps grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
              {howItWorks.map((item, index) => (
                <div key={item.step} className="hiw-step relative text-center">
                  {/* Step number background */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[120px] font-bold text-emerald-500/[0.05] pointer-events-none select-none">
                    {item.step}
                  </div>

                  <div className="relative">
                    {/* Icon */}
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30 flex items-center justify-center shadow-xl shadow-emerald-500/10">
                      <item.icon className="w-10 h-10 text-emerald-400" />
                    </div>

                    {/* Step indicator */}
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-bold mb-4 shadow-lg shadow-emerald-500/30">
                      {index + 1}
                    </div>

                    <h3 className="text-xl font-semibold mb-3 text-white">{item.title}</h3>
                    <p className="text-white/50 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="testimonials-section relative py-32 px-6 bg-emerald-950/10 z-10">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
                Trusted by Professionals
              </h2>
              <p className="text-lg text-white/50 max-w-2xl mx-auto">
                See what medical professionals across Kenya are saying about Hure Care
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, i) => (
                <div key={i} className="testimonial-card">
                  <TestimonialCard {...testimonial} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section relative py-32 px-6 z-10">
          <div className="container mx-auto max-w-4xl">
            <div className="cta-content relative bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-12 md:p-16 text-center overflow-hidden">
              {/* Gradient orb */}
              <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  Ready to transform<br />
                  <span className="text-emerald-400">your practice?</span>
                </h2>
                <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto">
                  Join healthcare providers who are already using HURE Care to streamline their operations.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                  <Link to="/auth">
                    <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white px-10 h-14 text-base font-semibold shadow-xl shadow-emerald-500/25">
                      Start Free 14-Day Trial
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center justify-center gap-6 text-sm text-white/40">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    No credit card required
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Cancel anytime
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative py-16 px-6 border-t border-emerald-500/10">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">HURE Care</span>
              </div>

              <p className="text-sm text-white/40">
                © 2024 HURE Care. Built for healthcare providers in Kenya & East Africa.
              </p>

              <div className="flex items-center gap-6 text-sm text-white/40">
                <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">Terms</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </div >
    </SmoothScroll >
  );
}
