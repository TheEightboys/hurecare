import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// ============ SCROLL ANIMATION HOOK ============
export function useScrollAnimation(options: {
    trigger?: string;
    start?: string;
    end?: string;
    scrub?: boolean | number;
} = {}) {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const ctx = gsap.context(() => {
            gsap.from(elementRef.current, {
                scrollTrigger: {
                    trigger: elementRef.current,
                    start: options.start || 'top 85%',
                    end: options.end || 'bottom 15%',
                    toggleActions: 'play none none reverse',
                    scrub: options.scrub,
                },
                opacity: 0,
                y: 60,
                duration: 0.8,
                ease: 'power3.out',
            });
        }, elementRef);

        return () => ctx.revert();
    }, [options.start, options.end, options.scrub]);

    return elementRef;
}

// ============ TEXT REVEAL ANIMATION HOOK ============
export function useTextReveal(options: {
    type?: 'words' | 'chars' | 'lines';
    stagger?: number;
    delay?: number;
} = {}) {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const text = elementRef.current.textContent || '';
        const type = options.type || 'words';

        let items: string[] = [];
        if (type === 'words') {
            items = text.split(' ');
        } else if (type === 'chars') {
            items = text.split('');
        } else {
            items = [text];
        }

        // Create spans for each item
        elementRef.current.innerHTML = items
            .map((item, i) => `<span class="reveal-item" style="display: inline-block; overflow: hidden;"><span class="reveal-inner" style="display: inline-block;">${item}${type === 'words' && i < items.length - 1 ? '&nbsp;' : ''}</span></span>`)
            .join('');

        const innerElements = elementRef.current.querySelectorAll('.reveal-inner');

        const ctx = gsap.context(() => {
            gsap.from(innerElements, {
                scrollTrigger: {
                    trigger: elementRef.current,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse',
                },
                y: '100%',
                opacity: 0,
                duration: 0.8,
                stagger: options.stagger || 0.03,
                delay: options.delay || 0,
                ease: 'power3.out',
            });
        }, elementRef);

        return () => {
            ctx.revert();
            if (elementRef.current) {
                elementRef.current.textContent = text;
            }
        };
    }, [options.type, options.stagger, options.delay]);

    return elementRef;
}

// ============ PARALLAX EFFECT HOOK ============
export function useParallax(speed: number = 0.5) {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const ctx = gsap.context(() => {
            gsap.to(elementRef.current, {
                scrollTrigger: {
                    trigger: elementRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                },
                y: `${speed * 100}px`,
                ease: 'none',
            });
        }, elementRef);

        return () => ctx.revert();
    }, [speed]);

    return elementRef;
}

// ============ STAGGER CHILDREN ANIMATION ============
export function useStaggerChildren(options: {
    stagger?: number;
    delay?: number;
    y?: number;
    x?: number;
} = {}) {
    const containerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const children = containerRef.current.children;

        const ctx = gsap.context(() => {
            gsap.from(children, {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse',
                },
                opacity: 0,
                y: options.y ?? 40,
                x: options.x ?? 0,
                duration: 0.6,
                stagger: options.stagger || 0.1,
                delay: options.delay || 0,
                ease: 'power3.out',
            });
        }, containerRef);

        return () => ctx.revert();
    }, [options.stagger, options.delay, options.y, options.x]);

    return containerRef;
}

// ============ BUTTON ANIMATION HOOK ============
export function useButtonAnimation() {
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!buttonRef.current) return;

        const button = buttonRef.current;

        const handleMouseEnter = () => {
            gsap.to(button, {
                scale: 1.05,
                duration: 0.3,
                ease: 'power2.out',
            });
        };

        const handleMouseLeave = () => {
            gsap.to(button, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out',
            });
        };

        const handleMouseDown = () => {
            gsap.to(button, {
                scale: 0.95,
                duration: 0.1,
                ease: 'power2.out',
            });
        };

        const handleMouseUp = () => {
            gsap.to(button, {
                scale: 1.05,
                duration: 0.1,
                ease: 'power2.out',
            });
        };

        button.addEventListener('mouseenter', handleMouseEnter);
        button.addEventListener('mouseleave', handleMouseLeave);
        button.addEventListener('mousedown', handleMouseDown);
        button.addEventListener('mouseup', handleMouseUp);

        return () => {
            button.removeEventListener('mouseenter', handleMouseEnter);
            button.removeEventListener('mouseleave', handleMouseLeave);
            button.removeEventListener('mousedown', handleMouseDown);
            button.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    return buttonRef;
}

