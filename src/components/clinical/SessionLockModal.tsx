import { useState, useEffect, useCallback } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, ShieldAlert, Timer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SessionLockModalProps {
    idleTimeout?: number; // in seconds
    warningTime?: number; // seconds before lock to show warning
    onLock?: () => void;
    onUnlock?: () => void;
}

export function SessionLockModal({
    idleTimeout = 120, // 2 minutes
    warningTime = 90,  // 90 seconds warning
    onLock,
    onUnlock,
}: SessionLockModalProps) {
    const [isLocked, setIsLocked] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [lastActivity, setLastActivity] = useState(Date.now());

    // Reset activity timer
    const resetActivity = useCallback(() => {
        setLastActivity(Date.now());
        setShowWarning(false);
        setCountdown(0);
    }, []);

    // Check for inactivity
    useEffect(() => {
        const checkInactivity = () => {
            const now = Date.now();
            const elapsed = Math.floor((now - lastActivity) / 1000);
            const remainingToLock = idleTimeout - elapsed;
            const remainingToWarning = warningTime - elapsed;

            if (elapsed >= idleTimeout && !isLocked) {
                setIsLocked(true);
                setShowWarning(false);
                onLock?.();
            } else if (remainingToWarning <= 0 && remainingToLock > 0 && !isLocked) {
                setShowWarning(true);
                setCountdown(remainingToLock);
            }
        };

        const interval: NodeJS.Timeout = setInterval(checkInactivity, 1000);

        return () => clearInterval(interval);
    }, [lastActivity, idleTimeout, warningTime, isLocked, onLock]);

    // Track user activity
    useEffect(() => {
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

        const handleActivity = () => {
            if (!isLocked) {
                resetActivity();
            }
        };

        events.forEach(event => {
            document.addEventListener(event, handleActivity, { passive: true });
        });

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleActivity);
            });
        };
    }, [isLocked, resetActivity]);

    const handleUnlock = async () => {
        if (!password) {
            setError('Please enter your password');
            return;
        }

        try {
            // Re-authenticate with password
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.email) {
                setError('Session expired. Please log in again.');
                return;
            }

            const { error: authError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: password,
            });

            if (authError) {
                setError('Incorrect password');
                return;
            }

            setIsLocked(false);
            setPassword('');
            setError('');
            resetActivity();
            onUnlock?.();
        } catch (err) {
            setError('Authentication failed');
        }
    };

    // Warning toast
    if (showWarning && !isLocked) {
        return (
            <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
                <div className="bg-warning/10 border border-warning/30 text-warning rounded-lg p-4 shadow-xl flex items-center gap-3 max-w-sm">
                    <Timer className="w-5 h-5 flex-shrink-0 animate-pulse" />
                    <div>
                        <p className="font-medium text-sm">Session timeout warning</p>
                        <p className="text-xs opacity-80">
                            Screen will lock in {countdown} seconds due to inactivity
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AlertDialog open={isLocked} onOpenChange={() => { }}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <AlertDialogTitle className="text-xl">Session Locked</AlertDialogTitle>
                    <AlertDialogDescription className="text-center">
                        Your session has been locked due to inactivity. Please enter your password to unlock.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="unlock-password">Password</Label>
                        <Input
                            id="unlock-password"
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                            placeholder="Enter your password"
                            autoFocus
                        />
                        {error && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                                <ShieldAlert className="w-4 h-4" />
                                {error}
                            </p>
                        )}
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogAction onClick={handleUnlock} className="w-full">
                        Unlock Session
                    </AlertDialogAction>
                </AlertDialogFooter>

                <p className="text-xs text-center text-muted-foreground mt-2">
                    For patient safety, clinical sessions lock after 2 minutes of inactivity.
                </p>
            </AlertDialogContent>
        </AlertDialog>
    );
}
