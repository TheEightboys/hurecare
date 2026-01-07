import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Clock, User, MoreVertical, Check, Phone, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AppointmentCardProps {
  id: string;
  patientName: string;
  time: string;
  duration: number;
  status: 'SCHEDULED' | 'IN_SESSION' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  bookingType: 'SAME_DAY' | 'ADVANCE';
  confirmationIndicator: 'C' | 'NC' | 'LM';
  lastConfirmationAttempt?: {
    time: string;
    method: 'CALL' | 'SMS' | 'EMAIL';
  };
  reason?: string;
  delay?: number;
  onStatusChange?: (id: string, status: string) => void;
  onConfirmationChange?: (id: string, indicator: string) => void;
}

const statusLabels = {
  SCHEDULED: 'Scheduled',
  IN_SESSION: 'In Session',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
};

const statusStyles = {
  SCHEDULED: 'status-scheduled',
  IN_SESSION: 'status-in-session',
  COMPLETED: 'status-completed',
  CANCELLED: 'status-cancelled',
  NO_SHOW: 'status-no-show',
};

const confirmationLabels = {
  C: 'Confirmed',
  NC: 'Not Confirmed',
  LM: 'Left Message',
};

const confirmationStyles = {
  C: 'badge-confirmed',
  NC: 'badge-not-confirmed',
  LM: 'badge-left-message',
};

export function AppointmentCard({
  id,
  patientName,
  time,
  duration,
  status,
  bookingType,
  confirmationIndicator,
  lastConfirmationAttempt,
  reason,
  delay = 0,
  onStatusChange,
  onConfirmationChange,
}: AppointmentCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        opacity: 0,
        x: -20,
        duration: 0.5,
        delay: delay,
        ease: 'power3.out',
      });
    }, cardRef);

    return () => ctx.revert();
  }, [delay]);

  const handleHover = (enter: boolean) => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: enter ? 1.02 : 1,
        duration: 0.2,
        ease: 'power2.out',
      });
    }
  };

  return (
    <div
      ref={cardRef}
      className="glass-card rounded-xl p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-lg"
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Patient Name & Time */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-foreground truncate">{patientName}</h4>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{time}</span>
                <span className="text-muted-foreground/50">•</span>
                <span>{duration} min</span>
              </div>
            </div>
          </div>

          {/* Reason */}
          {reason && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{reason}</p>
          )}

          {/* Badges */}
          <TooltipProvider delayDuration={300}>
            <div className="flex flex-wrap items-center gap-2">
              {/* Visit Status */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn('status-badge cursor-help', statusStyles[status])}>
                    {statusLabels[status]}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">Appointment Status</p>
                  <p className="text-xs text-muted-foreground">{statusLabels[status]}</p>
                </TooltipContent>
              </Tooltip>

              {/* Booking Type */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn(
                    'status-badge cursor-help',
                    bookingType === 'SAME_DAY' ? 'badge-same-day' : 'badge-advance'
                  )}>
                    {bookingType === 'SAME_DAY' ? 'SD' : 'ADV'}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{bookingType === 'SAME_DAY' ? 'Same Day Booking' : 'Advance Booking'}</p>
                  <p className="text-xs text-muted-foreground">
                    {bookingType === 'SAME_DAY'
                      ? 'Booked within 24 hours of appointment'
                      : 'Booked 24+ hours in advance'}
                  </p>
                </TooltipContent>
              </Tooltip>

              {/* Confirmation Indicator */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn('status-badge cursor-help', confirmationStyles[confirmationIndicator])}>
                    {confirmationIndicator}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{confirmationLabels[confirmationIndicator]}</p>
                  {lastConfirmationAttempt ? (
                    <p className="text-xs text-muted-foreground">
                      Last attempt: {lastConfirmationAttempt.time} via {lastConfirmationAttempt.method}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {confirmationIndicator === 'C'
                        ? 'Patient confirmed attendance'
                        : confirmationIndicator === 'LM'
                          ? 'Voice message left for patient'
                          : 'Awaiting patient confirmation'}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onConfirmationChange?.(id, 'C')}>
              <Check className="w-4 h-4 mr-2 text-success" />
              Mark Confirmed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onConfirmationChange?.(id, 'LM')}>
              <Phone className="w-4 h-4 mr-2 text-warning" />
              Left Message
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onStatusChange?.(id, 'IN_SESSION')}>
              Start Session
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange?.(id, 'COMPLETED')}>
              Mark Completed
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onStatusChange?.(id, 'CANCELLED')}
              className="text-error focus:text-error"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
