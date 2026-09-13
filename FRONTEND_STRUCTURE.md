# Frontend file organisation

This guide describes the frontend at `D:\pra\handytool`. It covers the current code and recommended placement of future frontend files. It does not describe the backend's internal structure.

The project uses Next.js App Router, React, TypeScript, Tailwind CSS v4, and English/Simplified Chinese localisation. Zustand 5 is installed, but no Zustand stores or provider have been introduced.

## 1. Directory map

```text
handytool/
|-- AGENTS.md                    Project rules for coding agents
|-- CLAUDE.md                    References AGENTS.md
|-- FRONTEND_STRUCTURE.md        This guide
|-- README.md                    Original Next.js starter instructions
|-- package.json                 Dependencies and npm scripts
|-- package-lock.json            Resolved dependency versions
|-- next.config.ts               Next.js options and development API rewrite
|-- tsconfig.json                TypeScript options and @/ import alias
|-- eslint.config.mjs            Next.js/TypeScript lint configuration
|-- postcss.config.mjs           Tailwind PostCSS integration
|-- .gitignore                   Generated/private file exclusions
|-- public/                     Static SVG assets
|-- src/
|   |-- proxy.ts                Locale URL redirect handling
|   |-- app/
|   |   |-- favicon.ico         Site icon
|   |   |-- globals.css         Tailwind, fonts, global rules, shared primitives
|   |   |-- [lang]/
|   |       |-- layout.tsx      Root HTML shell, fonts, header/footer, tracking
|   |       |-- page.tsx        Homepage
|   |       |-- login/
|   |       |-- register/
|   |       |-- admin/
|   |       |   |-- layout.tsx
|   |       |   |-- page.tsx
|   |       |   |-- actions.ts
|   |       |   |-- users/page.tsx
|   |       |   |-- companies/page.tsx
|   |       |   |-- categories/page.tsx
|   |       |-- schemas/
|   |       |   |-- new/
|   |       |   |-- [id]/records/new/
|   |       |-- records/[id]/page.tsx
|   |-- components/
|   |   |-- admin/
|   |   |-- home/
|   |   |-- i18n/
|   |   |-- tracking/
|   |-- i18n/
|   |   |-- config.ts
|   |   |-- get-dictionary.ts
|   |   |-- home-copy.ts
|   |   |-- admin-copy.ts
|   |   |-- registration-copy.ts
|   |   |-- dictionaries/
|   |       |-- en.json
|   |       |-- zh-Hans.json
|   |-- lib/
|       |-- handytool-api.ts
|       |-- handytool-types.ts
|       |-- home-types.ts
|       |-- admin-types.ts
|       |-- registration-types.ts
|       |-- schema-draft.ts
|       |-- tracking.ts
```

The tree omits generated dependency/build contents. Route-specific files are detailed below. There is currently no `src/stores/` directory.

## 2. Routes and page-owned files

`src/app/` owns URL routing. `[lang]` is a dynamic language segment, such as `en` or `zh-Hans`. `[id]` is a dynamic schema or record identifier, depending on its position in the route.

| File under src/app/[lang]/ | Responsibility |
| --- | --- |
| `layout.tsx` | Root HTML/body, locale, site metadata, font variables, shared header/footer, analytics component. |
| `page.tsx` | Homepage and its query-driven content. |
| `login/page.tsx` | Sign-in page. |
| `login/actions.ts` | Server-side sign-in/sign-out handling and redirects. |
| `register/page.tsx` | Registration page composition. |
| `register/registration-form.tsx` | Interactive registration fields and submission feedback. |
| `register/actions.ts` | Registration submission and validation handling. |
| `admin/layout.tsx` | Current-user check, super-admin access UI, admin shell/navigation, admin metadata. |
| `admin/page.tsx` | Redirects the admin index to the users page. |
| `admin/actions.ts` | Shared admin save/delete server actions. |
| `admin/users/page.tsx` | User listing, filters, pagination, and edit cards. |
| `admin/companies/page.tsx` | Company listing and edit cards. |
| `admin/categories/page.tsx` | Master/subcategory listing, creation, editing, and deletion UI. |
| `schemas/new/page.tsx` | New-schema page composition. |
| `schemas/new/schema-builder.tsx` | Interactive schema draft editor. |
| `schemas/new/actions.ts` | Converts/submits the draft and handles API validation or redirects. |
| `schemas/[id]/records/new/page.tsx` | Loads the schema needed to create a record. |
| `schemas/[id]/records/new/record-form.tsx` | Renders inputs for the schema's field types. |
| `schemas/[id]/records/new/actions.ts` | Record-creation submission handling. |
| `records/[id]/page.tsx` | Record details and field values. |

