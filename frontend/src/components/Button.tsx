
import { twMerge } from "tailwind-merge";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { buttonStyles } from "./buttonSyle";


type ButtonProps = VariantProps<typeof buttonStyles> & ComponentProps<"button">

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={twMerge(buttonStyles({ variant, size }), className)}
    />
  )
}