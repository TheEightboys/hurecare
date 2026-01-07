import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Calendar, Clock, CheckCircle2, Phone, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

interface AppointmentBadgesProps {
    bookingType: 'SAME_DAY' | 'ADVANCE';
    confirmationIndicator: 'C' | 'NC' | 'LM';
    confirmationMethod?: string | null;
    lastConfirmationAttempt?: string | null;
    status: string;
    className?: string;
}

export function AppointmentBadges({
    bookingType,
    confirmationIndicator,
    confirmationMethod,
    lastConfirmationAttempt,
    status,
    className = '',
}: AppointmentBadgesProps) {
    const getConfirmationIcon = () => {
        switch (confirmationMethod) {
            case 'Phone':
                return <Phone className="w-3 h-3" />;
            case 'SMS':
            case 'WhatsApp':
                return <MessageCircle className="w-3 h-3" />;
            default:
                return <Clock className="w-3 h-3" />;
        }
    };

    const getConfirmationLabel = () => {
        switch (confirmationIndicator) {
            case 'C':
                return 'Confirmed';
            case 'LM':
                return 'Left Message';
            default:
                return 'Not Confirmed';
        }
    };

    const getConfirmationClass = () => {
        switch (confirmationIndicator) {
            case 'C':
                return 'badge-confirmed';
            case 'LM':
                return 'badge-left-message';
            default:
                return 'badge-not-confirmed';
        }
    };

    const getStatusClass = () => {
        switch (status) {
            case 'COMPLETED':
                return 'status-completed';
            case 'IN_SESSION':
                return 'status-in-session';
            case 'CANCELLED':
                return 'status-cancelled';
            case 'NO_SHOW':
                return 'status-no-show';
            default:
                return 'status-scheduled';
        }
    };

    const formatStatus = (s: string) => {
        return s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
            {/* Booking Type Badge */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge
                        variant="outline"
                        className={bookingType === 'SAME_DAY' ? 'badge-same-day' : 'badge-advance'}
                    >
                        <Calendar className="w-3 h-3 mr-1" />
                        {bookingType === 'SAME_DAY' ? 'SD' : 'ADV'}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    {bookingType === 'SAME_DAY' ? 'Same Day Booking' : 'Advance Booking'}
                </TooltipContent>
            </Tooltip>

            {/* Confirmation Status Badge */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge variant="outline" className={getConfirmationClass()}>
                        {confirmationIndicator === 'C' ? (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                        ) : (
                            getConfirmationIcon()
                        )}
                        {confirmationIndicator}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                    <div className="space-y-1">
                        <p className="font-medium">{getConfirmationLabel()}</p>
                        {confirmationMethod && (
                            <p className="text-xs text-muted-foreground">
                                Method: {confirmationMethod}
                            </p>
                        )}
                        {lastConfirmationAttempt && (
                            <p className="text-xs text-muted-foreground">
                                Last attempt: {format(new Date(lastConfirmationAttempt), 'MMM d, h:mm a')}
                            </p>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>

            {/* Status Badge */}
            <Badge className={`status-badge ${getStatusClass()}`}>
                {formatStatus(status)}
            </Badge>
        </div>
    );
}

// Quick action buttons for appointment card
interface AppointmentQuickActionsProps {
    appointmentId: string;
    currentStatus: string;
    currentConfirmation: 'C' | 'NC' | 'LM';
    onStatusChange: (id: string, status: string) => void;
    onConfirmationChange: (id: string, indicator: 'C' | 'NC' | 'LM', method?: string) => void;
}

export function AppointmentQuickActions({
    appointmentId,
    currentStatus,
    currentConfirmation,
    onStatusChange,
    onConfirmationChange,
}: AppointmentQuickActionsProps) {
    return (
        <div className="flex flex-wrap gap-1">
            {currentConfirmation !== 'C' && (
                <button
                    onClick={() => onConfirmationChange(appointmentId, 'C', 'Phone')}
                    className="text-xs px-2 py-1 rounded bg-success/10 text-success hover:bg-success/20 transition-colors"
                >
                    ✓ Confirm
                </button>
            )}
            {currentConfirmation !== 'LM' && currentConfirmation !== 'C' && (
                <button
                    onClick={() => onConfirmationChange(appointmentId, 'LM', 'Phone')}
                    className="text-xs px-2 py-1 rounded bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
                >
                    📞 Left Msg
                </button>
            )}
            {currentStatus === 'SCHEDULED' && (
                <button
                    onClick={() => onStatusChange(appointmentId, 'IN_SESSION')}
                    className="text-xs px-2 py-1 rounded bg-info/10 text-info hover:bg-info/20 transition-colors"
                >
                    ▶ Start
                </button>
            )}
            {currentStatus === 'IN_SESSION' && (
                <button
                    onClick={() => onStatusChange(appointmentId, 'COMPLETED')}
                    className="text-xs px-2 py-1 rounded bg-success/10 text-success hover:bg-success/20 transition-colors"
                >
                    ✓ Complete
                </button>
            )}
        </div>
    );
}
