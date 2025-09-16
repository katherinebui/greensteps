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

import { useActionState, useEffect, useRef } from "react"; // 🪝 REACT HOOKS: For managing form state, effects, and refs
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
        "w-full rounded-md border-2 border-pastel-green px-2 py-1 bg-pastel-green/80 focus:border-sage-green focus:ring-2 focus:ring-sage-green/30 focus:outline-none transition-all duration-200 text-xs text-forest-green placeholder-forest-green/60",
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

  const formRef = useRef<HTMLFormElement>(null);

  // Reset dropdowns to placeholder after any submission completes
  useEffect(() => {
    if (state !== null && !isPending) {
      formRef.current?.reset();
    }
  }, [state, isPending]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pastel-green to-mint-green p-2 flex items-center justify-center">
      <div className={cn("w-full max-w-3xl mx-auto grid gap-2", state?.ok ? "md:grid-cols-2 grid-cols-1" : "grid-cols-1 justify-items-center")}> 
        {/* LEFT: Quiz panel */}
        <div className={cn("space-y-2 rounded-md border-2 border-pastel-green p-3 bg-white backdrop-blur-sm w-full", state?.ok ? "" : "max-w-sm")}> 
          <div className="text-center">
            <h1 className="text-lg font-bold text-forest-green mb-1">
              🌱 Lifestyle Quiz
            </h1>
            <p className="text-xs text-forest-green">
              Help us understand your lifestyle to calculate your carbon footprint
            </p>
          </div>

          {/* 📋 FORM ELEMENT: HTML form with React enhancements */}
          <form ref={formRef} action={formAction} className="space-y-2" noValidate>
          {/* 🍽️ DIET SECTION */}
          <Fieldset title="🍽️ Diet">
            {/* 🎯 CUSTOM COMPONENT USAGE: Using our Fieldset component */}
            <label htmlFor="diet" className="sr-only">Diet</label>
            <Select id="diet" name="diet" required defaultValue="">
              <option value="" disabled hidden aria-hidden="true">Choose your diet</option>
              {/* 📝 OPTION ELEMENTS: Each option represents a possible value */}
              <option value="omnivore">Omnivore</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="pescatarian">Pescatarian</option>
            </Select>
          </Fieldset>

          {/* 🚗 TRANSPORT SECTION */}
          <Fieldset title="🚗 Transport">
            <label htmlFor="transportMode" className="sr-only">Transport mode</label>
            <Select id="transportMode" name="transportMode" required defaultValue="">
              <option value="" disabled hidden aria-hidden="true">Choose your main transport</option>
              <option value="car">Mostly car</option>
              <option value="public_transit">Public transit</option>
              <option value="bike_walk">Bike/Walk</option>
              <option value="mixed">Mixed</option>
            </Select>
            <label className="block text-xs font-medium text-forest-green mt-1">Weekly miles driven</label>
            <Input 
              id="weeklyMilesDriven"
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
              id="electricityKwhPerMonth"
              name="electricityKwhPerMonth" 
              type="number" 
              min={0} 
              step={1} 
              defaultValue={400} 
              required 
            />
            <label className="block text-xs font-medium text-forest-green mt-1">Heating</label>
            <label htmlFor="homeHeating" className="sr-only">Home heating</label>
            <Select id="homeHeating" name="homeHeating" required defaultValue="">
              <option value="" disabled hidden aria-hidden="true">Choose your heating</option>
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
              id="flightsShortHaulPerYear"
              name="flightsShortHaulPerYear" 
              type="number" 
              min={0} 
              step={1} 
              defaultValue={0} 
              required 
            />
            <label className="block text-xs font-medium text-forest-green mt-1">Recycling habit</label>
            <label htmlFor="recyclingHabit" className="sr-only">Recycling habit</label>
            <Select id="recyclingHabit" name="recyclingHabit" required defaultValue="">
              <option value="" disabled hidden aria-hidden="true">Choose your recycling habit</option>
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
            <div className="rounded-md bg-red-50 border-2 border-red-200 p-2 text-red-700 text-xs" role="alert" aria-live="polite">
              <h3 className="font-semibold mb-1">⚠️ Error</h3>
              <p>There was an error with your input. Please check your answers and try again.</p>
            </div>
          )}
        </div>

        {/* RIGHT: Results panel */}
        {state?.ok && (
        <div className="space-y-2 rounded-md border-2 border-pastel-green p-3 bg-white backdrop-blur-sm" aria-live="polite">
          <h2 className="text-base font-bold text-forest-green text-center">
            🌍 Your Carbon Footprint
          </h2>

          <>
              {/* User selections summary */}
              <div className="text-xs text-forest-green bg-pastel-green/60 rounded border border-pastel-green p-2">
                <h3 className="font-semibold mb-1">Your selections</h3>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Diet: <span className="font-medium">{state.data.quiz.diet}</span></li>
                  <li>Transport: <span className="font-medium">{state.data.quiz.transportMode}</span>; weekly miles: <span className="font-medium">{state.data.quiz.weeklyMilesDriven}</span></li>
                  <li>Electricity: <span className="font-medium">{state.data.quiz.electricityKwhPerMonth}</span> kWh/month; Heating: <span className="font-medium">{state.data.quiz.homeHeating}</span></li>
                  <li>Flights (short‑haul/yr): <span className="font-medium">{state.data.quiz.flightsShortHaulPerYear}</span></li>
                  <li>Recycling: <span className="font-medium">{state.data.quiz.recyclingHabit}</span></li>
                </ul>
              </div>

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
          </>
        </div>
        )}
      </div>
    </div>
  );
}

