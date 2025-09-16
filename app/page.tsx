/**
 * 🏠 HOME PAGE COMPONENT
 * 
 * 
 * Key React/Next.js Concepts:
 * - export default: Makes this the main component for this route
 * - JSX: The HTML-like syntax inside the return statement
 * - className: React's way of setting CSS classes (instead of "class")
 * - Tailwind CSS: The utility classes like "space-y-4", "text-xl", etc.
 */

export default function Home() {
  // 🎯 REACT COMPONENT: A function that returns JSX
  // This function gets called every time the component needs to render
  
  return (
    // 📦 JSX: JavaScript XML - allows us to write HTML-like code in JavaScript
    // The return statement must contain exactly one parent element
    <div className="min-h-screen w-full bg-gradient-to-br from-pastel-green to-mint-green flex items-center justify-center p-2 sm:p-4">
      {/* 🎨 TAILWIND CSS CLASSES:
          - h-full w-full: Makes the container full height and width
          - bg-gradient-to-br: Creates a gradient background from top-left to bottom-right
          - from-pastel-green to-mint-green: Uses our custom green pastel colors
          - flex items-center justify-center: Centers content both vertically and horizontally
          - p-2 sm:p-4: Responsive padding - smaller on mobile, larger on desktop */}
      
      <div className="w-full max-w-xs sm:max-w-sm mx-auto text-center space-y-2 sm:space-y-3">
        <h1 className="text-xl sm:text-2xl font-bold text-sage-green">
          🌱 Welcome to GreenSteps
        </h1>
        
        {/* 📝 PARAGRAPH: Regular HTML element with Tailwind styling */}
        <p className="text-xs sm:text-sm text-sage-green leading-relaxed px-1">
          Take a quick lifestyle quiz to estimate your carbon footprint and get AI-powered tips for a more sustainable future.
        </p>
        
        {/* 🔗 ANCHOR TAG: Links to another page in our app
            - href="/quiz": Next.js will handle this as a client-side navigation
            - className: Multiple Tailwind classes for styling with our green theme
            - hover:bg-sage-green: Changes background color on hover to darker sage green */}
        <a 
          href="/quiz" 
          className="inline-flex items-center justify-center rounded-lg bg-sage-green px-3 sm:px-4 py-2 text-white font-semibold text-xs sm:text-sm shadow-lg hover:bg-sage-green/90 transition-all duration-300 transform hover:scale-105"
        >
          🌿 Start the Quiz
        </a>
        
        {/* 🌍 Additional info section */}
        <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-white rounded-lg border border-pastel-green">
          <h2 className="text-xs sm:text-sm font-semibold text-forest-green mb-1">
            🌍 Why Calculate Your Footprint?
          </h2>
          <p className="text-xs text-forest-green">
            Understanding your environmental impact is the first step toward making positive changes. 
            Our AI-powered recommendations help you reduce your carbon footprint with personalized, 
            actionable advice.
          </p>
        </div>
      </div>
    </div>
  );
}
