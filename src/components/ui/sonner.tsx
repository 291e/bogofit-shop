"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast !bg-white !text-gray-900 !border-2 !shadow-2xl !font-medium !font-sans !text-base",
          description: "!text-gray-600 !font-normal !mt-1 !font-sans !text-sm",
          actionButton: "!bg-blue-600 !text-white hover:!bg-blue-700 !font-sans !text-sm",
          cancelButton: "!bg-gray-200 !text-gray-700 hover:!bg-gray-300 !font-sans !text-sm",
          success: "!bg-green-100 !text-green-950 !border-green-300 !font-sans !text-base",
          error: "!bg-red-100 !text-red-950 !border-red-300 !font-sans !text-base", 
          warning: "!bg-yellow-100 !text-yellow-950 !border-yellow-300 !font-sans !text-base",
          info: "!bg-blue-100 !text-blue-950 !border-blue-300 !font-sans !text-base",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
