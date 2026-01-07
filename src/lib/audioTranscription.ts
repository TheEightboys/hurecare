/**
 * Audio Transcription Service for HURE Care
 * 
 * Handles audio recording and real-time transcription using browser's
 * Web Speech API with fallback mechanisms for clinical documentation.
 * 
 * Features:
 * - Real-time speech-to-text transcription
 * - Audio recording for storage
 * - Multi-language support (English default)
 * - Silence detection for automatic stop
 */

import { supabase } from '@/integrations/supabase/client';

// Types
export interface TranscriptionSession {
    id: string;
    isRecording: boolean;
    transcript: string;
    duration: number;
    startTime: Date | null;
    audioBlob: Blob | null;
}

export interface TranscriptionConfig {
    language?: string; // 'en-KE' for Kenya English, 'en-US' default
    continuous?: boolean;
    interimResults?: boolean;
    maxSilenceMs?: number; // Stop after this much silence
}

// Default configuration
const DEFAULT_CONFIG: TranscriptionConfig = {
    language: 'en-US', // Could use 'en-KE' when supported
    continuous: true,
    interimResults: true,
    maxSilenceMs: 5000, // 5 seconds of silence
};

// Check if speech recognition is supported
export function isSpeechRecognitionSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

// Get the SpeechRecognition constructor
function getSpeechRecognition(): SpeechRecognition | null {
    if ('webkitSpeechRecognition' in window) {
        return new (window as any).webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
        return new (window as any).SpeechRecognition();
    }
    return null;
}

/**
 * Create an audio transcription session
 */
export function createTranscriptionSession(): TranscriptionSession {
    return {
        id: crypto.randomUUID(),
        isRecording: false,
        transcript: '',
        duration: 0,
        startTime: null,
        audioBlob: null,
    };
}

/**
 * Audio Transcription Manager
 * Handles both speech recognition and audio recording
 */
export class AudioTranscriptionManager {
    private recognition: SpeechRecognition | null = null;
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private isRecording = false;
    private transcript = '';
    private startTime: Date | null = null;
    private silenceTimer: ReturnType<typeof setTimeout> | null = null;
    private config: TranscriptionConfig;

    // Callbacks
    onTranscript: ((text: string, isFinal: boolean) => void) | null = null;
    onRecordingStateChange: ((isRecording: boolean) => void) | null = null;
    onError: ((error: string) => void) | null = null;
    onSilence: (() => void) | null = null;

    constructor(config: Partial<TranscriptionConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Start recording and transcription
     */
    async start(): Promise<boolean> {
        if (this.isRecording) {
            console.warn('Already recording');
            return false;
        }

        // Check support
        if (!isSpeechRecognitionSupported()) {
            this.onError?.('Speech recognition is not supported in this browser. Please use Chrome.');
            return false;
        }

        try {
            // Request microphone access and set up recording
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.setupMediaRecorder(stream);

            // Set up speech recognition
            this.setupSpeechRecognition();

            // Start both
            this.isRecording = true;
            this.startTime = new Date();
            this.transcript = '';

            this.mediaRecorder?.start(1000); // Capture in 1-second chunks
            this.recognition?.start();

            this.onRecordingStateChange?.(true);
            this.logAction('RECORDING_STARTED');

            return true;
        } catch (error) {
            console.error('Failed to start recording:', error);
            this.onError?.('Failed to access microphone. Please check permissions.');
            return false;
        }
    }

    /**
     * Stop recording and transcription
     */
    async stop(): Promise<{ transcript: string; audioBlob: Blob | null; duration: number }> {
        if (!this.isRecording) {
            return { transcript: this.transcript, audioBlob: null, duration: 0 };
        }

        this.isRecording = false;
        this.clearSilenceTimer();

        // Stop speech recognition
        if (this.recognition) {
            this.recognition.stop();
        }

        // Stop media recorder
        const audioBlob = await this.stopMediaRecorder();

        // Calculate duration
        const duration = this.startTime
            ? Math.floor((new Date().getTime() - this.startTime.getTime()) / 1000)
            : 0;

        this.onRecordingStateChange?.(false);
        this.logAction('RECORDING_STOPPED', { duration, transcriptLength: this.transcript.length });

        return {
            transcript: this.transcript,
            audioBlob,
            duration,
        };
    }

    /**
     * Pause recognition (but continue recording audio)
     */
    pause(): void {
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {
                // Ignore
            }
        }
        this.clearSilenceTimer();
    }

