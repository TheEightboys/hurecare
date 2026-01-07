import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { AlertCircle, Clock, Shield, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface ComplianceWarningsProps {
    lastAccessed: string | null;
    lastEdited: string | null;
    sourceType: 'AUDIO' | 'TEXT';
    transcriptReviewed: boolean;
}

export function ComplianceWarnings({
    lastAccessed,
    lastEdited,
    sourceType,
    transcriptReviewed
}: ComplianceWarningsProps) {
    const [idleTime, setIdleTime] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const warningRef = useRef<HTMLDivElement>(null);
    const lastActivityRef = useRef(Date.now());

    useEffect(() => {
        const handleActivity = () => {
            lastActivityRef.current = Date.now();
            setIdleTime(0);
            setShowWarning(false);
            setIsLocked(false);
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, handleActivity);
        });

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - lastActivityRef.current) / 1000);
            setIdleTime(elapsed);

            if (elapsed >= 90 && elapsed < 120 && !showWarning) {
                setShowWarning(true);
            }

            if (elapsed >= 120) {
                setIsLocked(true);
            }
        }, 1000);

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleActivity);
            });
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        if (showWarning && warningRef.current) {
            gsap.from(warningRef.current, {
                y: -20,
                opacity: 0,
                duration: 0.3,
                ease: 'power2.out',
            });
        }
    }, [showWarning]);

    const formatDateTime = (dateStr: string | null) => {
        if (!dateStr) return 'N/A';
        return format(new Date(dateStr), 'MMM d, yyyy h:mm a');
    };

    return (
        <>
            {/* Metadata Display */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {lastAccessed && (
                    <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        <span>Last accessed: {formatDateTime(lastAccessed)}</span>
                    </div>
                )}
                {lastEdited && (
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>Last edited: {formatDateTime(lastEdited)}</span>
                    </div>
                )}
            </div>

            {/* Transcript Review Warning */}
            {sourceType === 'AUDIO' && !transcriptReviewed && (
                <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/30 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-warning">Transcript Review Required</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            AI transcription must be reviewed and approved before this note can be signed.
                            This ensures accuracy and compliance with medical documentation standards.
                        </p>
                    </div>
                </div>
            )}

            {/* 90-Second Idle Warning */}
            {showWarning && !isLocked && (
                <div
                    ref={warningRef}
                    className="fixed top-4 right-4 z-50 flex items-start gap-3 p-4 bg-warning text-warning-foreground rounded-lg shadow-xl max-w-sm animate-pulse"
                >
                    <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold">Session Warning</p>
                        <p className="text-sm mt-1">
                            Your session will lock in {120 - idleTime} seconds due to inactivity.
                            Move your mouse or press any key to stay active.
                        </p>
                    </div>
                </div>
            )}

            {/* 2-Minute Lock Screen */}
            {isLocked && (
                <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center p-8 max-w-md">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <Shield className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-2xl font-display font-bold mb-3">Session Locked</h2>
                        <p className="text-muted-foreground mb-6">
                            This screen has been locked due to inactivity to protect patient information.
                            Move your mouse or press any key to continue.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>Locked after 2 minutes of inactivity</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
