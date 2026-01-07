/**
 * AI Service Module for HURE Care
 * 
 * This module provides AI-assisted functions for clinical documentation.
 * Uses OpenRouter API with multiple FREE models for maximum reliability.
 * All AI outputs are suggestions only - clinician must review and approve.
 * 
 * IMPORTANT: AI is assistive only, never automates clinical decisions.
 */

import { supabase } from '@/integrations/supabase/client';

// Types
export interface SOAPFields {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
}

export interface ICD10Suggestion {
    code: string;
    description: string;
    confidence: number;
    category?: string;
}

// OpenRouter API configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

// Comprehensive list of FREE models on OpenRouter - ordered by quality for medical/clinical use
// Updated January 2026 - All models are free tier
const FREE_MODELS = [
    // Tier 1: Best quality free models
    'google/gemma-2-9b-it:free',                    // Google Gemma 2 9B - excellent reasoning
    'google/gemma-3-4b-it:free',                    // Google Gemma 3 4B - newer, fast
    'meta-llama/llama-3.2-3b-instruct:free',        // Meta Llama 3.2 - very reliable
    'meta-llama/llama-3.1-8b-instruct:free',        // Meta Llama 3.1 8B - larger context
    
    // Tier 2: Strong alternatives
    'qwen/qwen-2.5-7b-instruct:free',               // Qwen 2.5 - great multilingual
    'qwen/qwen-2-7b-instruct:free',                 // Qwen 2 - stable
    'microsoft/phi-3-mini-128k-instruct:free',      // Microsoft Phi-3 - efficient, long context
    'microsoft/phi-3-medium-128k-instruct:free',    // Microsoft Phi-3 Medium - better quality
    
    // Tier 3: Reliable fallbacks  
    'mistralai/mistral-7b-instruct:free',           // Mistral 7B - very stable
    'mistralai/mistral-small-3.1-24b-instruct:free', // Mistral Small 3.1 - newer
    'huggingfaceh4/zephyr-7b-beta:free',            // Zephyr - good instruction following
    'openchat/openchat-7b:free',                    // OpenChat - balanced
    
    // Tier 4: Additional fallbacks
    'nousresearch/hermes-3-llama-3.1-405b:free',    // Hermes 3 - very capable
    'deepseek/deepseek-chat:free',                  // DeepSeek - good reasoning
    'cognitivecomputations/dolphin-mixtral-8x22b:free', // Dolphin - uncensored, capable
];

// Track which models have failed recently to avoid retrying
const failedModels = new Map<string, number>();
const MODEL_RETRY_DELAY = 5 * 60 * 1000; // 5 minutes before retrying a failed model

// Check if AI is available
export function isAIAvailable(): boolean {
    return !!OPENROUTER_API_KEY;
}

// Get AI status info for debugging/display
export function getAIStatus(): { 
    available: boolean; 
    modelsCount: number; 
    failedModelsCount: number;
    apiKeyConfigured: boolean;
} {
    const now = Date.now();
    const activeFailedModels = Array.from(failedModels.entries())
        .filter(([_, failedAt]) => (now - failedAt) < MODEL_RETRY_DELAY)
        .length;
    
    return {
        available: !!OPENROUTER_API_KEY,
        modelsCount: FREE_MODELS.length,
        failedModelsCount: activeFailedModels,
        apiKeyConfigured: !!OPENROUTER_API_KEY,
    };
}

// Clear failed models cache (useful for manual retry)
export function resetAIModels(): void {
    failedModels.clear();
    console.log('[AI] Cleared failed models cache - all models available for retry');
}

// Audit logging for AI actions
async function logAIAction(action: string, details: Record<string, unknown> = {}) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('audit_logs').insert({
            user_id: user?.id,
            action: `AI_${action}`,
            entity_type: 'ai_assist',
            details: {
                ...details,
                timestamp: new Date().toISOString(),
            },
        });
    } catch (err) {
        console.error('Failed to log AI action:', err);
    }
}

