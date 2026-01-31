import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'fill' | 'outline';
    size?: 'sm' | 'md';
    icon?: React.ReactNode;
    href?: string;
    isLoading?: boolean;
}

export const ActionButton = ({
    variant = 'fill',
    size = 'md',
    icon,
    href,
    isLoading,
    className,
    children,
    disabled,
    ...props
}: ActionButtonProps) => {
    const baseStyles = "flex items-center justify-center gap-2 font-semibold transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed";

    const variants = {
        fill: "bg-black text-white hover:opacity-90 border border-transparent",
        outline: "bg-white text-black border border-black hover:bg-gray-50"
    };

    const sizes = {
        sm: "w-full px-2 py-3 text-sm rounded-xl font-medium",
        md: "w-full h-[56px] text-[16px] md:text-[18px] rounded-xl font-medium"
    };

    const buttonClass = cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
    );

    const content = (
        <>
            {isLoading ? <Loader2 className="animate-spin" size={size === 'sm' ? 16 : 20} /> : icon}
            {children}
        </>
    );

    if (href) {
        return (
            <Link href={href} className={buttonClass} {...(props as any)}>
                {content}
            </Link>
        );
    }

    return (
        <button className={buttonClass} disabled={isLoading || disabled} {...props}>
            {content}
        </button>
    );
};