Examples of existing URLs are `/en/admin/users`, `/zh-Hans/register`, and `/en/schemas/123/records/new`.

### Placement rule

Keep a component beside its page when only that page uses it. This is why `schema-builder.tsx` and `registration-form.tsx` live in their route folders.

Move reusable UI into `src/components/<feature>/` when several pages need it. Do not move every component into one large shared folder.

`page.tsx` and `layout.tsx` have routing significance. Names such as `actions.ts` and `schema-builder.tsx` organise code; they do not create routes themselves.

## 3. Shared components

| File under src/components/ | Responsibility |
| --- | --- |
| `home/chrome.tsx` | Exports SiteHeader and SiteFooter; the header loads the current user. |
| `home/account-menu.tsx` | Account dropdown, local open/closed state, outside-click handling, keyboard/focus behaviour, sign-out form. |
| `home/category-nav.tsx` | Category navigation shared with the homepage. |
| `admin/admin-nav.tsx` | Admin navigation with route-aware selection. |
| `admin/admin-forms.tsx` | AdminForm for users/companies/categories and DeleteCategoryForm. |
| `admin/admin-ui.tsx` | AdminCard, AdminCardHeading, AdminBadge, AdminTextLink, AdminAccountMeta, AdminDisclosureSummary. |
| `i18n/language-switcher.tsx` | Language selection, locale cookie, and language navigation. |
| `tracking/analytics-provider.tsx` | Browser lifecycle/page tracking; renders no visible interface. |

The name “provider” in AnalyticsProvider does not mean it is a global application-state provider.

Shared visual components should own repeated markup and Tailwind utilities. Pages supply content and feature-specific behaviour. Preserve semantic elements and accessibility attributes when extracting components.

## 4. Server and browser responsibilities

The project separates server data access from browser interaction.

- Pages/layouts without a client boundary can load data on the Next.js server.
- Files marked `"use client"` provide interactive behaviour and React hooks.
- Files marked `"use server"` expose server actions for submissions.
- `src/lib/handytool-api.ts` and `src/i18n/get-dictionary.ts` explicitly import `server-only`.
- A Client Component can still participate in initial server rendering. Avoid reading browser-only storage during rendering without a suitable lifecycle strategy.

Typical read flow:

```text
Request URL
  -> src/proxy.ts resolves a locale-prefixed URL
  -> route layout/page
  -> src/lib/handytool-api.ts
  -> backend response
  -> page passes data to presentation/interactive components
```

Typical submission flow:

```text
Interactive form
  -> route-owned or shared admin server action
  -> frontend API client
  -> backend response
  -> validation feedback, refreshed content, or redirect
```

Do not import the server-only API client into browser components. Authentication and authoritative data remain in the existing server/API flow. Frontend access checks improve the UI; they do not replace backend authorisation.

## 5. API access, types, and helpers

| File under src/lib/ | Responsibility |
| --- | --- |
| `handytool-api.ts` | Server-side HTTP client and endpoint functions for home, authentication, registration, schemas, records, and administration. |
| `handytool-types.ts` | Schema/field/record types, validation types, and field-setting helpers. |
| `home-types.ts` | Homepage categories, records, and response structures. |
| `admin-types.ts` | Admin section, row, page, and plan types. |
| `registration-types.ts` | Registration request payload type. |
| `schema-draft.ts` | Editable schema draft structures, defaults, and conversion into API payloads. |
| `tracking.ts` | Browser tracking transport, heartbeat configuration retrieval, and active-time accounting. |