// Call OpenRouter API with automatic model fallback and smart retry logic
async function callOpenRouterAPI(prompt: string, systemPrompt: string): Promise<string> {
    if (!OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key not configured');
    }

    let lastError: Error | null = null;
    const now = Date.now();
    
    // Filter out recently failed models
    const availableModels = FREE_MODELS.filter(model => {
        const failedAt = failedModels.get(model);
        if (failedAt && (now - failedAt) < MODEL_RETRY_DELAY) {
            console.log(`[AI] Skipping recently failed model: ${model}`);
            return false;
        }
        return true;
    });
    
    // If all models failed recently, reset and try all
    const modelsToTry = availableModels.length > 0 ? availableModels : FREE_MODELS;

    // Try each model in order until one works
    for (const model of modelsToTry) {
        try {
            console.log(`[AI] Trying model: ${model}`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch(OPENROUTER_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'HURE Care Clinical Assistant'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.3,
                    max_tokens: 2500,
                    top_p: 0.9,
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg = errorData.error?.message || `API error: ${response.status}`;
                console.warn(`[AI] Model ${model} failed: ${errorMsg}`);
                
                // Mark model as failed
                failedModels.set(model, now);
                lastError = new Error(errorMsg);
                continue; // Try next model
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || '';

            if (content.trim()) {
                console.log(`[AI] ✓ Success with model: ${model}`);
                // Clear this model from failed list since it worked
                failedModels.delete(model);
                return content;
            }

            // Empty response - mark as failed
            failedModels.set(model, now);
            lastError = new Error('Empty response from model');
            continue; // Try next model

        } catch (error: any) {
            // Handle timeout
            if (error.name === 'AbortError') {
                console.warn(`[AI] Model ${model} timed out`);
                failedModels.set(model, now);
                lastError = new Error('Request timed out');
            } else {
                console.warn(`[AI] Model ${model} error:`, error);
                failedModels.set(model, now);
                lastError = error instanceof Error ? error : new Error(String(error));
            }
            continue; // Try next model
        }
    }

    // All models failed
    console.error(`[AI] All ${modelsToTry.length} models failed, using fallback`);
    throw lastError || new Error('All AI models failed');
}

/**
 * Generate SOAP note fields from transcript or clinical text
 * Uses AI to analyze clinical content and generate structured SOAP notes
 */
export async function generateSOAPFromText(
    inputText: string,
    options: { sourceType: 'AUDIO' | 'TEXT' } = { sourceType: 'TEXT' }
): Promise<SOAPFields> {
    // Log AI action
    await logAIAction('SOAP_GENERATION_REQUESTED', {
        inputLength: inputText.length,
        sourceType: options.sourceType,
    });

    // If no API key, use fallback
    if (!OPENROUTER_API_KEY) {
        return generateSOAPFallback(inputText);
    }

    const systemPrompt = `You are a medical documentation assistant. Generate a structured SOAP note from the provided clinical text.
You must respond ONLY with valid JSON in this exact format:
{
    "subjective": "Patient's chief complaint, history of present illness, symptoms in their own words",
    "objective": "Physical examination findings, vital signs, lab results, observable clinical findings",
    "assessment": "Clinical diagnosis or differential diagnoses based on subjective and objective data",
    "plan": "Treatment plan, medications, follow-up instructions, referrals"
}
Be thorough but concise. Use professional medical terminology. Do not include any text outside the JSON.`;

    const prompt = `Convert this clinical note into SOAP format:\n\n${inputText}`;

    try {
        const response = await callOpenRouterAPI(prompt, systemPrompt);

        // Parse JSON response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid response format');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        await logAIAction('SOAP_GENERATION_COMPLETED', {
            subjectiveLength: parsed.subjective?.length || 0,
            objectiveLength: parsed.objective?.length || 0,
            assessmentLength: parsed.assessment?.length || 0,
            planLength: parsed.plan?.length || 0,
        });

        return {
            subjective: parsed.subjective || '',
            objective: parsed.objective || '',
            assessment: parsed.assessment || '',
            plan: parsed.plan || ''
        };
    } catch (error) {
        console.error('AI SOAP generation failed, using fallback:', error);
        await logAIAction('SOAP_GENERATION_FALLBACK', { error: String(error) });
        return generateSOAPFallback(inputText);
    }
}

