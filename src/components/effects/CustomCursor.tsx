import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const followerRef = useRef<HTMLDivElement>(null);
    const expandedRef = useRef(false);

    useEffect(() => {
        const cursor = cursorRef.current;
        const follower = followerRef.current;
        if (!cursor || !follower) return;

        const onMouseMove = (e: MouseEvent) => {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
                ease: 'power2.out',
            });
            gsap.to(follower, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.3,
                ease: 'power2.out',
            });
        };

        const onMouseEnterLink = () => {
            if (expandedRef.current) return;
            expandedRef.current = true;
            gsap.to(cursor, {
                scale: 0,
                duration: 0.2,
                ease: 'power2.out',
            });
            gsap.to(follower, {
                scale: 2.5,
                backgroundColor: 'rgba(0, 200, 160, 0.1)',
                borderColor: 'rgba(0, 200, 160, 0.6)',
                duration: 0.3,
                ease: 'power2.out',
            });
        };

        const onMouseLeaveLink = () => {
            expandedRef.current = false;
            gsap.to(cursor, {
                scale: 1,
                duration: 0.2,
                ease: 'power2.out',
            });
            gsap.to(follower, {
                scale: 1,
                backgroundColor: 'transparent',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                duration: 0.3,
                ease: 'power2.out',
            });
        };

        const onMouseDown = () => {
            gsap.to(follower, {
                scale: expandedRef.current ? 2 : 0.8,
                duration: 0.15,
                ease: 'power2.out',
            });
        };

        const onMouseUp = () => {
            gsap.to(follower, {
                scale: expandedRef.current ? 2.5 : 1,
                duration: 0.15,
                ease: 'power2.out',
            });
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);

        // Add hover effect to interactive elements
        const interactiveElements = document.querySelectorAll('a, button, [data-cursor-hover]');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', onMouseEnterLink);
            el.addEventListener('mouseleave', onMouseLeaveLink);
        });

        // MutationObserver for dynamically added elements
        const observer = new MutationObserver(() => {
            const newElements = document.querySelectorAll('a, button, [data-cursor-hover]');
            newElements.forEach(el => {
                el.removeEventListener('mouseenter', onMouseEnterLink);
                el.removeEventListener('mouseleave', onMouseLeaveLink);
                el.addEventListener('mouseenter', onMouseEnterLink);
                el.addEventListener('mouseleave', onMouseLeaveLink);
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            observer.disconnect();
        };
    }, []);

    return (
        <>
            {/* Main cursor dot */}
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference hidden md:block"
                style={{ willChange: 'transform' }}
            />
            {/* Follower ring */}
            <div
                ref={followerRef}
                className="fixed top-0 left-0 w-10 h-10 border border-white/30 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 hidden md:block"
                style={{ willChange: 'transform' }}
            />
        </>
    );
}
