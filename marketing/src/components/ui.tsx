import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    asLink?: string;
}

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    children,
    asLink,
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-950";

    const variants = {
        primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 hover:shadow-indigo-900/40 border border-transparent",
        secondary: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 border border-transparent",
        outline: "bg-transparent border border-slate-700 hover:bg-slate-800 text-slate-200",
        ghost: "bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white"
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg"
    };

    const classes = cn(baseStyles, variants[variant], sizes[size], className);

    if (asLink) {
        const isExternal = asLink.startsWith('http') || asLink.startsWith('https') || asLink.startsWith('//');

        if (isExternal) {
            return (
                <a href={asLink} className={classes}>
                    {children}
                </a>
            );
        }

        return (
            <Link to={asLink} className={classes}>
                {children}
            </Link>
        );
    }

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
}

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    darker?: boolean;
}

export function Section({ className, darker = false, children, ...props }: SectionProps) {
    return (
        <section
            className={cn(
                "py-24 px-6 relative overflow-hidden",
                darker ? "bg-slate-950" : "bg-slate-900/50",
                className
            )}
            {...props}
        >
            <div className="max-w-7xl mx-auto relative z-10">
                {children}
            </div>
        </section>
    );
}

export function SectionHeader({ title, subtitle, className }: { title: string; subtitle?: string; className?: string }) {
    return (
        <div className={cn("text-center max-w-3xl mx-auto mb-16", className)}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-white">{title}</h2>
            {subtitle && <p className="text-lg text-slate-300 leading-relaxed">{subtitle}</p>}
        </div>
    );
}