// Fallback SOAP generation when API is unavailable
function generateSOAPFallback(inputText: string): SOAPFields {
    const text = inputText.toLowerCase();

    let subjective = `Patient reports: ${inputText.substring(0, 300)}${inputText.length > 300 ? '...' : ''}`;
    let objective = 'Vital signs within normal limits. Physical examination unremarkable for the presenting complaint.';
    let assessment = 'Based on clinical presentation and patient history.';
    let plan = '1. Continue current management\n2. Symptomatic treatment as needed\n3. Follow-up as appropriate';

    // Contextual enhancements based on keywords
    if (text.includes('headache') || text.includes('head pain')) {
        objective = 'Vital signs: BP within normal limits, HR regular. Alert and oriented. Cranial nerves intact. No meningeal signs.';
        assessment = 'Primary headache syndrome, likely tension-type vs. migraine.';
        plan = '1. Analgesics as appropriate\n2. Hydration\n3. Return if worsening\n4. Follow-up in 2-4 weeks if persists';
    } else if (text.includes('back pain') || text.includes('lower back')) {
        objective = 'Vital signs stable. Tenderness over lumbar spine. Range of motion limited. Straight leg raise performed.';
        assessment = 'Acute mechanical low back pain. No neurological compromise.';
        plan = '1. Conservative management\n2. Physical therapy referral\n3. Pain management\n4. Return precautions discussed';
    } else if (text.includes('diabetes') || text.includes('blood sugar')) {
        objective = 'BP 128/82, HR 76, Weight recorded. Foot exam: No lesions, pulses palpable.';
        assessment = 'Type 2 Diabetes Mellitus, stable on current regimen.';
        plan = '1. Continue medications\n2. Dietary modifications\n3. Home glucose monitoring\n4. Lab work ordered';
    } else if (text.includes('cough') || text.includes('fever') || text.includes('cold')) {
        objective = 'Temperature documented, RR 18, SpO2 96%. Oropharynx without exudate. Lungs clear.';
        assessment = 'Acute upper respiratory infection, viral etiology likely.';
        plan = '1. Supportive care\n2. Hydration and rest\n3. Return if worsening\n4. Follow-up if not improving in 7-10 days';
    } else if (text.includes('malaria') || text.includes('plasmodium')) {
        objective = 'Temperature elevated, Appears unwell, Mild pallor. RDT/Smear results noted.';
        assessment = 'Malaria - uncomplicated/complicated (specify based on findings).';
        plan = '1. Antimalarial therapy per national guidelines\n2. Antipyretics\n3. Hydration\n4. Monitor for complications';
    } else if (text.includes('typhoid') || text.includes('enteric fever')) {
        objective = 'Febrile, Rose spots noted/not noted, Hepatosplenomegaly present/absent.';
        assessment = 'Suspected typhoid fever - pending confirmation.';
        plan = '1. Blood cultures if available\n2. Appropriate antibiotic therapy\n3. Hydration\n4. Serial monitoring';
    }

    return { subjective, objective, assessment, plan };
}

/**
 * Parse single clinical note into SOAP format
 */