The API client uses `HANDYTOOL_API_URL`, defaulting to `http://localhost:5292`. Its request helper forwards relevant cookies, uses `cache: "no-store"`, and returns a typed success/failure result. Mutation responses can relay cookies.

Browser tracking instead sends relative `/api/...` requests. It does not read HttpOnly session/visitor tokens into JavaScript.

Keep feature types near their existing related type file. This project currently uses `src/lib/*-types.ts`; a separate global `src/types/` folder has not been introduced.

Use `import type` for type-only dependencies. Keep pure conversion helpers independent of UI where practical.

## 6. Languages and translated copy

There are two existing translation mechanisms:

1. JSON dictionaries in `src/i18n/dictionaries/`, loaded through the server-only `get-dictionary.ts`.
2. Feature copy modules: `home-copy.ts`, `admin-copy.ts`, and `registration-copy.ts`.

When changing a screen, follow the translation mechanism it already uses and update both languages.

`config.ts` defines supported locales, the default locale, display names, locale-cookie name, and Accept-Language matching. `src/proxy.ts` redirects unprefixed page URLs using the remembered locale or browser language. API and framework/static requests are excluded by its checks.

For a Client Component, pass translated strings from its server parent or use the existing client-compatible feature copy module. Do not import the server-only dictionary loader into it.

A new language requires coordinated updates to locale configuration and translations. The config comments also note that supported locale codes must stay aligned with the API.

## 7. Styling and fonts

### Tailwind v4

Use utilities directly in JSX. Canonical names include `wrap-break-word` and `inset-shadow-sm`. Use theme colours such as Slate, Sky, and Emerald where equivalent tokens exist.

`src/app/globals.css` currently owns:

- Tailwind import and custom dark variant.
- Inline font theme configuration.
- Body defaults.
- Global focus-visible rules.
- Interactive and disabled cursor rules.
- Shared `.btn-primary`, `.btn-secondary`, and `.form-input` primitives.

Admin-specific visual classes and the old `.admin-card-actions` selector are no longer present. Repeated admin presentation is in `admin-ui.tsx`.

### Responsive forms

AdminCard declares a Tailwind query container. AdminForm's `inCard` option enables a one-column card form that switches to two columns only when both the viewport's `sm` breakpoint and a container width greater than 30rem apply.

At exactly 30rem, card forms remain one column. The button row follows the same condition. Creation forms without `inCard` retain their viewport-based layout.

Keep the exact boundary when modifying these classes. A superficially similar max-width variant can treat the endpoint differently.

### Fonts

`src/app/[lang]/layout.tsx` loads Geist, Geist Mono, and Noto Sans SC through `next/font/google`. Their variable classes are applied to the root HTML element.

The sans-serif stack in `globals.css` is Geist, Noto Sans SC, Microsoft YaHei, then system sans-serif. Monospace uses Geist Mono. Noto Sans SC currently has preloading disabled.

Use the configured `font-sans` and `font-mono` utilities where needed. Keep the existing colours, font choices, reduced-motion behaviour, and focus styling when adding features.

## 8. State management and Zustand

### Current implementation

Zustand is installed at the `^5.0.15` dependency range. There is no Zustand store, slice, persistence middleware, or provider in the application yet.

The current state remains appropriate to its owner:

| State | Current location/approach |
| --- | --- |
| Account menu open/closed | Local React state in AccountMenu. |
| Registration company option | Local React state in the registration form. |
| Schema editor draft | Local React state in schema-builder.tsx. |
| Individual interactive field values | Local state in relevant form controls. |
| Submission status and errors | Server actions and useActionState where used. |
| Shareable filters and pagination | URL query parameters handled by pages. |
| Current user and authentication | Server/API requests and cookies. |

Installing Zustand does not automatically change any of these flows.

### Future placement recommendation

