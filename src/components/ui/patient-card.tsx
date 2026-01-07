import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { User, Phone, Mail, Calendar, MoreVertical, FileText, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';

interface PatientCardProps {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  insuranceProvider?: string;
  delay?: number;
  onClick?: () => void;
}

export function PatientCard({
  id,
  firstName,
  lastName,
  email,
  phone,
  dateOfBirth,
  insuranceProvider,
  delay = 0,
  onClick,
}: PatientCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        delay: delay,
        ease: 'power3.out',
      });
    }, cardRef);

    return () => ctx.revert();
  }, [delay]);

  const getInitials = () => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const calculateAge = () => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge();

  return (
    <div
      ref={cardRef}
      className="glass-card-hover rounded-xl p-5 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
          {getInitials()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground truncate">
              {firstName} {lastName}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to={`/patients/${id}`} className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/patients/${id}/notes`} className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Clinical Notes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/patients/${id}/billing`} className="flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={`/appointments/new?patient=${id}`} className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Contact Info */}
          <div className="mt-2 space-y-1">
            {phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-3.5 h-3.5" />
                <span>{phone}</span>
              </div>
            )}
            {email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{email}</span>
              </div>
            )}
          </div>

          {/* Meta Info */}
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            {age !== null && (
              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                {age} years old
              </span>
            )}
            {insuranceProvider && (
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                {insuranceProvider}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