// ============ MAGNETIC BUTTON EFFECT ============
export function useMagneticButton(strength: number = 0.3) {
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!buttonRef.current) return;

        const button = buttonRef.current;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = button.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const deltaX = (e.clientX - centerX) * strength;
            const deltaY = (e.clientY - centerY) * strength;

            gsap.to(button, {
                x: deltaX,
                y: deltaY,
                duration: 0.3,
                ease: 'power2.out',
            });
        };

        const handleMouseLeave = () => {
            gsap.to(button, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)',
            });
        };

        button.addEventListener('mousemove', handleMouseMove);
        button.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            button.removeEventListener('mousemove', handleMouseMove);
            button.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [strength]);

    return buttonRef;
}

// ============ COUNT UP ANIMATION ============
export function useCountUp(
    targetValue: number,
    options: { duration?: number; delay?: number; prefix?: string; suffix?: string } = {}
) {
    const elementRef = useRef<HTMLSpanElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (!elementRef.current || hasAnimated.current) return;

        const element = elementRef.current;
        const prefix = options.prefix || '';
        const suffix = options.suffix || '';

        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: element,
                start: 'top 85%',
                onEnter: () => {
                    if (hasAnimated.current) return;
                    hasAnimated.current = true;

                    gsap.from({ val: 0 }, {
                        val: targetValue,
                        duration: options.duration || 2,
                        delay: options.delay || 0,
                        ease: 'power2.out',
                        onUpdate: function () {
                            const currentVal = Math.round(this.targets()[0].val);
                            element.textContent = `${prefix}${currentVal.toLocaleString()}${suffix}`;
                        },
                    });
                },
            });
        }, element);

        return () => ctx.revert();
    }, [targetValue, options.duration, options.delay, options.prefix, options.suffix]);

    return elementRef;
}

// ============ FADE IN ON SCROLL ============
export function useFadeIn(options: { delay?: number; direction?: 'up' | 'down' | 'left' | 'right' } = {}) {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const { delay = 0, direction = 'up' } = options;

        const transforms: Record<string, { x: number; y: number }> = {
            up: { x: 0, y: 40 },
            down: { x: 0, y: -40 },
            left: { x: 40, y: 0 },
            right: { x: -40, y: 0 },
        };

        const ctx = gsap.context(() => {
            gsap.from(elementRef.current, {
                scrollTrigger: {
                    trigger: elementRef.current,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse',
                },
                opacity: 0,
                ...transforms[direction],
                duration: 0.8,
                delay,
                ease: 'power3.out',
            });
        }, elementRef);

        return () => ctx.revert();
    }, [options.delay, options.direction]);

    return elementRef;
}

// ============ GSAP TIMELINE CREATOR ============
export function useTimeline() {
    const create = useCallback((options?: gsap.TimelineVars) => {
        return gsap.timeline(options);
    }, []);

    return { create };
}

// ============ FLOATING ANIMATION ============
export function useFloating(options: { y?: number; duration?: number } = {}) {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const ctx = gsap.context(() => {
            gsap.to(elementRef.current, {
                y: options.y || 20,
                duration: options.duration || 2,
                ease: 'power1.inOut',
                repeat: -1,
                yoyo: true,
            });
        }, elementRef);

        return () => ctx.revert();
    }, [options.y, options.duration]);

    return elementRef;
}

// ============ PULSE GLOW ANIMATION ============
export function usePulseGlow() {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const ctx = gsap.context(() => {
            gsap.to(elementRef.current, {
                boxShadow: '0 0 30px hsl(173 58% 50% / 0.4)',
                duration: 1.5,
                ease: 'power1.inOut',
                repeat: -1,
                yoyo: true,
            });
        }, elementRef);

        return () => ctx.revert();
    }, []);

    return elementRef;
}

// ============ 3D CARD HOVER EFFECT ============
export function useCard3DHover(options: { intensity?: number; perspective?: number } = {}) {
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!cardRef.current) return;

        const card = cardRef.current;
        const intensity = options.intensity || 15;
        const perspective = options.perspective || 1000;

        card.style.transformStyle = 'preserve-3d';
        card.style.transition = 'transform 0.15s ease-out';

        const handleMouseMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;

            const rotateX = (mouseY / (rect.height / 2)) * -intensity;
            const rotateY = (mouseX / (rect.width / 2)) * intensity;

            gsap.to(card, {
                rotateX,
                rotateY,
                duration: 0.3,
                ease: 'power2.out',
                transformPerspective: perspective,
            });
        };

        const handleMouseLeave = () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)',
            });
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [options.intensity, options.perspective]);

    return cardRef;
}