Introduce Zustand when multiple components need to read and update the same client state. Keep single-component state local, and keep shareable navigation state in the URL where appropriate.

When an actual feature requires it, a possible structure is:

```text
src/stores/                     FUTURE ONLY: not currently present
  types.ts                      Shared store contracts, if needed
  store.ts                      Store factory/composition
  uiSlice.ts                    A real shared UI concern
  store-provider.tsx            Provider/hook when the chosen scope requires it
```

This resembles the reference project's slice organisation without copying unrelated radio, visitor, or password-reset state.

Start with the smallest useful store. Split it into slices when distinct shared concerns justify the separation. Choose provider scope and initial state deliberately for Next.js server rendering and hydration; do not share user-specific mutable state across server requests.

Persistence is a separate feature decision. Do not add localStorage persistence simply because the reference uses it, and do not move HttpOnly authentication tokens into a client store.

## 9. Configuration and generated files

| File/directory | Management |
| --- | --- |
| `package.json` | Edit dependencies and scripts intentionally. |
| `package-lock.json` | Maintain through npm and commit with dependency changes. |
| `next.config.ts` | React Compiler option, build directory override, development API rewrite. |
| `tsconfig.json` | Strict TypeScript, Next plugin, and `@/* -> ./src/*` mapping. |
| `eslint.config.mjs` | Next.js Core Web Vitals and TypeScript lint rules. |
| `postcss.config.mjs` | Tailwind processing configuration. |
| `public/` | Files served by static URL; `public/file.svg` becomes `/file.svg`. |
| `src/app/favicon.ico` | Route-convention site icon. |
| `AGENTS.md` | Frontend working rules, styling conventions, and local Next.js documentation requirement. |
| `CLAUDE.md` | References AGENTS.md to share instructions. |
| `README.md` | Starter documentation; its example `app/page.tsx` is not this project's actual home-page path. |
| `node_modules/` | Installed dependencies; ignored by Git; do not hand-edit. |
| `.next/` | Default generated Next.js output; ignored by Git. |
| `next-env.d.ts` | Generated Next.js declarations; ignored by Git. |
| `*.tsbuildinfo` | Generated incremental TypeScript cache; ignored by Git. |
| `.env*` | Ignored by current Git configuration; manage environment values separately. |

`HANDYTOOL_NEXT_DIST_DIR` can override the default build-output directory. In development, Next rewrites `/api/:path*` to the configured API origin. Production configuration returns no such rewrites and expects the deployment's reverse proxy to handle browser API requests.

## 10. Where to put a new feature

| Need | Placement |
| --- | --- |
| New page URL | A route folder under `src/app/[lang]/` with `page.tsx`. |
| Interactive UI used only by that page | A named component beside that page. |
| Form submission | Related `actions.ts`, using the existing server API client. |
| Repeated feature UI | `src/components/<feature>/`. |
| Additional API endpoint function | `src/lib/handytool-api.ts`, following its result/error conventions. |
| Feature data contract | Existing related `src/lib/*-types.ts` or a focused new type module. |
| Pure transformation/validation helper | A focused `src/lib/` module, or beside its sole consumer. |
| Translated labels | Existing feature copy module or matching JSON dictionaries. |
| Static image/icon asset | `public/`, or an existing code-native SVG component pattern. |
| Truly shared client state | A focused future `src/stores/` module when needed. |
| Global styling | `globals.css` only for global concerns/shared primitives allowed by AGENTS.md. |

For example, a new reports page could start in `src/app/[lang]/reports/page.tsx`. A reports-only filter widget could live beside it. Only extract shared report components or a report store once their reuse/state requirements exist. These example files have not been created.

## 11. Naming and imports

- Existing component filenames mostly use kebab-case, such as `account-menu.tsx`.
- Exported React components use PascalCase, such as `AccountMenu`.
- Use `.tsx` for JSX and `.ts` for non-JSX logic/types.
- Prefer the existing `@/` alias for imports across feature folders.
- Use relative imports for closely related files when clearer.
- Avoid creating duplicate API clients, duplicate translation systems, or empty abstraction folders.

