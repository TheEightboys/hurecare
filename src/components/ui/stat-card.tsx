import { ReactNode, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  delay?: number;
}

const variantStyles = {
  default: {
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
  },
  primary: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  success: {
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
  },
  warning: {
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
  },
  error: {
    iconBg: 'bg-error/10',
    iconColor: 'text-error',
  },
};

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  variant = 'default',
  delay = 0 
}: StatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const styles = variantStyles[variant];

  useEffect(() => {
    if (!cardRef.current) return;
    
    const ctx = gsap.context(() => {
      // Set initial state
      gsap.set(cardRef.current, { opacity: 1, y: 0 });
      
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        delay: delay,
        ease: 'power3.out',
      });

      // Animate number if it's a number
      if (typeof value === 'number' && valueRef.current) {
        gsap.from({ val: 0 }, {
          val: value,
          duration: 1.5,
          delay: delay + 0.3,
          ease: 'power2.out',
          onUpdate: function() {
            if (valueRef.current) {
              valueRef.current.textContent = Math.round(this.targets()[0].val).toLocaleString();
            }
          }
        });
      }
    }, cardRef);

    return () => ctx.revert();
  }, [delay, value]);

  return (
    <div
      ref={cardRef}
      className="glass-card-hover rounded-2xl p-6 h-full min-h-[140px]"
    >
      <div className="flex items-start justify-between">
        <div className={cn('p-3 rounded-xl', styles.iconBg)}>
          <Icon className={cn('w-6 h-6', styles.iconColor)} />
        </div>
        
        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-sm font-medium',
            trend.isPositive ? 'text-success' : 'text-error'
          )}>
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <span
          ref={valueRef}
          className="text-3xl font-display font-bold text-foreground"
        >
          {typeof value === 'number' ? '0' : value}
        </span>
        <h3 className="text-sm font-medium text-muted-foreground mt-1">{title}</h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
