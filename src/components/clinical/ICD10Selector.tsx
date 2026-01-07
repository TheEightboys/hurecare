import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Search, X, AlertCircle } from 'lucide-react';

interface ICD10Code {
    code: string;
    description: string;
    confidence?: number;
}

interface ICD10SelectorProps {
    suggestions: Array<{ code: string; description: string; confidence: number }>;
    selectedCodes: ICD10Code[];
    onSelectionChange: (codes: ICD10Code[]) => void;
}

export function ICD10Selector({ suggestions, selectedCodes, onSelectionChange }: ICD10SelectorProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [customCode, setCustomCode] = useState('');
    const [customDescription, setCustomDescription] = useState('');

    const handleToggleCode = (code: ICD10Code) => {
        const exists = selectedCodes.some(c => c.code === code.code);
        if (exists) {
            onSelectionChange(selectedCodes.filter(c => c.code !== code.code));
        } else {
            onSelectionChange([...selectedCodes, { code: code.code, description: code.description }]);
        }
    };

    const handleRemoveCode = (code: string) => {
        onSelectionChange(selectedCodes.filter(c => c.code !== code));
    };

    const handleAddCustomCode = () => {
        if (customCode && customDescription) {
            if (!selectedCodes.some(c => c.code === customCode)) {
                onSelectionChange([...selectedCodes, { code: customCode, description: customDescription }]);
            }
            setCustomCode('');
            setCustomDescription('');
        }
    };

    const filteredSuggestions = suggestions.filter(s =>
        s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Selected Codes */}
            {selectedCodes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedCodes.map((code) => (
                        <Badge key={code.code} variant="default" className="gap-1 pr-1">
                            <span className="font-mono font-bold">{code.code}</span>
                            <span className="text-xs opacity-80">- {code.description}</span>
                            <button
                                onClick={() => handleRemoveCode(code.code)}
                                className="ml-1 p-0.5 hover:bg-primary-foreground/20 rounded"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            {/* AI Suggestions */}
            {suggestions.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="w-4 h-4" />
                        <span>AI suggestions require manual selection - review and select appropriate codes</span>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search suggestions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
                        {filteredSuggestions.map((suggestion) => {
                            const isSelected = selectedCodes.some(c => c.code === suggestion.code);
                            return (
                                <label
                                    key={suggestion.code}
                                    className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                                >
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => handleToggleCode(suggestion)}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-primary">{suggestion.code}</span>
                                            <span className="text-sm text-foreground">{suggestion.description}</span>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${suggestion.confidence >= 0.8
                                                ? 'bg-success/10 text-success'
                                                : suggestion.confidence >= 0.6
                                                    ? 'bg-warning/10 text-warning'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}>
                                            {Math.round(suggestion.confidence * 100)}% match
                                        </span>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Manual Entry */}
            <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3">Add code manually</p>
                <div className="flex gap-2">
                    <Input
                        placeholder="Code (e.g., R51)"
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                        className="w-32"
                    />
                    <Input
                        placeholder="Description"
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                        className="flex-1"
                    />
                    <button
                        onClick={handleAddCustomCode}
                        disabled={!customCode || !customDescription}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                    >
                        Add
                    </button>
                </div>
            </div>

            {/* Empty State */}
            {suggestions.length === 0 && selectedCodes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <p>Click "Suggest ICD-10" to get AI-powered code suggestions</p>
                    <p className="text-sm mt-1">You can also add codes manually above</p>
                </div>
            )}
        </div>
    );
}