Example:

```tsx
import { AdminCard } from "@/components/admin/admin-ui";
import type { AdminRow } from "@/lib/admin-types";
```

## 12. Development and verification

Run commands from the frontend root:

```powershell
Set-Location D:\pra\handytool
npm ci
npm run dev
```

Use `npm ci` to install dependencies from the committed lockfile. Use `npm install <package>` for an intentional dependency addition.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development frontend, normally on port 3000. |
| `npm run lint` | Run ESLint. |
| `npm run build` | Build production output, including the configured Next.js TypeScript checks. |
| `npm run start` | Serve a completed production build. |

The package currently has no `test` script. For UI changes, supplement lint/build with focused browser checks: relevant widths, long English/Chinese text, keyboard navigation, focus, disabled states, and reduced motion as applicable.

Before editing, follow the user's plan-approval requirements. Inspect existing changes and preserve unrelated work. Read relevant guides in the installed `node_modules/next/dist/docs/` as required by AGENTS.md. Keep this document aligned with actual files when the structure changes.

## 13. Definition and record editing

| Route | Server page and action |
| --- | --- |
| `/[lang]/schemas/[id]/edit` | Loads canonical metadata using getDefinitionEditor; saves using updateSchemaAction. |
| `/[lang]/records/[id]/edit` | Loads the record and its localized definition; saves using updateRecordAction. |

Definition owners/managers see **Edit definition** on the schema’s new-record page. Record owners/managers see **Edit record** on its detail page. The API returns canEdit for these links and independently enforces permissions on every write. Trial records remain editable only by their owning device.

The definition editor reuses schemas/new/schema-builder.tsx. The definitionToDraft helper preserves field IDs, option IDs, canonical labels, settings and translation maps. The toDefinitionPayload helper converts the draft into the API request. Existing keys, field types and option values stay fixed; labels, descriptions, translations, ordering, compatible constraints and active flags can change. New fields and options can be added. Existing entries can be deactivated when doing so does not invalidate stored records. Referenced Object definitions are edited through their own editor; Collection item definitions are edited inline. Visibility, access level and categories are preserved.

The record editor reuses schemas/[id]/records/new/record-form.tsx and supports all 16 field types. It starts with a copy of record.values and changes only the selected value in its local draft. Objects recurse by key; collections recurse by index. Boolean false, arrays, nested objects and untouched date/time strings are retained. Clear removes a property from an object; clearing a collection item leaves a null slot, while Remove deletes the item. The API determines which missing/null values are valid. Date/time inputs display UTC and append Z when changed, independently of the Next.js server’s timezone.

Both forms use local React state and useActionState, dispatched inside startTransition. Submission prevents native form reset so failed saves keep entered values and selected options visible. These drafts belong to one form and do not need a Zustand store. Successful actions revalidate pages and redirect to the saved record or the schema’s new-record page.

Record saves send the revision originally loaded by the editor. Definition saves send the original modifiedDate. A stale token produces a conflict and an explicit reload choice; the action never substitutes a newer token to silently overwrite another edit. Record visibility is read on the server and preserved. API error codes distinguish stale versions from incompatible schema changes.

Backend definition updates keep existing EF entities and configuration rows. An exclusive PostgreSQL advisory lock coordinates with shared locks held by definition creation and record writers. After saving proposed metadata inside the transaction, the API validates dependent definitions and their stored records. Failure rolls back the metadata change. This compatibility scan currently loads all definition graphs and the records of affected definitions; large installations may need indexed dependency traversal and batched validation. No database schema migration is required.

Verification includes frontend lint/build, backend unit tests, and an opt-in PostgreSQL test for persisted edits, rollback and actual stale-revision rejection. Set HANDYTOOL_EDIT_TEST_ROOT to the API project root to run that database test; it uses the existing connection configuration and rolls back test data. Browser fixtures exercise the real components with mocked actions, including mobile Chinese layout and failed-save state retention. These fixtures are not a full authenticated end-to-end test.
