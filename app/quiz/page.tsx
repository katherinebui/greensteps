/**
 * 📝 QUIZ PAGE COMPONENT
 * 
 * This is a more complex React component that demonstrates:
 * - React Hooks (useActionState)
 * - Custom Components
 * - Form Handling
 * - Conditional Rendering
 * - State Management
 * - Server Actions (Next.js 13+ feature)
 */

"use client"; // 🚨 CLIENT COMPONENT: This tells Next.js to run this component in the browser
// Without this, the component would be server-side only and couldn't use hooks

import { useActionState } from "react"; // 🪝 REACT HOOK: For managing form state and server actions
import { processQuizAction, type ProcessQuizResult } from "@/app/actions"; // 📡 SERVER ACTION: Function that runs on the server
import { cn } from "@/lib/utils"; // 🛠️ UTILITY: Combines CSS classes

/**
 * 🧩 CUSTOM COMPONENT: Fieldset
 * 
 * This is a reusable component that wraps form fields in a styled container.
 * Props are like parameters that get passed to components.
 */
function Fieldset(props: { title: string; children: React.ReactNode }) {
  // 📋 PROPS: The way data flows from parent to child components
  // - title: string - the fieldset title
  // - children: React.ReactNode - any content placed between opening and closing tags
  
  return (
    <fieldset className="space-y-1 border-2 border-pastel-green p-2 rounded-md bg-white/60 backdrop-blur-sm">
      <legend className="px-1 text-xs font-semibold text-forest-green bg-white rounded shadow-sm">
        {props.title}
      </legend>
      {props.children} {/* 🎭 CHILDREN: Renders whatever content is passed between the component tags */}
    </fieldset>
  );
}

/**
 * 🧩 CUSTOM COMPONENT: Input
 * 
 * A styled input component that extends HTML input attributes.
 * The {...props} spreads all HTML input properties (type, name, required, etc.)
 */
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      {...props} // 🔄 SPREAD OPERATOR: Copies all properties from props object
      className={cn(
        "w-full rounded-md border-2 border-pastel-green px-2 py-1 bg-white/80 focus:border-sage-green focus:ring-2 focus:ring-sage-green/20 focus:outline-none transition-all duration-200 text-xs text-forest-green placeholder-forest-green/60",
        props.className
      )} // 🎨 cn() merges CSS classes with our green theme
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select 
      {...props} 
      className={cn(
        "w-full rounded-md border-2 border-pastel-green px-2 py-1 bg-white/80 focus:border-sage-green focus:ring-2 focus:ring-sage-green/20 focus:outline-none transition-all duration-200 text-xs text-forest-green",
        props.className
      )} 
    />
  );
}

/**
 * 🎯 MAIN QUIZ PAGE COMPONENT
 */
