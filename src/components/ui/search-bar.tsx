"use client";

import { ChangeEvent } from "react";
import { InputHTMLAttributes } from "react";

interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = "Tìm kiếm...", className = "", ...props }: SearchBarProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`border rounded px-3 py-2 text-sm focus:outline-none focus:ring ${className}`}
      {...props}
    />
  );
}