// ============ CLICK RIPPLE EFFECT ============
export function useClickRipple(color: string = 'rgba(16, 185, 129, 0.4)') {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const element = elementRef.current;
        element.style.position = 'relative';
        element.style.overflow = 'hidden';

        const handleClick = (e: MouseEvent) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                width: 10px;
                height: 10px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                left: ${x}px;
                top: ${y}px;
                transform: translate(-50%, -50%) scale(0);
            `;
            element.appendChild(ripple);

            gsap.to(ripple, {
                scale: 20,
                opacity: 0,
                duration: 0.8,
                ease: 'power2.out',
                onComplete: () => ripple.remove(),
            });
        };

        element.addEventListener('click', handleClick);

        return () => {
            element.removeEventListener('click', handleClick);
        };
    }, [color]);

    return elementRef;
}

// ============ DRAW SVG PATH ANIMATION ============
export function useDrawSVG(options: { duration?: number; delay?: number } = {}) {
    const pathRef = useRef<SVGPathElement>(null);

    useEffect(() => {
        if (!pathRef.current) return;

        const path = pathRef.current;
        const length = path.getTotalLength();

        // Set up initial state
        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = `${length}`;

        const ctx = gsap.context(() => {
            gsap.to(path, {
                scrollTrigger: {
                    trigger: path,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                },
                strokeDashoffset: 0,
                duration: options.duration || 2,
                delay: options.delay || 0,
                ease: 'power2.inOut',
            });
        });

        return () => ctx.revert();
    }, [options.duration, options.delay]);

    return pathRef;
}

// ============ LOADING SKELETON PULSE ============
export function useSkeletonPulse() {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const element = elementRef.current;
        element.style.background = 'linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--muted-foreground) / 0.1) 50%, hsl(var(--muted)) 100%)';
        element.style.backgroundSize = '200% 100%';

        const ctx = gsap.context(() => {
            gsap.to(element, {
                backgroundPosition: '-200% 0',
                duration: 1.5,
                repeat: -1,
                ease: 'power1.inOut',
            });
        }, element);

        return () => ctx.revert();
    }, []);

    return elementRef;
}

// ============ HEALTHCARE HEARTBEAT ANIMATION ============
export function useHeartbeat(bpm: number = 72) {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const interval = 60000 / bpm; // Convert BPM to milliseconds

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ repeat: -1, repeatDelay: interval / 1000 - 0.4 });

            tl.to(elementRef.current, {
                scale: 1.15,
                duration: 0.1,
                ease: 'power2.out',
            })
                .to(elementRef.current, {
                    scale: 1,
                    duration: 0.1,
                    ease: 'power2.in',
                })
                .to(elementRef.current, {
                    scale: 1.1,
                    duration: 0.08,
                    ease: 'power2.out',
                })
                .to(elementRef.current, {
                    scale: 1,
                    duration: 0.15,
                    ease: 'power2.in',
                });
        }, elementRef);

        return () => ctx.revert();
    }, [bpm]);

    return elementRef;
}

// ============ PAGE TRANSITION ANIMATION ============
export function usePageTransition() {
    const containerRef = useRef<HTMLDivElement>(null);

    const animateIn = useCallback(() => {
        if (!containerRef.current) return;

        gsap.fromTo(
            containerRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
        );
    }, []);

    const animateOut = useCallback(() => {
        if (!containerRef.current) return Promise.resolve();

        return new Promise<void>((resolve) => {
            gsap.to(containerRef.current, {
                opacity: 0,
                y: -20,
                duration: 0.3,
                ease: 'power3.in',
                onComplete: resolve,
            });
        });
    }, []);

    useEffect(() => {
        animateIn();
    }, [animateIn]);

    return { ref: containerRef, animateIn, animateOut };
}

// ============ FILL ANIMATION (Progress) ============
export function useFillAnimation(options: { duration?: number; ease?: string } = {}) {
    const elementRef = useRef<HTMLDivElement>(null);

    const fill = useCallback((percent: number) => {
        if (!elementRef.current) return;

        gsap.to(elementRef.current, {
            width: `${percent}%`,
            duration: options.duration || 0.8,
            ease: options.ease || 'power2.out',
        });
    }, [options.duration, options.ease]);

    const fillInstant = useCallback((percent: number) => {
        if (!elementRef.current) return;
        elementRef.current.style.width = `${percent}%`;
    }, []);

    return { ref: elementRef, fill, fillInstant };
}

// ============ HOVER GLOW EFFECT ============
export function useHoverGlow(color: string = 'hsl(173 58% 50%)') {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const element = elementRef.current;

        const handleMouseEnter = () => {
            gsap.to(element, {
                boxShadow: `0 0 25px ${color.replace(')', ' / 0.3)')}`,
                duration: 0.3,
                ease: 'power2.out',
            });
        };

        const handleMouseLeave = () => {
            gsap.to(element, {
                boxShadow: '0 0 0 transparent',
                duration: 0.3,
                ease: 'power2.out',
            });
        };

        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            element.removeEventListener('mouseenter', handleMouseEnter);
            element.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [color]);

    return elementRef;
}

