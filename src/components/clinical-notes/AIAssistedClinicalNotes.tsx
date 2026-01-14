/**
 * AI-Assisted Clinical Notes Component
 * 
 * This component provides a comprehensive AI-assisted clinical documentation experience.
 * Features:
 * - Audio recording with real-time transcription
 * - Text-only mode
 * - Transcript review requirement for audio notes
 * - AI-powered SOAP generation
 * - Single note parsing to SOAP
 * - ICD-10 code suggestions (manual selection required)
 * - Rewrite for clarity assistance
 * - Session timeout/lock for HIPAA compliance
 * - Legal acknowledgement on first sign
 * - Full audit logging
 * 
 * AI is ALWAYS assistive - clinician reviews and approves all AI outputs.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AudioRecorder } from '@/components/clinical/AudioRecorder';
import { ICD10Selector } from '@/components/clinical/ICD10Selector';
import { ComplianceWarnings } from '@/components/clinical/ComplianceWarnings';
import { LegalSafeModal } from '@/components/clinical/LegalSafeModal';
import { SessionLockModal } from '@/components/clinical/SessionLockModal';
import { useClinicalNotes, usePatients, useAISuggestionsLog, useAudioRecordings } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import {
    generateSOAPFromText,
    parseSingleNoteToSOAP,
    rewriteForClarity,
    suggestICD10Codes,
} from '@/lib/aiService';
import {
    Mic,
    Edit3,
    Sparkles,
    FileText,
    Save,
    CheckCircle2,
    AlertCircle,
    Clock,
    Wand2,
    ListTree,
    AlertTriangle,
    Shield,
    Info,
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

// Audit logging for clinical note actions
async function logNoteAction(action: string, noteId: string | undefined, details: Record<string, any> = {}) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('audit_logs').insert({
            user_id: user?.id,
            action,
            entity_type: 'clinical_notes',
            entity_id: noteId,
            details: {
                ...details,
                timestamp: new Date().toISOString(),
            },
        });
    } catch (err) {
        console.error('Failed to log note action:', err);
    }
}

interface AIAssistedClinicalNotesProps {
    noteId?: string;
    patientId?: string;
    appointmentId?: string;
    onSaveComplete?: (noteId: string, status: 'DRAFT' | 'SIGNED') => void;
}

interface ICD10Code {
    code: string;
    description: string;
    confidence?: number;
    [key: string]: string | number | undefined; // For JSON compatibility
}

const AIAssistedClinicalNotes: React.FC<AIAssistedClinicalNotesProps> = ({
    noteId,
    patientId: initialPatientId,
    appointmentId,
    onSaveComplete,
}) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { getNote, createNote, updateNote, markTranscriptReviewed, signNote } = useClinicalNotes();
    const { getPatients } = usePatients();
    const { logAISuggestion, markSuggestionAccepted } = useAISuggestionsLog();
    const { deleteAudioAfterSave } = useAudioRecordings();

    // State
    const [isNewNote, setIsNewNote] = useState(!noteId || noteId === 'new');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId || '');
    const [sourceType, setSourceType] = useState<'AUDIO' | 'TEXT'>('TEXT');
    const [noteMode, setNoteMode] = useState<'soap' | 'single'>('soap');

    // SOAP fields
    const [transcript, setTranscript] = useState('');
    const [transcriptReviewed, setTranscriptReviewed] = useState(false);
    const [transcriptReviewedAt, setTranscriptReviewedAt] = useState<string | null>(null);
    const [subjective, setSubjective] = useState('');
    const [objective, setObjective] = useState('');
    const [assessment, setAssessment] = useState('');
    const [plan, setPlan] = useState('');
    const [singleNote, setSingleNote] = useState('');

    // ICD-10
    const [icd10Codes, setIcd10Codes] = useState<ICD10Code[]>([]);
    const [icd10Suggestions, setIcd10Suggestions] = useState<Array<{ code: string; description: string; confidence: number }>>([]);
    const [lastIcd10SuggestionId, setLastIcd10SuggestionId] = useState<string | null>(null);

    // Status
    const [noteStatus, setNoteStatus] = useState<'DRAFT' | 'SIGNED'>('DRAFT');
    const [lastAccessed, setLastAccessed] = useState<string | null>(null);
    const [lastEdited, setLastEdited] = useState<string | null>(null);

    // AI state
    const [generatingSOAP, setGeneratingSOAP] = useState(false);
    const [generatingICD10, setGeneratingICD10] = useState(false);
    const [rewritingContent, setRewritingContent] = useState(false);

    // Modals
    const [showLegalModal, setShowLegalModal] = useState(false);
    const [legalAcknowledged, setLegalAcknowledged] = useState(false);
    const [showSignConfirm, setShowSignConfirm] = useState(false);
    const [showBlockedModal, setShowBlockedModal] = useState(false);
    const [blockReason, setBlockReason] = useState('');

    // Audio blob for cleanup
    const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);

    useEffect(() => {
        loadPatients();
        if (noteId && noteId !== 'new') {
            loadNote(noteId);
        }

        // Check if legal acknowledgement was given before
        const acknowledged = localStorage.getItem('hurecare_legal_acknowledged');
        if (acknowledged) {
            setLegalAcknowledged(true);
        }
    }, [noteId]);

    // Cleanup audio blob on unmount
    useEffect(() => {
        return () => {
            if (audioBlobUrl) {
                URL.revokeObjectURL(audioBlobUrl);
            }
        };
    }, [audioBlobUrl]);

    const loadPatients = async () => {
        const data = await getPatients();
        setPatients(data);
    };

    const loadNote = async (id: string) => {
        setLoading(true);
        try {
            const note = await getNote(id);
            if (note) {
                setIsNewNote(false);
                setSelectedPatientId(note.patient_id);
                setSourceType(note.source_type || 'TEXT');
                setTranscript(note.transcript || '');
                setTranscriptReviewed(note.transcript_reviewed || false);
                setTranscriptReviewedAt(note.transcript_reviewed_at);
                setSubjective(note.subjective || '');
                setObjective(note.objective || '');
                setAssessment(note.assessment || '');
                setPlan(note.plan || '');
                setSingleNote(note.single_note || '');
                setIcd10Codes((note.icd10_codes as unknown as ICD10Code[]) || []);
                setNoteStatus(note.status || 'DRAFT');
                setLastAccessed(note.last_accessed_at);
                setLastEdited(note.updated_at);

                if (note.single_note && !note.subjective) {
                    setNoteMode('single');
                }
            }
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Error loading note',
                description: 'Could not load the clinical note.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTranscriptionComplete = (text: string, blobUrl?: string) => {
        setTranscript(text);
        setSourceType('AUDIO');
        setTranscriptReviewed(false); // Reset review status for new transcription
        if (blobUrl) {
            setAudioBlobUrl(blobUrl);
        }

        logNoteAction('TRANSCRIPT_RECEIVED', noteId, { transcriptLength: text.length });
    };

    const handleTranscriptEdit = (newText: string) => {
        const oldText = transcript;
        setTranscript(newText);

        // Log the edit for audit purposes
        if (newText !== oldText) {
            logNoteAction('TRANSCRIPT_EDITED', noteId, {
                wasReviewed: transcriptReviewed,
                lengthChange: newText.length - oldText.length
            });
        }
    };

    const handleMarkTranscriptReviewed = async () => {
        if (!transcript.trim()) {
            toast({
                variant: 'destructive',
                title: 'No transcript',
                description: 'Please record or enter a transcript first.',
            });
            return;
        }

        if (!noteId || isNewNote) {
            setTranscriptReviewed(true);
            setTranscriptReviewedAt(new Date().toISOString());
            logNoteAction('TRANSCRIPT_MARKED_REVIEWED', undefined, { isNewNote: true });
            toast({
                title: 'Transcript marked as reviewed',
                description: 'You can now generate SOAP and sign this note.',
            });
            return;
        }

        try {
            await markTranscriptReviewed(noteId);
            setTranscriptReviewed(true);
            setTranscriptReviewedAt(new Date().toISOString());
            toast({
                title: 'Transcript marked as reviewed',
                description: 'You can now sign and save this note.',
            });
        } catch (err) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not mark transcript as reviewed.' });
        }
    };

    const handleGenerateSOAP = async () => {
        const textToAnalyze = sourceType === 'AUDIO' ? transcript : (noteMode === 'single' ? singleNote : subjective);
        if (!textToAnalyze?.trim()) {
            toast({ variant: 'destructive', title: 'No content', description: 'Please add content to generate SOAP.' });
            return;
        }

        setGeneratingSOAP(true);
        try {
            const result = await generateSOAPFromText(textToAnalyze, { sourceType });
            
            // Log AI suggestion
            const suggestionLog = await logAISuggestion(noteId || null, 'SOAP', textToAnalyze, result);
            
            setSubjective(result.subjective);
            setObjective(result.objective);
            setAssessment(result.assessment);
            setPlan(result.plan);
            setNoteMode('soap');

            // Mark suggestion as accepted since user will review
            if (suggestionLog?.id) {
                await markSuggestionAccepted(suggestionLog.id);
            }

            toast({
                title: 'SOAP generated',
                description: 'AI has populated the SOAP fields. Please review and edit as needed.'
            });

            logNoteAction('SOAP_GENERATED', noteId, { sourceType, inputLength: textToAnalyze.length });

            // Auto-suggest ICD-10 codes after SOAP generation
            const soapText = `${result.subjective} ${result.objective} ${result.assessment} ${result.plan}`;
            await handleGenerateICD10FromText(soapText);
        } catch (err) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not generate SOAP.' });
        } finally {
            setGeneratingSOAP(false);
        }
    };

    const handleGenerateICD10FromText = async (text?: string) => {
        const textToAnalyze = text || `${subjective} ${objective} ${assessment} ${plan}`;
        if (!textToAnalyze.trim()) {
            toast({ variant: 'destructive', title: 'No content', description: 'Please add SOAP content first.' });
            return;
        }

        setGeneratingICD10(true);
        try {
            const suggestions = await suggestICD10Codes(textToAnalyze);
            
            // Log AI suggestion
            const suggestionLog = await logAISuggestion(noteId || null, 'ICD10', textToAnalyze, { suggestions });
            if (suggestionLog?.id) {
                setLastIcd10SuggestionId(suggestionLog.id);
            }

            setIcd10Suggestions(suggestions);
            
            logNoteAction('ICD10_SUGGESTED', noteId, { suggestionsCount: suggestions.length });

            toast({
                title: 'ICD-10 suggestions ready',
                description: 'Select the appropriate codes below. AI never auto-assigns diagnoses.'
            });
        } catch (err) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not generate ICD-10 suggestions.' });
        } finally {
            setGeneratingICD10(false);
        }
    };

    const handleICD10SelectionChange = async (newCodes: ICD10Code[]) => {
        setIcd10Codes(newCodes);
        
        // Log code selection
        logNoteAction('ICD10_SELECTED', noteId, { 
            codesSelected: newCodes.map(c => c.code),
            count: newCodes.length,
        });

        // Mark suggestion as accepted if there are codes selected
        if (lastIcd10SuggestionId && newCodes.length > 0) {
            await markSuggestionAccepted(lastIcd10SuggestionId);
        }
    };

    const handleParseSingleToSOAP = async () => {
        if (!singleNote?.trim()) {
            toast({ variant: 'destructive', title: 'No content', description: 'Please enter a single note first.' });
            return;
        }

        setGeneratingSOAP(true);
        try {
            const result = await parseSingleNoteToSOAP(singleNote);
            
            // Log AI suggestion
            await logAISuggestion(noteId || null, 'PARSE', singleNote, result);

            setSubjective(result.subjective);
            setObjective(result.objective);
            setAssessment(result.assessment);
            setPlan(result.plan);
            setNoteMode('soap');

            logNoteAction('SINGLE_NOTE_PARSED', noteId, { inputLength: singleNote.length });

            toast({ title: 'Parsed to SOAP', description: 'Your single note has been parsed into SOAP format. Please review.' });
        } catch (err) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not parse note.' });
        } finally {
            setGeneratingSOAP(false);
        }
    };

    const handleRewriteForClarity = async () => {
        const textToRewrite = noteMode === 'single' ? singleNote : subjective;
        if (!textToRewrite?.trim()) {
            toast({ variant: 'destructive', title: 'No content', description: 'Please enter content to rewrite.' });
            return;
        }

        setRewritingContent(true);
        try {
            const rewritten = await rewriteForClarity(textToRewrite);
            
            // Log AI suggestion
            await logAISuggestion(noteId || null, 'CLARITY', textToRewrite, { rewritten });

            if (noteMode === 'single') {
                setSingleNote(rewritten);
            } else {
                setSubjective(rewritten);
            }

            logNoteAction('CLARITY_REWRITE', noteId, { 
                inputLength: textToRewrite.length,
                outputLength: rewritten.length,
            });

            toast({
                title: 'Content improved',
                description: 'AI has improved clarity without changing meaning. Please review the changes.'
            });
        } catch (err) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not rewrite content.' });
        } finally {
            setRewritingContent(false);
        }
    };

    // Validate before saving (returns true if valid, false if blocked)
    const validateForSave = (forSign: boolean): { valid: boolean; reason?: string } => {
        if (!selectedPatientId) {
            return { valid: false, reason: 'Please select a patient.' };
        }

        // For audio-based notes, transcript must be reviewed before signing
        if (forSign && sourceType === 'AUDIO' && !transcriptReviewed) {
            return {
                valid: false,
                reason: 'AI transcription must be reviewed before signing. Click "Mark Reviewed" after verifying the transcript.'
            };
        }

        // Ensure some content exists
        const hasSOAPContent = subjective?.trim() || objective?.trim() || assessment?.trim() || plan?.trim();
        const hasSingleContent = singleNote?.trim();

        if (!hasSOAPContent && !hasSingleContent && !transcript?.trim()) {
            return { valid: false, reason: 'Please enter clinical content before saving.' };
        }

        // For signing, require at least assessment or plan
        if (forSign && !hasSOAPContent && !hasSingleContent) {
            return {
                valid: false,
                reason: 'Please complete the clinical note with assessment and plan before signing.'
            };
        }

        return { valid: true };
    };

    const handleSave = async (andSign = false) => {
        const validation = validateForSave(andSign);

        if (!validation.valid) {
            if (andSign) {
                setBlockReason(validation.reason || 'Cannot sign note.');
                setShowBlockedModal(true);
            } else {
                toast({ variant: 'destructive', title: 'Validation Error', description: validation.reason });
            }
            return;
        }

        if (andSign && !legalAcknowledged) {
            setShowLegalModal(true);
            return;
        }

        if (andSign) {
            setShowSignConfirm(true);
            return;
        }

        await performSave(false);
    };

    const performSave = async (sign: boolean) => {
        setSaving(true);
        try {
            const noteData = {
                patient_id: selectedPatientId,
                appointment_id: appointmentId,
                source_type: sourceType,
                transcript,
                transcript_reviewed: transcriptReviewed,
                subjective,
                objective,
                assessment,
                plan,
                single_note: singleNote,
                icd10_codes: icd10Codes as unknown as Record<string, unknown>[],
            };

            let savedNoteId = noteId;

            if (isNewNote) {
                const created = await createNote(noteData as any);
                savedNoteId = created.id;

                if (sign) {
                    await signNote(created.id);
                    await logNoteAction('NOTE_SIGNED', created.id, { isFirstSign: true });
                } else {
                    await logNoteAction('NOTE_SAVED_DRAFT', created.id, {});
                }

                // Cleanup audio after successful save
                if (audioBlobUrl) {
                    URL.revokeObjectURL(audioBlobUrl);
                    setAudioBlobUrl(null);
                    await deleteAudioAfterSave(created.id, sign ? 'note_signed' : 'note_saved');
                }

                toast({ title: sign ? 'Note signed' : 'Note saved', description: 'Clinical note has been saved.' });
                onSaveComplete?.(created.id, sign ? 'SIGNED' : 'DRAFT');
            } else if (noteId) {
                const wasAlreadySigned = noteStatus === 'SIGNED';

                await updateNote(noteId, noteData as any);

                if (sign) {
                    await signNote(noteId);
                    setNoteStatus('SIGNED');
                    await logNoteAction('NOTE_SIGNED', noteId, { wasAlreadySigned });
                } else if (wasAlreadySigned) {
                    // Log edit after signing for audit
                    await logNoteAction('EDITED_AFTER_SIGN', noteId, {
                        fieldsModified: Object.keys(noteData).filter(k => noteData[k as keyof typeof noteData])
                    });
                } else {
                    await logNoteAction('NOTE_SAVED_DRAFT', noteId, {});
                }

                // Cleanup audio after successful save
                if (audioBlobUrl) {
                    URL.revokeObjectURL(audioBlobUrl);
                    setAudioBlobUrl(null);
                    await deleteAudioAfterSave(noteId, sign ? 'note_signed' : 'note_saved');
                }

                toast({ title: sign ? 'Note signed' : 'Note saved', description: 'Clinical note has been updated.' });
                onSaveComplete?.(noteId, sign ? 'SIGNED' : 'DRAFT');
            }
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setSaving(false);
            setShowSignConfirm(false);
        }
    };

    const handleLegalAcknowledge = () => {
        localStorage.setItem('hurecare_legal_acknowledged', 'true');
        setLegalAcknowledged(true);
        setShowLegalModal(false);
        setShowSignConfirm(true);
    };

    const selectedPatient = patients.find(p => p.id === selectedPatientId);
    const canSign = sourceType === 'TEXT' || transcriptReviewed;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[40vh]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with badges */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-xl font-display font-bold">
                        {isNewNote ? 'New Clinical Note' : 'Edit Clinical Note'}
                    </h2>
                    {selectedPatient && (
                        <p className="text-muted-foreground">
                            {selectedPatient.first_name} {selectedPatient.last_name}
                        </p>
                    )}
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2">
                    {/* Source Type Badge */}
                    <Badge
                        variant="outline"
                        className={sourceType === 'AUDIO' ? 'border-purple-500 text-purple-600 bg-purple-50' : 'border-blue-500 text-blue-600 bg-blue-50'}
                    >
                        {sourceType === 'AUDIO' ? (
                            <><Mic className="w-3 h-3 mr-1" />Created via Audio</>
                        ) : (
                            <><Edit3 className="w-3 h-3 mr-1" />Text-only</>
                        )}
                    </Badge>

                    {/* Status Badge */}
                    <Badge className={noteStatus === 'SIGNED' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-amber-100 text-amber-700 border-amber-300'}>
                        {noteStatus === 'SIGNED' ? (
                            <><CheckCircle2 className="w-3 h-3 mr-1" />Signed</>
                        ) : (
                            <><Edit3 className="w-3 h-3 mr-1" />Draft</>
                        )}
                    </Badge>
                </div>
            </div>

            {/* Compliance Warnings */}
            <ComplianceWarnings
                lastAccessed={lastAccessed}
                lastEdited={lastEdited}
                sourceType={sourceType}
                transcriptReviewed={transcriptReviewed}
            />

            {/* AI Disclaimer Banner */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                    <span className="font-semibold">AI is assistive only.</span> All AI-generated content must be reviewed and approved by the clinician before saving.
                </p>
            </div>

            {/* Patient Selection */}
            {isNewNote && (
                <div className="glass-card rounded-xl p-6">
                    <Label className="text-base font-semibold mb-3 block">Select Patient</Label>
                    <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                        <SelectTrigger className="w-full max-w-md">
                            <SelectValue placeholder="Choose a patient..." />
                        </SelectTrigger>
                        <SelectContent>
                            {patients.map((patient) => (
                                <SelectItem key={patient.id} value={patient.id}>
                                    {patient.first_name} {patient.last_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Source Type Toggle */}
            <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <Label className="text-base font-semibold">Input Method</Label>
                    <div className="flex items-center gap-3">
                        <span className={`text-sm ${sourceType === 'TEXT' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                            <Edit3 className="w-4 h-4 inline mr-1" />
                            Text
                        </span>
                        <Switch
                            checked={sourceType === 'AUDIO'}
                            onCheckedChange={(checked) => setSourceType(checked ? 'AUDIO' : 'TEXT')}
                        />
                        <span className={`text-sm ${sourceType === 'AUDIO' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                            <Mic className="w-4 h-4 inline mr-1" />
                            Record
                        </span>
                    </div>
                </div>

                {/* Audio Recording */}
                {sourceType === 'AUDIO' && (
                    <div className="space-y-4">
                        <AudioRecorder onTranscriptionComplete={handleTranscriptionComplete} />

                        {transcript && (
                            <div className="space-y-3">
                                <Label>Transcript</Label>
                                <Textarea
                                    value={transcript}
                                    onChange={(e) => handleTranscriptEdit(e.target.value)}
                                    rows={6}
                                    placeholder="Transcript will appear here..."
                                    className="resize-none"
                                />

                                {!transcriptReviewed ? (
                                    <div className="flex items-center gap-3 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                                        <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                                        <p className="text-sm text-warning flex-1">
                                            <strong>Required:</strong> AI transcription must be reviewed before signing. Verify accuracy and make corrections.
                                        </p>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleMarkTranscriptReviewed}
                                            className="border-warning text-warning hover:bg-warning/10"
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-1" />
                                            Mark Reviewed
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-green-100 text-green-700 border-green-300">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Transcript Reviewed
                                        </Badge>
                                        {transcriptReviewedAt && (
                                            <span className="text-xs text-muted-foreground">
                                                at {format(new Date(transcriptReviewedAt), 'h:mm a')}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* SOAP / Single Note Toggle */}
            <div className="glass-card rounded-xl p-6">
                <Tabs value={noteMode} onValueChange={(v) => setNoteMode(v as 'soap' | 'single')}>
                    <div className="flex items-center justify-between mb-4">
                        <TabsList>
                            <TabsTrigger value="soap" className="gap-2">
                                <ListTree className="w-4 h-4" />
                                SOAP Format
                            </TabsTrigger>
                            <TabsTrigger value="single" className="gap-2">
                                <FileText className="w-4 h-4" />
                                Single Note
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex gap-2">
                            {(sourceType === 'AUDIO' && transcript) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGenerateSOAP}
                                    disabled={generatingSOAP}
                                    className="gap-2"
                                >
                                    {generatingSOAP ? (
                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Sparkles className="w-4 h-4" />
                                    )}
                                    Generate SOAP
                                </Button>
                            )}
                            {noteMode === 'single' && singleNote && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleParseSingleToSOAP}
                                    disabled={generatingSOAP}
                                    className="gap-2"
                                >
                                    {generatingSOAP ? (
                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Wand2 className="w-4 h-4" />
                                    )}
                                    Parse → SOAP
                                </Button>
                            )}
                            {(subjective || singleNote) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRewriteForClarity}
                                    disabled={rewritingContent}
                                    className="gap-2"
                                >
                                    {rewritingContent ? (
                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Wand2 className="w-4 h-4" />
                                    )}
                                    Rewrite for Clarity
                                </Button>
                            )}
                        </div>
                    </div>

                    <TabsContent value="soap" className="space-y-4 mt-4">
                        <div>
                            <Label>Subjective</Label>
                            <Textarea
                                value={subjective}
                                onChange={(e) => setSubjective(e.target.value)}
                                rows={4}
                                placeholder="Patient's chief complaint, history of present illness, symptoms..."
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label>Objective</Label>
                            <Textarea
                                value={objective}
                                onChange={(e) => setObjective(e.target.value)}
                                rows={4}
                                placeholder="Physical examination findings, vital signs, lab results..."
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label>Assessment</Label>
                            <Textarea
                                value={assessment}
                                onChange={(e) => setAssessment(e.target.value)}
                                rows={3}
                                placeholder="Diagnosis, clinical impressions..."
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label>Plan</Label>
                            <Textarea
                                value={plan}
                                onChange={(e) => setPlan(e.target.value)}
                                rows={4}
                                placeholder="Treatment plan, medications, follow-up..."
                                className="mt-2"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="single" className="mt-4">
                        <div>
                            <Label>Clinical Note</Label>
                            <Textarea
                                value={singleNote}
                                onChange={(e) => setSingleNote(e.target.value)}
                                rows={12}
                                placeholder="Enter your clinical note here. You can parse this into SOAP format later..."
                                className="mt-2"
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* ICD-10 Codes */}
            <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <Label className="text-base font-semibold">ICD-10 Codes</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                            AI suggestions require manual selection - clinician must verify
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateICD10FromText()}
                        disabled={generatingICD10}
                        className="gap-2"
                    >
                        {generatingICD10 ? (
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Sparkles className="w-4 h-4" />
                        )}
                        Suggest ICD-10
                    </Button>
                </div>

                <ICD10Selector
                    suggestions={icd10Suggestions}
                    selectedCodes={icd10Codes}
                    onSelectionChange={handleICD10SelectionChange}
                />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pb-8">
                <Button
                    variant="outline"
                    onClick={() => handleSave(false)}
                    disabled={saving || noteStatus === 'SIGNED'}
                >
                    {saving ? (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Draft
                </Button>
                <Button
                    onClick={() => handleSave(true)}
                    disabled={saving || noteStatus === 'SIGNED' || !canSign}
                    title={!canSign ? 'Review transcript before signing' : undefined}
                >
                    {saving ? (
                        <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Save & Sign
                </Button>
            </div>

            {/* Legal Safe Modal */}
            <LegalSafeModal
                open={showLegalModal}
                onOpenChange={setShowLegalModal}
                onAcknowledge={handleLegalAcknowledge}
            />

            {/* Sign Confirmation Dialog */}
            <AlertDialog open={showSignConfirm} onOpenChange={setShowSignConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Sign Clinical Note</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to sign this clinical note? Once signed, edits will be tracked and require additional review.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => performSave(true)}>
                            Sign Note
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Blocked Action Modal */}
            <AlertDialog open={showBlockedModal} onOpenChange={setShowBlockedModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-warning">
                            <AlertTriangle className="w-5 h-5" />
                            Cannot Sign Note
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {blockReason}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setShowBlockedModal(false)}>
                            Understood
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Session Lock Modal (HIPAA Compliance) */}
            <SessionLockModal
                idleTimeout={120}
                warningTime={90}
            />
        </div>
    );
};

export default AIAssistedClinicalNotes;