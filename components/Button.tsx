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
    "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold tracking-wide transition-all duration-300 focus:outline-hidden focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  const variants = {
    primary:
      "bg-navy text-paper hover:bg-navy-dark shadow-sm hover:shadow-md focus:ring-navy focus:ring-offset-paper",
    secondary:
      "bg-gold-light text-navy hover:bg-opacity-90 focus:ring-gold",
    gold:
      "bg-gold text-paper hover:bg-opacity-90 shadow-sm hover:shadow-md focus:ring-gold focus:ring-offset-paper",
    outline:
      "border-2 border-navy text-navy hover:bg-navy hover:text-paper focus:ring-navy focus:ring-offset-paper",
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