    /**
     * Resume recognition
     */
    resume(): void {
        if (this.isRecording && this.recognition) {
            try {
                this.recognition.start();
            } catch (e) {
                console.warn('Failed to resume recognition:', e);
            }
        }
    }

    /**
     * Get current transcript
     */
    getTranscript(): string {
        return this.transcript;
    }

    /**
     * Set up speech recognition
     */
    private setupSpeechRecognition(): void {
        this.recognition = getSpeechRecognition();
        if (!this.recognition) return;

        this.recognition.continuous = this.config.continuous ?? true;
        this.recognition.interimResults = this.config.interimResults ?? true;
        this.recognition.lang = this.config.language ?? 'en-US';

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript + ' ';
                } else {
                    interimTranscript += result[0].transcript;
                }
            }

            if (finalTranscript) {
                this.transcript += finalTranscript;
                this.onTranscript?.(this.transcript, true);
            } else if (interimTranscript) {
                this.onTranscript?.(this.transcript + interimTranscript, false);
            }

            // Reset silence timer on speech
            this.resetSilenceTimer();
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'no-speech') {
                this.onSilence?.();
            } else if (event.error !== 'aborted') {
                this.onError?.(`Speech recognition error: ${event.error}`);
            }
        };

        this.recognition.onend = () => {
            // Restart if still recording (for continuous mode)
            if (this.isRecording && this.config.continuous) {
                try {
                    this.recognition?.start();
                } catch (e) {
                    console.warn('Failed to restart recognition:', e);
                }
            }
        };
    }

    /**
     * Set up media recorder for audio capture
     */
    private setupMediaRecorder(stream: MediaStream): void {
        this.audioChunks = [];

        const mimeType = MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : 'audio/ogg';

        this.mediaRecorder = new MediaRecorder(stream, { mimeType });

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.audioChunks.push(event.data);
            }
        };
    }

    /**
     * Stop media recorder and return blob
     */
    private async stopMediaRecorder(): Promise<Blob | null> {
        return new Promise((resolve) => {
            if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
                resolve(null);
                return;
            }

            this.mediaRecorder.onstop = () => {
                const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
                const blob = new Blob(this.audioChunks, { type: mimeType });
                resolve(blob);
            };

            this.mediaRecorder.stop();
        });
    }

    /**
     * Reset silence timer
     */
    private resetSilenceTimer(): void {
        this.clearSilenceTimer();
        if (this.config.maxSilenceMs && this.config.maxSilenceMs > 0) {
            this.silenceTimer = setTimeout(() => {
                this.onSilence?.();
            }, this.config.maxSilenceMs);
        }
    }

    /**
     * Clear silence timer
     */
    private clearSilenceTimer(): void {
        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
        }
    }

    /**
     * Log action to audit log
     */
    private async logAction(action: string, details: Record<string, any> = {}): Promise<void> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            await supabase.from('audit_logs').insert({
                user_id: user?.id,
                action: `AUDIO_${action}`,
                entity_type: 'audio_transcription',
                details: {
                    ...details,
                    timestamp: new Date().toISOString(),
                },
            });
        } catch (err) {
            console.error('Failed to log action:', err);
        }
    }

    /**
     * Cleanup resources
     */
    destroy(): void {
        this.stop();
        this.recognition = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.clearSilenceTimer();
    }
}

/**
 * Create a simple hook-style transcription manager
 */
export function createAudioTranscriptionManager(
    config?: Partial<TranscriptionConfig>
): AudioTranscriptionManager {
    return new AudioTranscriptionManager(config);
}

/**
 * Get browser speech recognition capability info
 */
export function getSpeechRecognitionInfo(): {
    supported: boolean;
    browser: string;
    recommendedBrowser: string | null;
} {
    const supported = isSpeechRecognitionSupported();
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';

    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        browser = 'Chrome';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browser = 'Safari';
    } else if (userAgent.includes('Firefox')) {
        browser = 'Firefox';
    } else if (userAgent.includes('Edg')) {
        browser = 'Edge';
    }

    let recommendedBrowser: string | null = null;
    if (!supported) {
        recommendedBrowser = 'Chrome';
    }

    return { supported, browser, recommendedBrowser };
}
