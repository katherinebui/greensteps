/**
 * 🛠️ UTILITY FUNCTIONS
 * 
 * This file contains helper functions that are used throughout the app.
 * Utility functions are small, reusable pieces of code that don't contain
 * business logic but help with common tasks.
 * 
 * Key Concepts:
 * - Utility Functions: Reusable helper functions
 * - CSS Class Management: Combining and merging CSS classes
 * - TypeScript: Type safety for function parameters
 */

import { type ClassValue } from "clsx"; // 📋 TYPE: TypeScript type for CSS class values
import clsx from "clsx"; // 🎨 CLSX: Library for conditionally joining CSS classes
import { twMerge } from "tailwind-merge"; // 🔄 TAILWIND MERGE: Merges Tailwind classes intelligently

/**
 * 🎨 CSS CLASS UTILITY: cn (className)
 * 
 * This is a utility function that combines multiple CSS classes intelligently.
 * It's commonly used in React components to conditionally apply styles.
 * 
 * Usage examples:
 * - cn("base-class", "another-class") → "base-class another-class"
 * - cn("text-red-500", "text-blue-500") → "text-blue-500" (latter wins)
 * - cn("px-4", "px-6") → "px-6" (latter wins)
 * - cn("base", condition && "conditional") → "base conditional" or "base"
 * 
 * Parameters:
 * - ...inputs: Rest parameter that accepts any number of CSS class values
 * 
 * Returns:
 * - string: Merged CSS class string
 */
export function cn(...inputs: ClassValue[]) {
  // 🔄 PROCESSING STEPS:
  // 1. clsx(inputs) - Combines all inputs into a single string
  // 2. twMerge() - Intelligently merges Tailwind classes (latter wins)
  return twMerge(clsx(inputs));
}

