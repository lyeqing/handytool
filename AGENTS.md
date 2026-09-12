<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## User UI preference
Use Material Design principles for future UI work: clear typographic hierarchy, distinct navigation and entity labels, layered surfaces with restrained elevation/shadows, recognizable icons with text labels, and accessible hover/focus/disabled states. Preserve responsive mobile layouts and the existing Sky/Slate/Emerald palette. Aim for polished, purposeful detail rather than flat, indistinguishable headings and cards.
## Tailwind CSS and Styling Rules

This project uses Tailwind CSS v4 as the primary styling system.

Follow these rules for all future frontend work:

- Prefer Tailwind utility classes directly in React/Next.js components.
- Use canonical Tailwind CSS v4 utility names instead of legacy aliases, such as `wrap-break-word` instead of `break-words` and `inset-shadow-sm` instead of `shadow-inner`. Verify equivalent styling when replacing older utilities.
- Do not create custom CSS classes merely to group normal Tailwind utilities.
- Do not recreate Tailwind design tokens using hard-coded CSS values when an equivalent Tailwind token exists.

For example, prefer:
```tsx
<div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
```

instead of:
```tsx
<div className="admin-card">
```

with:
```css
.admin-card {
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  background: white;
}
```

### Reusable UI

When the same group of styles and markup appears repeatedly, prefer extracting a reusable React component rather than creating a semantic CSS class.

Prefer:
```tsx
<AdminCard>...</AdminCard>
```

over:
```css
.admin-card { ... }
```

when the abstraction represents a reusable UI component.

Existing shared primitives such as buttons and form controls may remain shared abstractions when appropriate.

### Global CSS

Keep `globals.css` focused on genuinely global concerns, including:

- Tailwind imports
- `@theme` configuration
- fonts
- body defaults
- global focus styles
- global cursor behaviour
- accessibility behaviour
- browser-specific selectors
- selectors that are substantially clearer in CSS
- complex container-query rules when Tailwind would make them harder to understand

Do not place page-specific or admin-specific visual styling in `globals.css` unless there is a strong reason.

### Tailwind Tokens

Prefer Tailwind theme values over hard-coded CSS colours and measurements where practical.

Examples:
```text
#e2e8f0 -> border-slate-200
#64748b -> text-slate-500
#334155 -> text-slate-700
#0369a1 -> text-sky-700
#e0f2fe -> bg-sky-100
#bae6fd -> border-sky-200
#f0f9ff -> bg-sky-50
```

Use arbitrary Tailwind values only when the design genuinely requires a value that is not represented by the project's theme.

### State Styling

Prefer Tailwind variants for component state when they express the behaviour clearly.

Examples include:
```text
hover:
focus-visible:
disabled:
group-hover:
group-open:
peer:
aria-*:
data-*:
motion-reduce:
```

For example, for a `<details>` disclosure:
```tsx
<details className="group">
  <summary>...</summary>
  <ChevronDown className="transition-transform group-open:rotate-180 motion-reduce:transition-none" />
</details>
```

rather than introducing custom CSS solely for the open state.

### Fonts

The project's default font stack is:

- Geist for Latin/English text
- Noto Sans SC for Simplified Chinese
- Microsoft YaHei/system sans-serif as fallback
- Geist Mono for monospace text

Use the existing Tailwind `font-sans` and `font-mono` configuration instead of specifying font families directly in individual components.

### General Rule

Before adding a new CSS class, first ask:

1. Can normal Tailwind utilities express this cleanly?
2. Is this actually a reusable UI component that should be extracted?
3. Is this genuinely global or difficult to express using Tailwind?

Only create custom CSS when the third case applies or when it clearly improves maintainability.

When modifying existing code, preserve visual appearance, responsive behaviour, accessibility, reduced-motion behaviour, and functionality unless the task explicitly requires a design change.
