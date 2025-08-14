# 🎓 React & Next.js Learning Guide

Welcome to the GreenSteps project! This guide will teach you the key React and Next.js concepts used throughout the codebase.

## 📚 Table of Contents

1. [React Fundamentals](#react-fundamentals)
2. [Next.js App Router](#nextjs-app-router)
3. [Components & Props](#components--props)
4. [Hooks & State Management](#hooks--state-management)
5. [Server Actions](#server-actions)
6. [TypeScript Integration](#typescript-integration)
7. [Styling with Tailwind CSS](#styling-with-tailwind-css)
8. [Form Handling](#form-handling)
9. [Error Handling](#error-handling)
10. [Best Practices](#best-practices)

---

## 🎯 React Fundamentals

### What is React?
React is a JavaScript library for building user interfaces. It lets you create reusable UI components.

### Key Concepts:

#### 1. **Components**
Components are the building blocks of React apps. They are functions that return JSX.

```jsx
// Simple component
function Welcome() {
  return <h1>Hello, World!</h1>;
}

// Component with props
function Greeting(props) {
  return <h1>Hello, {props.name}!</h1>;
}
```

#### 2. **JSX**
JSX is a syntax extension for JavaScript that looks like HTML.

```jsx
// JSX syntax
const element = <h1 className="title">Hello World</h1>;

// This gets transformed to:
const element = React.createElement('h1', {className: 'title'}, 'Hello World');
```

#### 3. **Props**
Props (properties) are how data flows from parent to child components.

```jsx
// Parent component
function App() {
  return <Greeting name="Alice" />;
}

// Child component receives props
function Greeting(props) {
  return <h1>Hello, {props.name}!</h1>;
}
```

---

## 🚀 Next.js App Router

### What is Next.js?
Next.js is a React framework that provides features like server-side rendering, routing, and API routes.

### App Router (Next.js 13+)
The App Router uses file-system based routing:

```
app/
├── page.tsx          # Route: /
├── quiz/
│   └── page.tsx      # Route: /quiz
└── layout.tsx        # Shared layout
```

### Key Concepts:

#### 1. **Server vs Client Components**
- **Server Components** (default): Run on the server, can't use hooks
- **Client Components**: Run in the browser, can use hooks and interactivity

```jsx
// Server Component (default)
export default function ServerComponent() {
  return <div>This runs on the server</div>;
}

// Client Component
"use client";
export default function ClientComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

#### 2. **File-based Routing**
Each `page.tsx` file becomes a route automatically.

---

## 🧩 Components & Props

### Custom Components
In our project, we create reusable components:

```jsx
// Fieldset component
function Fieldset(props: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-2 border p-4 rounded-md">
      <legend className="px-1 text-sm font-medium text-gray-600">
        {props.title}
      </legend>
      {props.children}
    </fieldset>
  );
}

// Usage
<Fieldset title="Diet">
  <Select name="diet" required>
    <option value="omnivore">Omnivore</option>
  </Select>
</Fieldset>
```

### Props Destructuring
A cleaner way to use props:

```jsx
// Instead of props.title, props.children
function Fieldset({ title, children }) {
  return (
    <fieldset>
      <legend>{title}</legend>
      {children}
    </fieldset>
  );
}
```

---

## 🪝 Hooks & State Management

### What are Hooks?
Hooks are functions that let you "hook into" React state and lifecycle features.

### useActionState Hook
A Next.js 13+ hook for managing form state with server actions:

```jsx
const [state, formAction, isPending] = useActionState(serverAction, initialState);
```

**Parameters:**
- `serverAction`: Function that runs on the server
- `initialState`: Starting state value

**Returns:**
- `state`: Current state (null, loading, success, error)
- `formAction`: Function to handle form submission
- `isPending`: Boolean indicating if form is being processed

### Other Common Hooks

#### useState
```jsx
const [count, setCount] = useState(0);
```

#### useEffect
```jsx
useEffect(() => {
  // Runs after component mounts
  console.log('Component mounted');
}, []); // Empty array = run only once
```

---

## 📡 Server Actions

### What are Server Actions?
Server Actions are Next.js 13+ features that let you run server code directly from React components.

### Creating Server Actions

```jsx
// app/actions.ts
"use server"; // This directive is required

export async function myServerAction(formData: FormData) {
  // This code runs on the server
  const data = Object.fromEntries(formData);
  // Process data...
  return { success: true };
}
```

### Using Server Actions

```jsx
// In your component
import { myServerAction } from './actions';

function MyForm() {
  return (
    <form action={myServerAction}>
      <input name="email" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## 📝 TypeScript Integration

### Why TypeScript?
TypeScript adds static type checking to JavaScript, catching errors before runtime.

### Basic Types

```typescript
// Primitive types
let name: string = "Alice";
let age: number = 30;
let isActive: boolean = true;

// Array types
let numbers: number[] = [1, 2, 3];
let names: string[] = ["Alice", "Bob"];

// Object types
interface User {
  name: string;
  age: number;
}

let user: User = { name: "Alice", age: 30 };
```

### Union Types
```typescript
type Status = "loading" | "success" | "error";
let status: Status = "loading";
```

### Generic Types
```typescript
function useState<T>(initial: T): [T, (value: T) => void] {
  // Implementation
}
```

---

## 🎨 Styling with Tailwind CSS

### What is Tailwind CSS?
Tailwind CSS is a utility-first CSS framework that lets you style components using pre-defined classes.

### Basic Classes

```jsx
// Spacing
<div className="p-4">Padding on all sides</div>
<div className="m-2">Margin on all sides</div>
<div className="space-y-4">Vertical spacing between children</div>

// Colors
<div className="bg-blue-500 text-white">Blue background, white text</div>
<div className="text-gray-600">Gray text</div>

// Typography
<h1 className="text-2xl font-bold">Large bold heading</h1>
<p className="text-sm">Small text</p>

// Layout
<div className="flex items-center justify-between">Flexbox layout</div>
<div className="grid grid-cols-2 gap-4">Grid layout</div>
```

### Conditional Classes
```jsx
<div className={`base-class ${isActive ? 'active-class' : 'inactive-class'}`}>
  Content
</div>
```

---

## 📋 Form Handling

### HTML Forms with React
```jsx
function MyForm() {
  return (
    <form action={serverAction}>
      <input name="email" type="email" required />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Form Validation
```jsx
// Using Zod for validation
const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18)
});

const result = schema.safeParse(data);
if (!result.success) {
  // Handle validation errors
}
```

### Controlled vs Uncontrolled Components

**Uncontrolled (HTML forms):**
```jsx
<input name="email" defaultValue="user@example.com" />
```

**Controlled (React state):**
```jsx
const [email, setEmail] = useState("");
<input value={email} onChange={(e) => setEmail(e.target.value)} />
```

---

## 🛡️ Error Handling

### Try-Catch Blocks
```jsx
try {
  const result = await riskyOperation();
  // Handle success
} catch (error) {
  // Handle error
  console.error('Something went wrong:', error);
}
```

### Error Boundaries
```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

### Conditional Rendering
```jsx
{error && <div className="error">Error: {error.message}</div>}
{isLoading && <div>Loading...</div>}
{data && <div>{data}</div>}
```

---

## ✅ Best Practices

### 1. **Component Structure**
```jsx
// Good: Clear, focused components
function UserProfile({ user }) {
  return (
    <div className="user-profile">
      <UserAvatar user={user} />
      <UserInfo user={user} />
    </div>
  );
}
```

### 2. **Props Validation**
```jsx
// Use TypeScript for prop validation
interface UserProfileProps {
  user: {
    name: string;
    email: string;
  };
}

function UserProfile({ user }: UserProfileProps) {
  return <div>{user.name}</div>;
}
```

### 3. **State Management**
```jsx
// Keep state as close to where it's used as possible
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### 4. **Performance**
```jsx
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  return <div>{/* Expensive rendering */}</div>;
});
```

### 5. **Accessibility**
```jsx
// Always include proper labels and ARIA attributes
<label htmlFor="email">Email:</label>
<input id="email" name="email" aria-describedby="email-help" />
<div id="email-help">Enter your email address</div>
```

---

## 🎯 Practice Exercises

1. **Create a simple counter component**
2. **Build a todo list with add/remove functionality**
3. **Create a form with validation**
4. **Build a component that fetches and displays data**
5. **Create a reusable button component**

---

## 📖 Additional Resources

- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 🤔 Common Questions

**Q: When should I use "use client"?**
A: Use "use client" when you need to use hooks, event handlers, or browser APIs.

**Q: What's the difference between useState and useActionState?**
A: useState is for local component state, useActionState is for form state with server actions.

**Q: How do I choose between server and client components?**
A: Start with server components (default), then add "use client" only when you need interactivity.

**Q: What's the benefit of TypeScript?**
A: TypeScript catches errors at compile time, provides better IDE support, and makes code more maintainable.

---

Happy coding! 🚀
