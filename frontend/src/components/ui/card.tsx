import React from 'react';
import { cn } from '../../lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className = '', ...props }, ref) => (
  <div ref={ref} className={cn('rounded-xl border border-border bg-card text-card-foreground shadow-card', className)} {...props} />
));
Card.displayName = 'Card';

const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={cn('flex flex-col gap-1.5 p-5 sm:p-6', className)} {...props} />
);
CardHeader.displayName = 'CardHeader';

const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className = '', ...props }) => (
  <h3 className={cn('text-heading-sm font-semibold tracking-tight text-foreground', className)} {...props} />
);
CardTitle.displayName = 'CardTitle';

const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className = '', ...props }) => (
  <p className={cn('text-body-sm leading-relaxed text-muted-foreground', className)} {...props} />
);
CardDescription.displayName = 'CardDescription';

const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={cn('p-5 pt-0 sm:p-6 sm:pt-0', className)} {...props} />
);
CardContent.displayName = 'CardContent';

const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={cn('flex items-center p-5 pt-0 sm:p-6 sm:pt-0', className)} {...props} />
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