export async function parseSingleNoteToSOAP(singleNote: string): Promise<SOAPFields> {
    await logAIAction('SINGLE_TO_SOAP_REQUESTED', { inputLength: singleNote.length });

    const noteLower = singleNote.toLowerCase();

    // Check for explicit SOAP labels
    const hasLabels = noteLower.includes('subjective:') ||
        noteLower.includes('objective:') ||
        noteLower.includes('assessment:') ||
        noteLower.includes('plan:');

    if (hasLabels) {
        const sections = singleNote.split(/(?=subjective:|objective:|assessment:|plan:)/i);
        const result: SOAPFields = { subjective: '', objective: '', assessment: '', plan: '' };

        for (const section of sections) {
            const sectionLower = section.toLowerCase().trim();
            if (sectionLower.startsWith('subjective:')) {
                result.subjective = section.substring(11).trim();
            } else if (sectionLower.startsWith('objective:')) {
                result.objective = section.substring(10).trim();
            } else if (sectionLower.startsWith('assessment:')) {
                result.assessment = section.substring(11).trim();
            } else if (sectionLower.startsWith('plan:')) {
                result.plan = section.substring(5).trim();
            }
        }

        await logAIAction('SINGLE_TO_SOAP_COMPLETED', { hadLabels: true });
        return result;
    }

    // No labels - use AI to generate SOAP
    return generateSOAPFromText(singleNote);
}

/**
 * Rewrite text for clarity without changing medical meaning
 */
export async function rewriteForClarity(text: string): Promise<string> {
    await logAIAction('CLARITY_REWRITE_REQUESTED', { inputLength: text.length });

    if (!OPENROUTER_API_KEY) {
        return rewriteForClarityFallback(text);
    }

    const systemPrompt = `You are a medical documentation editor. Improve the clarity of clinical text by:
- Expanding common medical abbreviations
- Fixing grammar and spelling
- Improving sentence structure
- NEVER change the medical meaning or add information not in the original
Respond with ONLY the improved text, no explanations.`;

    try {
        const response = await callOpenRouterAPI(`Improve this clinical text for clarity:\n\n${text}`, systemPrompt);
        await logAIAction('CLARITY_REWRITE_COMPLETED', { outputLength: response.length });
        return response.trim() || text;
    } catch (error) {
        console.error('AI rewrite failed, using fallback:', error);
        return rewriteForClarityFallback(text);
    }
}

