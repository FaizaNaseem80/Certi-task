import React from "react";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "text" | "gold";
  href?: string;
  className?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  href,
  className = "",
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  const variants = {
    primary:
      "bg-navy text-paper hover:bg-navy-dark shadow-sm hover:-translate-y-0.5 focus:ring-navy focus:ring-offset-paper",
    secondary:
      "bg-gold-light text-navy hover:bg-gold focus:ring-gold",
    gold:
      "bg-gold text-paper hover:bg-gold-light shadow-sm hover:-translate-y-0.5 focus:ring-gold focus:ring-offset-paper",
    outline:
      "border border-navy text-navy hover:bg-navy hover:text-paper focus:ring-navy focus:ring-offset-paper",
    text:
      "text-navy hover:bg-navy/5 focus:ring-navy/20",
  };

  const combinedStyles = `${baseStyles} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedStyles}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedStyles} {...props}>
      {children}
    </button>
  );
};