export default function QuizPage() {
  // 🪝 useActionState HOOK: Manages form state and server communication
  // This is a Next.js 13+ feature that combines form state with server actions
  const [state, formAction, isPending] = useActionState<ProcessQuizResult | null, FormData>(
    processQuizAction, // 🖥️ SERVER ACTION: Function that runs on the server when form is submitted
    null // 🏁 INITIAL STATE: Starting value for state
  );
  
  // 📊 HOOK RETURN VALUES:
  // - state: Current form state (null, loading, success, or error)
  // - formAction: Function to handle form submission
  // - isPending: Boolean indicating if form is being processed

  return (
    <div className="h-full w-full bg-gradient-to-br from-pastel-green to-mint-green p-2 flex items-center justify-center">
      <div className="w-full max-w-sm mx-auto space-y-2">
        <div className="text-center">
          <h1 className="text-lg font-bold text-forest-green mb-1">
            🌱 Lifestyle Quiz
          </h1>
          <p className="text-xs text-forest-green">
            Help us understand your lifestyle to calculate your carbon footprint
          </p>
        </div>
        
        {/* 📋 FORM ELEMENT: HTML form with React enhancements */}
        <form action={formAction} className="space-y-2">
          {/* 🍽️ DIET SECTION */}
          <Fieldset title="🍽️ Diet">
            {/* 🎯 CUSTOM COMPONENT USAGE: Using our Fieldset component */}
            <Select name="diet" required defaultValue="omnivore">
              {/* 📝 OPTION ELEMENTS: Each option represents a possible value */}
              <option value="omnivore">Omnivore</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="pescatarian">Pescatarian</option>
            </Select>
          </Fieldset>

          {/* 🚗 TRANSPORT SECTION */}
          <Fieldset title="🚗 Transport">
            <Select name="transportMode" required defaultValue="mixed">
              <option value="car">Mostly car</option>
              <option value="public_transit">Public transit</option>
              <option value="bike_walk">Bike/Walk</option>
              <option value="mixed">Mixed</option>
            </Select>
            <label className="block text-xs font-medium text-forest-green mt-1">Weekly miles driven</label>
            <Input 
              name="weeklyMilesDriven" 
              type="number" 
              min={0} 
              step={1} 
              defaultValue={50} 
              required 
            />
          </Fieldset>

          {/* ⚡ HOME ENERGY SECTION */}
          <Fieldset title="⚡ Home Energy">
            <label className="block text-xs font-medium text-forest-green">Electricity (kWh/month)</label>
            <Input 
              name="electricityKwhPerMonth" 
              type="number" 
              min={0} 
              step={1} 
              defaultValue={400} 
              required 
            />
            <label className="block text-xs font-medium text-forest-green mt-1">Heating</label>
            <Select name="homeHeating" required defaultValue="electric">
              <option value="gas">Gas</option>
              <option value="electric">Electric</option>
              <option value="heat_pump">Heat pump</option>
              <option value="other">Other</option>
            </Select>
          </Fieldset>

          {/* ✈️ FLIGHTS & WASTE SECTION */}
          <Fieldset title="✈️ Flights & Waste">
            <label className="block text-xs font-medium text-forest-green">Short-haul flights per year</label>
            <Input 
              name="flightsShortHaulPerYear" 
              type="number" 
              min={0} 
              step={1} 
              defaultValue={0} 
              required 
            />
            <label className="block text-xs font-medium text-forest-green mt-1">Recycling habit</label>
            <Select name="recyclingHabit" required defaultValue="often">
              <option value="rarely">Rarely</option>
              <option value="sometimes">Sometimes</option>
              <option value="often">Often</option>
              <option value="always">Always</option>
            </Select>
          </Fieldset>

          {/* 🚀 SUBMIT BUTTON */}
          <div className="text-center pt-1">
            <button
              type="submit"
              disabled={isPending} // 🔒 DISABLED STATE: Button is disabled while form is processing
              className="inline-flex items-center justify-center rounded-lg bg-sage-green px-4 py-2 text-white font-semibold text-sm shadow-lg hover:bg-sage-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {/* 🔄 CONDITIONAL TEXT: Shows different text based on loading state */}
              {isPending ? "🌱 Calculating..." : "🌿 Get Results"}
            </button>
          </div>
        </form>

        {/* ❌ ERROR MESSAGE: Conditional rendering when form submission fails */}
        {state?.ok === false && (
          <div className="rounded-md bg-red-50 border-2 border-red-200 p-2 text-red-700 text-xs">
            <h3 className="font-semibold mb-1">⚠️ Error</h3>
            <p>There was an error with your input. Please check your answers and try again.</p>
          </div>
        )}

        {/* ✅ SUCCESS RESULTS: Conditional rendering when form submission succeeds */}
        {state?.ok && (
          <div className="space-y-2 rounded-md border-2 border-pastel-green p-3 bg-white/80 backdrop-blur-sm">
            <h2 className="text-base font-bold text-forest-green text-center">
              🌍 Your Carbon Footprint
            </h2>
            
            {/* 🔍 CONDITIONAL RENDERING: Shows different content based on data availability */}
            {state.data.estimate ? (
              <>
                <div className="text-center">
                  <p className="text-xs text-forest-green mb-1">Estimated annual footprint:</p>
                  <p className="text-xl font-bold text-sage-green">
                    {state.data.estimate.kg.toLocaleString()} kg CO₂e
                  </p>
                </div>
                
                {/* 📊 BREAKDOWN GRID: Maps over object entries to create a grid */}
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(state.data.estimate.breakdown).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between rounded bg-pastel-green px-2 py-1 border border-mint-green">
                      <span className="font-medium text-forest-green capitalize text-xs">{k}</span>
                      <span className="font-semibold text-sage-green text-xs">{Math.round(v).toLocaleString()} kg</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center p-2 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-yellow-800 text-xs">
                  Could not retrieve carbon estimate. Showing tips only.
                </p>
              </div>
            )}
            
            {/* 🤖 AI TIPS SECTION */}
            <div className="mt-2 p-2 bg-accent rounded border border-pastel-green">
              <h3 className="text-xs font-semibold text-sage-green mb-1 flex items-center">
                💡 AI-Powered Tips
              </h3>
              <div className="prose prose-green max-w-none">
                <pre className="whitespace-pre-wrap text-sage-green leading-relaxed text-xs">
                  {state.data.tips}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