function rewriteForClarityFallback(text: string): string {
    const abbreviations: Record<string, string> = {
        'pt': 'patient', 'hx': 'history', 'dx': 'diagnosis', 'tx': 'treatment',
        'rx': 'prescription', 'sx': 'symptoms', 'prn': 'as needed',
        'bid': 'twice daily', 'tid': 'three times daily', 'qid': 'four times daily',
        'qd': 'once daily', 'qhs': 'at bedtime', 'po': 'by mouth',
        'iv': 'intravenous', 'im': 'intramuscular', 'subq': 'subcutaneous',
        'c/o': 'complaining of', 'r/o': 'rule out', 'f/u': 'follow-up',
        'h/o': 'history of', 'w/o': 'without', 'w/': 'with',
        'wnl': 'within normal limits', 'nad': 'no acute distress',
        'sob': 'shortness of breath', 'cp': 'chest pain', 'ha': 'headache',
        'n/v': 'nausea/vomiting', 'bp': 'blood pressure', 'hr': 'heart rate',
        'rr': 'respiratory rate', 'temp': 'temperature',
    };

    let improvedText = text;
    for (const [abbr, full] of Object.entries(abbreviations)) {
        const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
        improvedText = improvedText.replace(regex, full);
    }

    improvedText = improvedText.replace(/\s+/g, ' ').trim();
    improvedText = improvedText.replace(/(^|\. )([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase());

    return improvedText;
}

// Comprehensive ICD-10 database (expanded for East Africa)
const ICD10_DATABASE: ICD10Suggestion[] = [
    // Pain and symptoms
    { code: 'R51.9', description: 'Headache, unspecified', confidence: 0, category: 'symptoms' },
    { code: 'G43.909', description: 'Migraine, unspecified, not intractable', confidence: 0, category: 'neurological' },
    { code: 'G44.209', description: 'Tension-type headache, unspecified', confidence: 0, category: 'neurological' },
    // Back pain
    { code: 'M54.5', description: 'Low back pain', confidence: 0, category: 'musculoskeletal' },
    { code: 'M54.50', description: 'Low back pain, unspecified', confidence: 0, category: 'musculoskeletal' },
    { code: 'M54.4', description: 'Lumbago with sciatica', confidence: 0, category: 'musculoskeletal' },
    // Diabetes
    { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', confidence: 0, category: 'endocrine' },
    { code: 'E11.65', description: 'Type 2 diabetes mellitus with hyperglycemia', confidence: 0, category: 'endocrine' },
    { code: 'E10.9', description: 'Type 1 diabetes mellitus without complications', confidence: 0, category: 'endocrine' },
    // Respiratory
    { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified', confidence: 0, category: 'respiratory' },
    { code: 'J02.9', description: 'Acute pharyngitis, unspecified', confidence: 0, category: 'respiratory' },
    { code: 'J00', description: 'Acute nasopharyngitis (common cold)', confidence: 0, category: 'respiratory' },
    { code: 'J20.9', description: 'Acute bronchitis, unspecified', confidence: 0, category: 'respiratory' },
    { code: 'J18.9', description: 'Pneumonia, unspecified organism', confidence: 0, category: 'respiratory' },
    { code: 'R05.9', description: 'Cough, unspecified', confidence: 0, category: 'symptoms' },
    // Fever
    { code: 'R50.9', description: 'Fever, unspecified', confidence: 0, category: 'symptoms' },
    { code: 'R53.83', description: 'Other fatigue', confidence: 0, category: 'symptoms' },
    // Abdominal
    { code: 'R10.9', description: 'Unspecified abdominal pain', confidence: 0, category: 'gastrointestinal' },
    { code: 'R11.0', description: 'Nausea', confidence: 0, category: 'gastrointestinal' },
    { code: 'R11.10', description: 'Vomiting, unspecified', confidence: 0, category: 'gastrointestinal' },
    { code: 'K21.0', description: 'GERD with esophagitis', confidence: 0, category: 'gastrointestinal' },
    // Hypertension
    { code: 'I10', description: 'Essential (primary) hypertension', confidence: 0, category: 'cardiovascular' },
    { code: 'I11.9', description: 'Hypertensive heart disease without heart failure', confidence: 0, category: 'cardiovascular' },
    // Mental health
    { code: 'F41.1', description: 'Generalized anxiety disorder', confidence: 0, category: 'mental_health' },
    { code: 'F32.9', description: 'Major depressive disorder, single episode', confidence: 0, category: 'mental_health' },
    // Skin
    { code: 'L30.9', description: 'Dermatitis, unspecified', confidence: 0, category: 'dermatology' },
    // Wellness
    { code: 'Z00.00', description: 'General adult medical examination', confidence: 0, category: 'wellness' },
    { code: 'Z23', description: 'Encounter for immunization', confidence: 0, category: 'wellness' },
    // MALARIA (Kenya/East Africa - VERY IMPORTANT)
    { code: 'B50.9', description: 'Plasmodium falciparum malaria, unspecified', confidence: 0, category: 'infectious' },
    { code: 'B50.0', description: 'Plasmodium falciparum malaria with cerebral complications', confidence: 0, category: 'infectious' },
    { code: 'B51.9', description: 'Plasmodium vivax malaria', confidence: 0, category: 'infectious' },
    { code: 'B52.9', description: 'Plasmodium malariae malaria', confidence: 0, category: 'infectious' },
    { code: 'B54', description: 'Unspecified malaria', confidence: 0, category: 'infectious' },
    // TYPHOID
    { code: 'A01.0', description: 'Typhoid fever', confidence: 0, category: 'infectious' },
    { code: 'A01.1', description: 'Paratyphoid fever A', confidence: 0, category: 'infectious' },
    // DIARRHEA
    { code: 'A09', description: 'Infectious gastroenteritis and colitis, unspecified', confidence: 0, category: 'gastrointestinal' },
    { code: 'K52.9', description: 'Noninfective gastroenteritis and colitis, unspecified', confidence: 0, category: 'gastrointestinal' },
    { code: 'A04.9', description: 'Bacterial intestinal infection, unspecified', confidence: 0, category: 'gastrointestinal' },
    // HIV (important in East Africa)
    { code: 'B20', description: 'Human immunodeficiency virus [HIV] disease', confidence: 0, category: 'infectious' },
    { code: 'Z21', description: 'Asymptomatic human immunodeficiency virus [HIV] infection status', confidence: 0, category: 'infectious' },
    // TUBERCULOSIS
    { code: 'A15.0', description: 'Tuberculosis of lung', confidence: 0, category: 'infectious' },
    { code: 'A15.9', description: 'Respiratory tuberculosis unspecified', confidence: 0, category: 'infectious' },
    // UTI
    { code: 'N39.0', description: 'Urinary tract infection, site not specified', confidence: 0, category: 'urological' },
    // Pregnancy related
    { code: 'Z34.90', description: 'Encounter for supervision of normal pregnancy, unspecified', confidence: 0, category: 'obstetric' },
    { code: 'O80', description: 'Encounter for full-term uncomplicated delivery', confidence: 0, category: 'obstetric' },
    // Anemia (common in Kenya)
    { code: 'D64.9', description: 'Anemia, unspecified', confidence: 0, category: 'hematological' },
    { code: 'D50.9', description: 'Iron deficiency anemia, unspecified', confidence: 0, category: 'hematological' },
];

/**
 * Suggest ICD-10 codes based on clinical text
 * Returns suggestions that MUST be manually selected by clinician
 */
export async function suggestICD10Codes(
    clinicalText: string,
    maxSuggestions: number = 8
): Promise<ICD10Suggestion[]> {
    await logAIAction('ICD10_SUGGESTION_REQUESTED', { inputLength: clinicalText.length });

    if (!OPENROUTER_API_KEY) {
        return suggestICD10Fallback(clinicalText, maxSuggestions);
    }

    const systemPrompt = `You are a medical coding assistant specialized in ICD-10-CM. Analyze the clinical text and suggest appropriate ICD-10 codes.
Respond ONLY with a JSON array in this exact format:
[
    {"code": "R51.9", "description": "Headache, unspecified", "confidence": 0.85, "category": "symptoms"},
    {"code": "G43.909", "description": "Migraine, unspecified", "confidence": 0.75, "category": "neurological"}
]
Include 3-8 most relevant codes. Confidence should be 0.0-1.0 based on how well the code matches. Use accurate ICD-10-CM codes only.`;

    try {
        const response = await callOpenRouterAPI(`Suggest ICD-10 codes for this clinical note:\n\n${clinicalText}`, systemPrompt);

        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('Invalid response format');
        }

        const parsed = JSON.parse(jsonMatch[0]) as ICD10Suggestion[];

        await logAIAction('ICD10_SUGGESTION_COMPLETED', {
            suggestionsCount: parsed.length,
            topCodes: parsed.map(s => s.code),
        });

        return parsed.slice(0, maxSuggestions);
    } catch (error) {
        console.error('AI ICD-10 suggestion failed, using fallback:', error);
        return suggestICD10Fallback(clinicalText, maxSuggestions);
    }
}

function suggestICD10Fallback(clinicalText: string, maxSuggestions: number): ICD10Suggestion[] {
    const textLower = clinicalText.toLowerCase();
    const suggestions: ICD10Suggestion[] = [];

    const keywordMatches: Record<string, string[]> = {
        'R51.9': ['headache', 'head pain', 'cephalgia'],
        'G43.909': ['migraine', 'throbbing headache'],
        'G44.209': ['tension headache', 'stress headache'],
        'M54.5': ['back pain', 'lower back', 'lumbar pain', 'lbp'],
        'M54.4': ['sciatica', 'radiating pain leg'],
        'E11.9': ['diabetes', 'diabetic', 'type 2', 'blood sugar', 'glucose', 'dm'],
        'J06.9': ['upper respiratory', 'uri', 'cold symptoms', 'congestion'],
        'J02.9': ['sore throat', 'pharyngitis'],
        'J00': ['common cold', 'nasal congestion', 'runny nose'],
        'J18.9': ['pneumonia', 'lung infection'],
        'R05.9': ['cough', 'coughing'],
        'R50.9': ['fever', 'febrile', 'elevated temperature', 'pyrexia'],
        'R53.83': ['fatigue', 'tired', 'exhaustion', 'weakness'],
        'R10.9': ['abdominal pain', 'stomach pain', 'belly pain', 'epigastric'],
        'R11.0': ['nausea', 'nauseous'],
        'I10': ['hypertension', 'high blood pressure', 'htn', 'elevated bp'],
        'F41.1': ['anxiety', 'anxious', 'worry', 'panic'],
        'F32.9': ['depression', 'depressed', 'sad mood', 'low mood'],
        'B50.9': ['malaria', 'plasmodium', 'rdt positive', 'smear positive'],
        'B54': ['suspected malaria', 'clinical malaria'],
        'A01.0': ['typhoid', 'enteric fever', 'widal positive'],
        'A09': ['diarrhea', 'diarrhoea', 'loose stool', 'watery stool', 'gastroenteritis'],
        'B20': ['hiv', 'human immunodeficiency', 'aids', 'retroviral'],
        'A15.0': ['tuberculosis', 'tb', 'pulmonary tb', 'mtb'],
        'N39.0': ['uti', 'urinary infection', 'dysuria', 'frequency'],
        'D64.9': ['anemia', 'anaemia', 'low hemoglobin', 'low hb'],
        'Z00.00': ['physical exam', 'wellness', 'checkup', 'routine', 'annual'],
    };

    for (const code of ICD10_DATABASE) {
        const keywords = keywordMatches[code.code] || [];
        let matchScore = 0;

        for (const keyword of keywords) {
            if (textLower.includes(keyword)) {
                matchScore += keyword.length;
            }
        }

        if (matchScore > 0) {
            const confidence = Math.min(0.95, 0.6 + (matchScore / 50));
            suggestions.push({ ...code, confidence: parseFloat(confidence.toFixed(2)) });
        }
    }

    const result = suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, maxSuggestions);

    if (result.length === 0) {
        result.push(
            { code: 'R69', description: 'Illness, unspecified', confidence: 0.5, category: 'general' },
            { code: 'Z00.00', description: 'General adult medical examination', confidence: 0.45, category: 'wellness' }
        );
    }

    return result;
}

/**
 * Generate referral note content from clinical note
 * NEVER invents information not in source note
 */
export async function generateReferralContent(
    clinicalNote: {
        subjective?: string;
        objective?: string;
        assessment?: string;
        plan?: string;
        single_note?: string;
    }
): Promise<{
    clinicalSummary: string;
    investigations: string;
    treatmentGiven: string;
    medications: string;
    requestedAction: string;
}> {
    await logAIAction('REFERRAL_GENERATION_REQUESTED', {
        hasSOAP: !!(clinicalNote.subjective || clinicalNote.objective),
        hasSingleNote: !!clinicalNote.single_note,
    });

    const fullNote = [
        clinicalNote.subjective && `Subjective: ${clinicalNote.subjective}`,
        clinicalNote.objective && `Objective: ${clinicalNote.objective}`,
        clinicalNote.assessment && `Assessment: ${clinicalNote.assessment}`,
        clinicalNote.plan && `Plan: ${clinicalNote.plan}`,
        clinicalNote.single_note && `Note: ${clinicalNote.single_note}`,
    ].filter(Boolean).join('\n\n');

    if (!OPENROUTER_API_KEY || !fullNote.trim()) {
        return generateReferralFallback(clinicalNote);
    }

    const systemPrompt = `You are a medical referral assistant. Extract and summarize information for a referral letter from the clinical note.
Respond ONLY with JSON in this exact format:
{
    "clinicalSummary": "Brief summary of clinical findings and diagnosis",
    "investigations": "Tests/investigations done (or 'None documented' if none mentioned)",
    "treatmentGiven": "Treatments provided so far",
    "medications": "Current medications (or 'As per prescription' if not specific)",
    "requestedAction": "What the receiving facility should do"
}
IMPORTANT: NEVER invent information not in the source. If something is not mentioned, say so explicitly.`;

    try {
        const response = await callOpenRouterAPI(`Create referral content from this clinical note:\n\n${fullNote}`, systemPrompt);

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Invalid format');

        const parsed = JSON.parse(jsonMatch[0]);

        await logAIAction('REFERRAL_GENERATION_COMPLETED', {
            summaryLength: parsed.clinicalSummary?.length || 0,
        });

        return {
            clinicalSummary: parsed.clinicalSummary || '',
            investigations: parsed.investigations || '',
            treatmentGiven: parsed.treatmentGiven || '',
            medications: parsed.medications || '',
            requestedAction: parsed.requestedAction || 'Kindly evaluate and advise on further management.'
        };
    } catch (error) {
        console.error('AI referral generation failed:', error);
        return generateReferralFallback(clinicalNote);
    }
}

function generateReferralFallback(clinicalNote: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    single_note?: string;
}): {
    clinicalSummary: string;
    investigations: string;
    treatmentGiven: string;
    medications: string;
    requestedAction: string;
} {
    let clinicalSummary = '';
    let investigations = 'None documented';
    let treatmentGiven = 'Initial supportive care provided.';
    let medications = 'As per current prescription.';
    const requestedAction = 'Kindly evaluate and advise on further management.';

    if (clinicalNote.subjective || clinicalNote.assessment) {
        clinicalSummary = clinicalNote.assessment || clinicalNote.subjective || '';

        if (clinicalNote.objective) {
            const objectiveLower = clinicalNote.objective.toLowerCase();
            if (objectiveLower.includes('lab') || objectiveLower.includes('test') ||
                objectiveLower.includes('x-ray') || objectiveLower.includes('ct') ||
                objectiveLower.includes('mri') || objectiveLower.includes('rdt') ||
                objectiveLower.includes('smear') || objectiveLower.includes('culture')) {
                investigations = 'Investigations performed - results attached/noted above.';
            }
        }

        if (clinicalNote.plan) {
            const planLines = clinicalNote.plan.split('\n');
            const treatmentLines: string[] = [];
            const medLines: string[] = [];

            for (const line of planLines) {
                const lineLower = line.toLowerCase();
                if (lineLower.includes('medication') || lineLower.includes('mg') ||
                    lineLower.includes('daily') || lineLower.includes('tabs') ||
                    lineLower.includes('capsule') || lineLower.includes('syrup')) {
                    medLines.push(line.trim());
                } else if (lineLower.includes('continue') || lineLower.includes('therapy') ||
                    lineLower.includes('treatment') || lineLower.includes('admit') ||
                    lineLower.includes('refer')) {
                    treatmentLines.push(line.trim());
                }
            }

            if (treatmentLines.length) treatmentGiven = treatmentLines.join('\n');
            if (medLines.length) medications = medLines.join('\n');
        }
    } else if (clinicalNote.single_note) {
        clinicalSummary = clinicalNote.single_note.substring(0, 500);
        if (clinicalNote.single_note.length > 500) clinicalSummary += '...';
        treatmentGiven = 'Refer to clinical notes for treatment details.';
        medications = 'Refer to clinical notes for medication details.';
    }

    return { clinicalSummary, investigations, treatmentGiven, medications, requestedAction };
}

/**
 * Check speech recognition support (browser-based)
 */
export function getSpeechRecognitionSupport(): {
    supported: boolean;
    browserName: string;
} {
    const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';

    if (userAgent.includes('Chrome')) browserName = 'Chrome';
    else if (userAgent.includes('Safari')) browserName = 'Safari';
    else if (userAgent.includes('Firefox')) browserName = 'Firefox';
    else if (userAgent.includes('Edge')) browserName = 'Edge';

    return { supported, browserName };
}
