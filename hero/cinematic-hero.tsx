"use client";

import React, { useEffect, useRef } from "react";

// Use global GSAP loaded via CDN in index.html (already present in the project)
declare const gsap: any;
declare const ScrollTrigger: any;

if (typeof window !== "undefined" && typeof gsap !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const INJECTED_STYLES = `
  .gsap-reveal { visibility: hidden; }

  /* Environment Overlays */
  .film-grain {
      position: absolute; inset: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 50; opacity: 0.05; mix-blend-mode: overlay;
      background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noiseFilter)"/></svg>');
  }

  .bg-grid-theme {
      background-size: 60px 60px;
      background-image: 
          linear-gradient(to right, rgba(13, 27, 76, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(13, 27, 76, 0.05) 1px, transparent 1px);
      mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
      -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
  }

  /* -------------------------------------------------------------------
     PHYSICAL SKEUOMORPHIC MATERIALS (Restored 3D Depth)
  ---------------------------------------------------------------------- */
  
  .text-3d-matte {
      color: #0d1b4c;
      text-shadow: 
          0 10px 30px rgba(13, 27, 76, 0.2), 
          0 2px 4px rgba(13, 27, 76, 0.1);
  }

  .text-silver-matte {
      background: linear-gradient(180deg, #0d1b4c 0%, rgba(13, 27, 76, 0.4) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transform: translateZ(0);
      filter: 
          drop-shadow(0px 10px 20px rgba(13, 27, 76, 0.15)) 
          drop-shadow(0px 2px 4px rgba(13, 27, 76, 0.1));
  }

  .text-card-silver-matte {
      background: linear-gradient(180deg, #FFFFFF 0%, #A1A1AA 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transform: translateZ(0);
      filter: 
          drop-shadow(0px 12px 24px rgba(0,0,0,0.8)) 
          drop-shadow(0px 4px 8px rgba(0,0,0,0.6));
  }

  .premium-depth-card {
      background: linear-gradient(145deg, #162C6D 0%, #0A101D 100%);
      box-shadow: 
          0 40px 100px -20px rgba(0, 0, 0, 0.9),
          0 20px 40px -20px rgba(0, 0, 0, 0.8),
          inset 0 1px 2px rgba(255, 255, 255, 0.2),
          inset 0 -2px 4px rgba(0, 0, 0, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.04);
      position: relative;
  }

  .card-sheen {
      position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 50;
      background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.06) 0%, transparent 40%);
      mix-blend-mode: screen; transition: opacity 0.3s ease;
  }

  .iphone-bezel {
      background-color: #111;
      box-shadow: 
          inset 0 0 0 2px #52525B, 
          inset 0 0 0 7px #000, 
          0 40px 80px -15px rgba(0,0,0,0.9),
          0 15px 25px -5px rgba(0,0,0,0.7);
      transform-style: preserve-3d;
  }

  .hardware-btn {
      background: linear-gradient(90deg, #404040 0%, #171717 100%);
      box-shadow: 
          -2px 0 5px rgba(0,0,0,0.8),
          inset -1px 0 1px rgba(255,255,255,0.15),
          inset 1px 0 2px rgba(0,0,0,0.8);
      border-left: 1px solid rgba(255,255,255,0.05);
  }
  
  .screen-glare {
      background: linear-gradient(110deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 45%);
  }

  .widget-depth {
      background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
      box-shadow: 
          0 10px 20px rgba(0,0,0,0.3),
          inset 0 1px 1px rgba(255,255,255,0.05),
          inset 0 -1px 1px rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.03);
  }

  .floating-ui-badge {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%);
      backdrop-filter: blur(24px); 
      -webkit-backdrop-filter: blur(24px);
      box-shadow: 
          0 0 0 1px rgba(255, 255, 255, 0.1),
          0 25px 50px -12px rgba(0, 0, 0, 0.8),
          inset 0 1px 1px rgba(255,255,255,0.2),
          inset 0 -1px 1px rgba(0,0,0,0.5);
  }

  .btn-modern-light, .btn-modern-dark {
      transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
      cursor: pointer;
      border: none;
      font-family: inherit;
  }
  .btn-modern-light {
      background: linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%);
      color: #0F172A;
      box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.1), 0 12px 24px -4px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,1), inset 0 -3px 6px rgba(0,0,0,0.06);
  }
  .btn-modern-light:hover {
      transform: translateY(-3px);
      box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 6px 12px -2px rgba(0,0,0,0.15), 0 20px 32px -6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,1), inset 0 -3px 6px rgba(0,0,0,0.06);
  }
  .btn-modern-light:active {
      transform: translateY(1px);
      background: linear-gradient(180deg, #F1F5F9 0%, #E2E8F0 100%);
      box-shadow: 0 0 0 1px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.1), inset 0 3px 6px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(0,0,0,0.02);
  }
  .btn-modern-dark {
      background: linear-gradient(180deg, #27272A 0%, #18181B 100%);
      color: #FFFFFF;
      box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.6), 0 12px 24px -4px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -3px 6px rgba(0,0,0,0.8);
  }
  .btn-modern-dark:hover {
      transform: translateY(-3px);
      background: linear-gradient(180deg, #3F3F46 0%, #27272A 100%);
      box-shadow: 0 0 0 1px rgba(255,255,255,0.15), 0 6px 12px -2px rgba(0,0,0,0.7), 0 20px 32px -6px rgba(0,0,0,1), inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -3px 6px rgba(0,0,0,0.8);
  }
  .btn-modern-dark:active {
      transform: translateY(1px);
      background: #18181B;
      box-shadow: 0 0 0 1px rgba(255,255,255,0.05), inset 0 3px 8px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(0,0,0,0.5);
  }

  .progress-ring {
      transform: rotate(-90deg);
      transform-origin: center;
      stroke-dasharray: 402;
      stroke-dashoffset: 402;
      stroke-linecap: round;
  }

  /* Utility classes used by the component (no Tailwind dependency) */
  .ch-relative { position: relative; }
  .ch-absolute { position: absolute; }
  .ch-inset-0 { inset: 0; }
  .ch-w-screen { width: 100vw; }
  .ch-h-screen { height: 100vh; }
  .ch-w-full { width: 100%; }
  .ch-h-full { height: 100%; }
  .ch-overflow-hidden { overflow: hidden; }
  .ch-flex { display: flex; }
  .ch-flex-col { flex-direction: column; }
  .ch-items-center { align-items: center; }
  .ch-justify-center { justify-content: center; }
  .ch-justify-evenly { justify-content: space-evenly; }
  .ch-text-center { text-align: center; }
  .ch-font-sans { font-family: 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif; }
  .ch-antialiased { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  .ch-pointer-events-none { pointer-events: none; }
  .ch-pointer-events-auto { pointer-events: auto; }
  .ch-z-0 { z-index: 0; }
  .ch-z-10 { z-index: 10; }
  .ch-z-20 { z-index: 20; }
  .ch-z-30 { z-index: 30; }
  .ch-z-40 { z-index: 40; }
  .ch-z-50 { z-index: 50; }
  .ch-will-change-transform { will-change: transform; }
  .ch-transform-style-3d { transform-style: preserve-3d; }
  .ch-opacity-50 { opacity: 0.5; }
  .ch-mb-2 { margin-bottom: 0.5rem; }
  .ch-mb-6 { margin-bottom: 1.5rem; }
  .ch-mb-8 { margin-bottom: 2rem; }
  .ch-mb-12 { margin-bottom: 3rem; }
  .ch-px-4 { padding-left: 1rem; padding-right: 1rem; }
  .ch-py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
  .ch-gap-3 { gap: 0.75rem; }
  .ch-gap-4 { gap: 1rem; }
  .ch-gap-6 { gap: 1.5rem; }
  .ch-max-w-xl { max-width: 36rem; }
  .ch-max-w-7xl { max-width: 80rem; }
  .ch-mx-auto { margin-left: auto; margin-right: auto; }
  .ch-font-bold { font-weight: 700; }
  .ch-font-extrabold { font-weight: 800; }
  .ch-font-black { font-weight: 900; }
  .ch-font-light { font-weight: 300; }
  .ch-font-normal { font-weight: 400; }
  .ch-font-medium { font-weight: 500; }
  .ch-font-semibold { font-weight: 600; }
  .ch-tracking-tight { letter-spacing: -0.025em; }
  .ch-tracking-tighter { letter-spacing: -0.05em; }
  .ch-tracking-widest { letter-spacing: 0.1em; }
  .ch-uppercase { text-transform: uppercase; }
  .ch-leading-relaxed { line-height: 1.625; }
  .ch-leading-none { line-height: 1; }
  .ch-text-white { color: #fff; }
  .ch-text-muted { color: #6b7280; }
  .ch-rounded-full { border-radius: 9999px; }
  .ch-rounded-xl { border-radius: 0.75rem; }
  .ch-rounded-2xl { border-radius: 1rem; }
  .ch-space-y-3 > * + * { margin-top: 0.75rem; }
  .ch-drop-shadow-md { filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06)); }
  .ch-drop-shadow-lg { filter: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1)); }
  .ch-shadow-inner { box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05); }
  .ch-shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
  .ch-animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }

  /* Responsive helpers */
  @media (min-width: 640px) {
    .ch-sm\\:flex-row { flex-direction: row; }
  }
  @media (min-width: 768px) {
    .ch-md\\:text-7xl { font-size: 4.5rem; line-height: 1; }
    .ch-md\\:block { display: block; }
    .ch-md\\:scale-85 { transform: scale(0.85); }
    .ch-md\\:w-\\[85vw\\] { width: 85vw; }
    .ch-md\\:h-\\[85vh\\] { height: 85vh; }
    .ch-md\\:rounded-\\[40px\\] { border-radius: 40px; }
  }
  @media (min-width: 1024px) {
    .ch-lg\\:text-\\[6rem\\] { font-size: 6rem; line-height: 1; }
    .ch-lg\\:text-\\[8rem\\] { font-size: 8rem; line-height: 1; }
    .ch-lg\\:text-7xl { font-size: 4.5rem; line-height: 1; }
    .ch-lg\\:text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
    .ch-lg\\:text-lg { font-size: 1.125rem; line-height: 1.75rem; }
    .ch-lg\\:grid { display: grid; }
    .ch-lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .ch-lg\\:gap-8 { gap: 2rem; }
    .ch-lg\\:order-1 { order: 1; }
    .ch-lg\\:order-2 { order: 2; }
    .ch-lg\\:order-3 { order: 3; }
    .ch-lg\\:justify-end { justify-content: flex-end; }
    .ch-lg\\:text-left { text-align: left; }
    .ch-lg\\:px-12 { padding-left: 3rem; padding-right: 3rem; }
    .ch-lg\\:py-0 { padding-top: 0; padding-bottom: 0; }
    .ch-lg\\:h-\\[600px\\] { height: 600px; }
    .ch-lg\\:scale-100 { transform: scale(1); }
    .ch-lg\\:top-12 { top: 3rem; }
    .ch-lg\\:left-\\[-80px\\] { left: -80px; }
    .ch-lg\\:bottom-20 { bottom: 5rem; }
    .ch-lg\\:right-\\[-80px\\] { right: -80px; }
    .ch-lg\\:p-4 { padding: 1rem; }
    .ch-lg\\:gap-4 { gap: 1rem; }
    .ch-lg\\:w-10 { width: 2.5rem; }
    .ch-lg\\:h-10 { height: 2.5rem; }
    .ch-lg\\:text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    .ch-lg\\:text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .ch-lg\\:text-xs { font-size: 0.75rem; line-height: 1rem; }
    .ch-lg\\:mb-5 { margin-bottom: 1.25rem; }
    .ch-lg\\:max-w-none { max-width: none; }
    .ch-lg\\:px-0 { padding-left: 0; padding-right: 0; }
    .ch-lg\\:mt-0 { margin-top: 0; }
  }

  .ch-text-5xl { font-size: 3rem; line-height: 1; }
  .ch-text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
  .ch-text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
  .ch-text-2xl { font-size: 1.5rem; line-height: 2rem; }
  .ch-text-xl { font-size: 1.25rem; line-height: 1.75rem; }
  .ch-text-lg { font-size: 1.125rem; line-height: 1.75rem; }
  .ch-text-sm { font-size: 0.875rem; line-height: 1.25rem; }
  .ch-text-xs { font-size: 0.75rem; line-height: 1rem; }
  .ch-text-\\[10px\\] { font-size: 10px; }
  .ch-text-\\[8px\\] { font-size: 8px; }
  .ch-w-\\[92vw\\] { width: 92vw; }
  .ch-h-\\[92vh\\] { height: 92vh; }
  .ch-rounded-\\[32px\\] { border-radius: 32px; }
  .ch-rounded-\\[1\\.25rem\\] { border-radius: 1.25rem; }
  .ch-w-\\[280px\\] { width: 280px; }
  .ch-h-\\[580px\\] { height: 580px; }
  .ch-rounded-\\[3rem\\] { border-radius: 3rem; }
  .ch-rounded-\\[2\\.5rem\\] { border-radius: 2.5rem; }
  .ch-w-44 { width: 11rem; }
  .ch-h-44 { height: 11rem; }
  .ch-w-9 { width: 2.25rem; }
  .ch-h-9 { height: 2.25rem; }
  .ch-w-10 { width: 2.5rem; }
  .ch-h-10 { height: 2.5rem; }
  .ch-w-8 { width: 2rem; }
  .ch-h-8 { height: 2rem; }
  .ch-w-7 { width: 1.75rem; }
  .ch-h-7 { height: 1.75rem; }
  .ch-w-4 { width: 1rem; }
  .ch-h-4 { height: 1rem; }
  .ch-w-1\\.5 { width: 0.375rem; }
  .ch-h-1\\.5 { height: 0.375rem; }
  .ch-h-2 { height: 0.5rem; }
  .ch-h-1\\.5 { height: 0.375rem; }
  .ch-w-20 { width: 5rem; }
  .ch-w-16 { width: 4rem; }
  .ch-w-12 { width: 3rem; }
  .ch-w-24 { width: 6rem; }
  .ch-w-\\[100px\\] { width: 100px; }
  .ch-h-\\[28px\\] { height: 28px; }
  .ch-w-\\[120px\\] { width: 120px; }
  .ch-h-\\[4px\\] { height: 4px; }
  .ch-h-\\[380px\\] { height: 380px; }
  .ch-scale-\\[0\\.65\\] { transform: scale(0.65); }
  .ch-top-6 { top: 1.5rem; }
  .ch-left-\\[-15px\\] { left: -15px; }
  .ch-bottom-12 { bottom: 3rem; }
  .ch-right-\\[-15px\\] { right: -15px; }
  .ch-p-3 { padding: 0.75rem; }
  .ch-pt-12 { padding-top: 3rem; }
  .ch-px-5 { padding-left: 1.25rem; padding-right: 1.25rem; }
  .ch-pb-8 { padding-bottom: 2rem; }
  .ch-order-1 { order: 1; }
  .ch-order-2 { order: 2; }
  .ch-order-3 { order: 3; }
  .ch-hidden { display: none; }
  .ch-bg-background { background: linear-gradient(180deg, #fff0de 0%, #fffaf4 100%); }
  .ch-text-foreground { color: #0d1b4c; }
`;

export interface CinematicHeroProps {
  brandName?: string;
  tagline1?: string;
  tagline2?: string;
  cardHeading?: string;
  cardDescription?: React.ReactNode;
  metricValue?: number;
  metricLabel?: string;
  ctaHeading?: string;
  ctaDescription?: string;
  className?: string;
}

export function CinematicHero({
  brandName = "FirstStep",
  tagline1 = "Find your first job,",
  tagline2 = "not just another listing.",
  cardHeading = "Jobs, curated daily.",
  cardDescription = (
    <>
      <span className="ch-text-white ch-font-semibold">FirstStep</span> collects fresher jobs and internships across India every day, removes duplicates, and tags them by role and city so you can focus on applying.
    </>
  ),
  metricValue = 1240,
  metricLabel = "Open Roles",
  ctaHeading = "Start your search.",
  ctaDescription = "Browse thousands of fresher and internship roles updated daily from public sources across India.",
  className = "",
  ...props
}: CinematicHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCardRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  // 1. High-Performance Mouse Interaction Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.scrollY > window.innerHeight * 2) return;

      cancelAnimationFrame(requestRef.current);

      requestRef.current = requestAnimationFrame(() => {
        if (mainCardRef.current && mockupRef.current) {
          const rect = mainCardRef.current.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          mainCardRef.current.style.setProperty("--mouse-x", `${mouseX}px`);
          mainCardRef.current.style.setProperty("--mouse-y", `${mouseY}px`);

          const xVal = (e.clientX / window.innerWidth - 0.5) * 2;
          const yVal = (e.clientY / window.innerHeight - 0.5) * 2;

          gsap.to(mockupRef.current, {
            rotationY: xVal * 12,
            rotationX: -yVal * 12,
            ease: "power3.out",
            duration: 1.2,
          });
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // 2. Complex Cinematic Scroll Timeline
  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      gsap.set(".text-track", { autoAlpha: 0, y: 60, scale: 0.85, filter: "blur(20px)", rotationX: -20 });
      gsap.set(".text-days", { autoAlpha: 1, clipPath: "inset(0 100% 0 0)" });
      gsap.set(".main-card", { y: window.innerHeight + 200, autoAlpha: 1 });
      gsap.set([".card-left-text", ".card-right-text", ".mockup-scroll-wrapper", ".floating-badge", ".phone-widget"], { autoAlpha: 0 });
      gsap.set(".cta-wrapper", { autoAlpha: 0, scale: 0.8, filter: "blur(30px)" });

      const introTl = gsap.timeline({ delay: 0.3 });
      introTl
        .to(".text-track", { duration: 1.8, autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", rotationX: 0, ease: "expo.out" })
        .to(".text-days", { duration: 1.4, clipPath: "inset(0 0% 0 0)", ease: "power4.inOut" }, "-=1.0");

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=7000",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      scrollTl
        .to([".hero-text-wrapper", ".bg-grid-theme"], { scale: 1.15, filter: "blur(20px)", opacity: 0.2, ease: "power2.inOut", duration: 2 }, 0)
        .to(".main-card", { y: 0, ease: "power3.inOut", duration: 2 }, 0)
        .to(".main-card", { width: "100%", height: "100%", borderRadius: "0px", ease: "power3.inOut", duration: 1.5 })
        .fromTo(
          ".mockup-scroll-wrapper",
          { y: 300, z: -500, rotationX: 50, rotationY: -30, autoAlpha: 0, scale: 0.6 },
          { y: 0, z: 0, rotationX: 0, rotationY: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 2.5 },
          "-=0.8"
        )
        .fromTo(".phone-widget", { y: 40, autoAlpha: 0, scale: 0.95 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.15, ease: "back.out(1.2)", duration: 1.5 }, "-=1.5")
        .to(".progress-ring", { strokeDashoffset: 60, duration: 2, ease: "power3.inOut" }, "-=1.2")
        .to(".counter-val", { innerHTML: metricValue, snap: { innerHTML: 1 }, duration: 2, ease: "expo.out" }, "-=2.0")
        .fromTo(".floating-badge", { y: 100, autoAlpha: 0, scale: 0.7, rotationZ: -10 }, { y: 0, autoAlpha: 1, scale: 1, rotationZ: 0, ease: "back.out(1.5)", duration: 1.5, stagger: 0.2 }, "-=2.0")
        .fromTo(".card-left-text", { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: "power4.out", duration: 1.5 }, "-=1.5")
        .fromTo(".card-right-text", { x: 50, autoAlpha: 0, scale: 0.8 }, { x: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 1.5 }, "<")
        .to({}, { duration: 2.5 })
        .set(".hero-text-wrapper", { autoAlpha: 0 })
        .set(".cta-wrapper", { autoAlpha: 1 })
        .to({}, { duration: 1.5 })
        .to([".mockup-scroll-wrapper", ".floating-badge", ".card-left-text", ".card-right-text"], {
          scale: 0.9,
          y: -40,
          z: -200,
          autoAlpha: 0,
          ease: "power3.in",
          duration: 1.2,
          stagger: 0.05,
        })
        .to(
          ".main-card",
          {
            width: isMobile ? "92vw" : "85vw",
            height: isMobile ? "92vh" : "85vh",
            borderRadius: isMobile ? "32px" : "40px",
            ease: "expo.inOut",
            duration: 1.8,
          },
          "pullback"
        )
        .to(".cta-wrapper", { scale: 1, filter: "blur(0px)", ease: "expo.inOut", duration: 1.8 }, "pullback")
        .to(".main-card", { y: -window.innerHeight - 300, ease: "power3.in", duration: 1.5 });
    }, containerRef);

    return () => ctx.revert();
  }, [metricValue]);

  return (
    <div
      ref={containerRef}
      className={`ch-relative ch-w-screen ch-h-screen ch-overflow-hidden ch-flex ch-items-center ch-justify-center ch-bg-background ch-text-foreground ch-font-sans ch-antialiased ${className}`}
      style={{ perspective: "1500px" }}
      {...props}
    >
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />
      <div className="film-grain" aria-hidden="true" />
      <div className="bg-grid-theme ch-absolute ch-inset-0 ch-z-0 ch-pointer-events-none ch-opacity-50" aria-hidden="true" />

      {/* BACKGROUND LAYER: Hero Texts */}
      <div className="hero-text-wrapper ch-absolute ch-z-10 ch-flex ch-flex-col ch-items-center ch-justify-center ch-text-center ch-w-screen ch-px-4 ch-will-change-transform ch-transform-style-3d">
        <h1 className="text-track gsap-reveal text-3d-matte ch-text-5xl ch-md:text-7xl ch-lg:text-[6rem] ch-font-bold ch-tracking-tight ch-mb-2">
          {tagline1}
        </h1>
        <h1 className="text-days gsap-reveal text-silver-matte ch-text-5xl ch-md:text-7xl ch-lg:text-[6rem] ch-font-extrabold ch-tracking-tighter">
          {tagline2}
        </h1>
      </div>

      {/* BACKGROUND LAYER 2: Tactile CTA Buttons */}
      <div className="cta-wrapper ch-absolute ch-z-10 ch-flex ch-flex-col ch-items-center ch-justify-center ch-text-center ch-w-screen ch-px-4 gsap-reveal ch-pointer-events-auto ch-will-change-transform">
        <h2 className="ch-text-4xl ch-md:text-7xl ch-lg:text-7xl ch-font-bold ch-mb-6 ch-tracking-tight text-silver-matte">
          {ctaHeading}
        </h2>
        <p className="ch-text-muted ch-text-lg ch-md:text-xl ch-mb-12 ch-max-w-xl ch-mx-auto ch-font-light ch-leading-relaxed">
          {ctaDescription}
        </p>
        <div className="ch-flex ch-flex-col ch-sm:flex-row ch-gap-6">
          <a
            href="#list"
            className="btn-modern-light ch-flex ch-items-center ch-justify-center ch-gap-3 ch-px-8 ch-py-4 ch-rounded-[1.25rem] group"
            style={{ padding: "1rem 2rem" }}
          >
            <svg className="ch-w-8 ch-h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="ch-text-left">
              <div className="ch-text-[10px] ch-font-bold ch-tracking-wider" style={{ color: "#737373", textTransform: "uppercase", marginBottom: "-2px" }}>
                Browse
              </div>
              <div className="ch-text-xl ch-font-bold ch-leading-none ch-tracking-tight">All Jobs</div>
            </div>
          </a>
          <a
            href="#list"
            className="btn-modern-dark ch-flex ch-items-center ch-justify-center ch-gap-3 ch-px-8 ch-py-4 ch-rounded-[1.25rem] group"
            style={{ padding: "1rem 2rem" }}
          >
            <svg className="ch-w-7 ch-h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="ch-text-left">
              <div className="ch-text-[10px] ch-font-bold ch-tracking-wider" style={{ color: "#a3a3a3", textTransform: "uppercase", marginBottom: "-2px" }}>
                Search
              </div>
              <div className="ch-text-xl ch-font-bold ch-leading-none ch-tracking-tight">By Role</div>
            </div>
          </a>
        </div>
      </div>

      {/* FOREGROUND LAYER: The Physical Deep Blue Card */}
      <div className="ch-absolute ch-inset-0 ch-z-20 ch-flex ch-items-center ch-justify-center ch-pointer-events-none" style={{ perspective: "1500px" }}>
        <div
          ref={mainCardRef}
          className="main-card premium-depth-card ch-relative ch-overflow-hidden gsap-reveal ch-flex ch-items-center ch-justify-center ch-pointer-events-auto ch-w-[92vw] ch-md:w-[85vw] ch-h-[92vh] ch-md:h-[85vh] ch-rounded-[32px] ch-md:rounded-[40px]"
        >
          <div className="card-sheen" aria-hidden="true" />

          <div className="ch-relative ch-w-full ch-h-full ch-max-w-7xl ch-mx-auto ch-px-4 ch-lg:px-12 ch-flex ch-flex-col ch-justify-evenly ch-lg:grid ch-lg:grid-cols-3 ch-items-center ch-lg:gap-8 ch-z-10 ch-py-6 ch-lg:py-0">
            {/* Brand Name */}
            <div className="card-right-text gsap-reveal ch-order-1 ch-lg:order-3 ch-flex ch-justify-center ch-lg:justify-end ch-z-20 ch-w-full">
              <h2 className="ch-text-6xl ch-md:text-[6rem] ch-lg:text-[8rem] ch-font-black ch-uppercase ch-tracking-tighter text-card-silver-matte ch-lg:mt-0">
                {brandName}
              </h2>
            </div>

            {/* iPhone Mockup */}
            <div className="mockup-scroll-wrapper ch-order-2 ch-lg:order-2 ch-relative ch-w-full ch-h-[380px] ch-lg:h-[600px] ch-flex ch-items-center ch-justify-center ch-z-10" style={{ perspective: "1000px" }}>
              <div className="ch-relative ch-w-full ch-h-full ch-flex ch-items-center ch-justify-center ch-scale-[0.65] ch-md:scale-85 ch-lg:scale-100">
                <div ref={mockupRef} className="ch-relative ch-w-[280px] ch-h-[580px] ch-rounded-[3rem] iphone-bezel ch-flex ch-flex-col ch-will-change-transform ch-transform-style-3d">
                  {/* Hardware Buttons */}
                  <div className="ch-absolute hardware-btn" style={{ top: "120px", left: "-3px", width: "3px", height: "25px" }} aria-hidden="true" />
                  <div className="ch-absolute hardware-btn" style={{ top: "160px", left: "-3px", width: "3px", height: "45px" }} aria-hidden="true" />
                  <div className="ch-absolute hardware-btn" style={{ top: "220px", left: "-3px", width: "3px", height: "45px" }} aria-hidden="true" />
                  <div className="ch-absolute hardware-btn" style={{ top: "170px", right: "-3px", width: "3px", height: "70px", transform: "scaleX(-1)" }} aria-hidden="true" />

                  {/* Screen */}
                  <div className="ch-absolute" style={{ inset: "7px", background: "#050914", borderRadius: "2.5rem", overflow: "hidden", boxShadow: "inset 0 0 15px rgba(0,0,0,1)", color: "white", zIndex: 10 }}>
                    <div className="ch-absolute ch-inset-0 screen-glare ch-z-40 ch-pointer-events-none" aria-hidden="true" />

                    {/* Dynamic Island */}
                    <div className="ch-absolute" style={{ top: "5px", left: "50%", transform: "translateX(-50%)", width: "100px", height: "28px", background: "black", borderRadius: "9999px", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 12px", boxShadow: "inset 0 -1px 2px rgba(255,255,255,0.1)" }}>
                      <div className="ch-w-1.5 ch-h-1.5 ch-rounded-full ch-animate-pulse" style={{ background: "#22c55e", boxShadow: "0 0 8px rgba(34,197,94,0.8)" }} />
                    </div>

                    {/* App UI */}
                    <div className="ch-relative ch-w-full ch-h-full" style={{ paddingTop: "3rem", paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "2rem", display: "flex", flexDirection: "column" }}>
                      <div className="phone-widget ch-flex" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                        <div className="ch-flex ch-flex-col">
                          <span className="ch-text-[10px]" style={{ color: "#a3a3a3", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: "0.25rem" }}>
                            Today
                          </span>
                          <span className="ch-text-xl ch-font-bold ch-tracking-tight ch-text-white ch-drop-shadow-md">Jobs Feed</span>
                        </div>
                        <div className="ch-w-9 ch-h-9 ch-rounded-full ch-flex ch-items-center ch-justify-center ch-font-bold ch-text-sm" style={{ background: "rgba(255,255,255,0.05)", color: "#e5e5e5", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)" }}>
                          FS
                        </div>
                      </div>

                      <div className="phone-widget ch-relative ch-w-44 ch-h-44 ch-mx-auto ch-flex ch-items-center ch-justify-center" style={{ marginBottom: "2rem", filter: "drop-shadow(0 15px 25px rgba(0,0,0,0.8))" }}>
                        <svg className="ch-absolute ch-inset-0 ch-w-full ch-h-full" aria-hidden="true">
                          <circle cx="88" cy="88" r="64" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                          <circle className="progress-ring" cx="88" cy="88" r="64" fill="none" stroke="#f97316" strokeWidth="12" />
                        </svg>
                        <div className="ch-text-center ch-z-10 ch-flex ch-flex-col ch-items-center">
                          <span className="counter-val ch-text-4xl ch-font-extrabold ch-tracking-tighter ch-text-white">0</span>
                          <span className="ch-text-[8px]" style={{ color: "rgba(253,186,116,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginTop: "0.125rem" }}>
                            {metricLabel}
                          </span>
                        </div>
                      </div>

                      <div className="ch-space-y-3">
                        <div className="phone-widget widget-depth ch-rounded-2xl ch-p-3 ch-flex ch-items-center">
                          <div className="ch-w-10 ch-h-10 ch-rounded-xl ch-flex ch-items-center ch-justify-center" style={{ marginRight: "0.75rem", background: "linear-gradient(to bottom right, rgba(249,115,22,0.2), rgba(234,88,12,0.05))", border: "1px solid rgba(251,146,60,0.2)" }}>
                            <svg className="ch-w-4 ch-h-4" style={{ color: "#fb923c" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="ch-h-2 ch-w-20" style={{ background: "#d4d4d4", borderRadius: "9999px", marginBottom: "0.5rem" }} />
                            <div className="ch-h-1.5 ch-w-12" style={{ background: "#525252", borderRadius: "9999px" }} />
                          </div>
                        </div>
                        <div className="phone-widget widget-depth ch-rounded-2xl ch-p-3 ch-flex ch-items-center">
                          <div className="ch-w-10 ch-h-10 ch-rounded-xl ch-flex ch-items-center ch-justify-center" style={{ marginRight: "0.75rem", background: "linear-gradient(to bottom right, rgba(16,185,129,0.2), rgba(5,150,105,0.05))", border: "1px solid rgba(52,211,153,0.2)" }}>
                            <svg className="ch-w-4 ch-h-4" style={{ color: "#34d399" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="ch-h-2 ch-w-16" style={{ background: "#d4d4d4", borderRadius: "9999px", marginBottom: "0.5rem" }} />
                            <div className="ch-h-1.5 ch-w-24" style={{ background: "#525252", borderRadius: "9999px" }} />
                          </div>
                        </div>
                      </div>

                      <div className="ch-absolute" style={{ bottom: "8px", left: "50%", transform: "translateX(-50%)", width: "120px", height: "4px", background: "rgba(255,255,255,0.2)", borderRadius: "9999px", boxShadow: "0 1px 2px rgba(0,0,0,0.5)" }} />
                    </div>
                  </div>
                </div>

                {/* Floating Badges */}
                <div className="floating-badge ch-absolute ch-flex ch-top-6 ch-lg:top-12 ch-left-[-15px] ch-lg:left-[-80px] floating-ui-badge ch-rounded-xl ch-lg:rounded-2xl ch-p-3 ch-lg:p-4 ch-items-center ch-gap-3 ch-lg:gap-4 ch-z-30">
                  <div className="ch-w-8 ch-h-8 ch-lg:w-10 ch-lg:h-10 ch-rounded-full ch-flex ch-items-center ch-justify-center" style={{ background: "linear-gradient(to bottom, rgba(249,115,22,0.2), rgba(154,52,18,0.1))", border: "1px solid rgba(251,146,60,0.3)" }}>
                    <span className="ch-text-base ch-lg:text-xl ch-drop-shadow-lg" aria-hidden="true">
                      🔥
                    </span>
                  </div>
                  <div>
                    <p className="ch-text-white ch-text-xs ch-lg:text-sm ch-font-bold ch-tracking-tight">New today</p>
                    <p style={{ color: "rgba(253,186,116,0.5)", fontSize: "10px" }} className="ch-lg:text-xs ch-font-medium">
                      48 roles added
                    </p>
                  </div>
                </div>

                <div className="floating-badge ch-absolute ch-flex ch-bottom-12 ch-lg:bottom-20 ch-right-[-15px] ch-lg:right-[-80px] floating-ui-badge ch-rounded-xl ch-lg:rounded-2xl ch-p-3 ch-lg:p-4 ch-items-center ch-gap-3 ch-lg:gap-4 ch-z-30">
                  <div className="ch-w-8 ch-h-8 ch-lg:w-10 ch-lg:h-10 ch-rounded-full ch-flex ch-items-center ch-justify-center" style={{ background: "linear-gradient(to bottom, rgba(99,102,241,0.2), rgba(67,56,202,0.1))", border: "1px solid rgba(129,140,248,0.3)" }}>
                    <span className="ch-text-base ch-lg:text-lg ch-drop-shadow-lg" aria-hidden="true">
                      📍
                    </span>
                  </div>
                  <div>
                    <p className="ch-text-white ch-text-xs ch-lg:text-sm ch-font-bold ch-tracking-tight">Cities live</p>
                    <p style={{ color: "rgba(253,186,116,0.5)", fontSize: "10px" }} className="ch-lg:text-xs ch-font-medium">
                      90+ locations
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Left text */}
            <div className="card-left-text gsap-reveal ch-order-3 ch-lg:order-1 ch-flex ch-flex-col ch-justify-center ch-text-center ch-lg:text-left ch-z-20 ch-w-full ch-px-4 ch-lg:px-0">
              <h3 className="ch-text-white ch-text-2xl ch-md:text-3xl ch-lg:text-4xl ch-font-bold ch-mb-0 ch-lg:mb-5 ch-tracking-tight">{cardHeading}</h3>
              <p className="ch-hidden ch-md:block" style={{ color: "rgba(219,234,254,0.7)", fontSize: "0.875rem", lineHeight: 1.625, maxWidth: "24rem", margin: "0 auto" }}>
                {cardDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
