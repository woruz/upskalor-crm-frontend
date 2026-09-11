# React Template

A production-ready React starter with Vite, TypeScript, Redux Toolkit, Tailwind CSS v4, and a complete UI component library.

## Tech Stack

| Layer     | Technology                     |
| --------- | ------------------------------ |
| Framework | React 19, TypeScript 5, Vite 7 |
| Routing   | React Router v7                |
| Styling   | Tailwind CSS v4 + SCSS modules |
| State     | Redux Toolkit + redux-persist  |
| Forms     | Formik + Yup                   |
| HTTP      | Axios with token refresh       |
| Build     | Vite with Fast Refresh         |

## Features

- **TanStack Query** — server-state data fetching/caching (`QueryClientProvider` wired in `main.tsx`)
- **Error boundary** — app-wide `ErrorBoundary` with a reusable fallback (`ErrorFallback`)
- **Code splitting** — route pages are lazy-loaded (`React.lazy` + `Suspense`), each shipped as its own chunk
- **Compressed build** — production build emits pre-compressed `.gz` assets (`vite-plugin-compression2`)
- **Forms** — Formik + Yup, validating on blur (`validateOnChange: false`)
- **Tooling** — Husky git hooks (lint-staged + Prettier on pre-commit, commitlint on commit-msg, build on pre-push)

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.sample .env

# Start dev server
npm run dev
```

The app will be available at `http://localhost:5173/`.

## Available Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start development server |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |

## Project Structure

```
src/
├── pages/                 # Page components
│   ├── auth/login/
│   ├── dashboard/
│   └── home/
├── shared/
│   ├── assets/
│   │   ├── icons/         # SVG icons with index.ts
│   │   ├── images/        # Images with index.ts
│   │   └── fonts/         # Fonts with index.ts
│   ├── components/
│   │   ├── forms/         # Form components
│   │   ├── providers/     # Context providers
│   │   └── ui/            # UI primitives (17+ components)
│   └── lib/
│       ├── api/           # Axios + API client
│       ├── config/        # Routes, constants
│       ├── hooks/         # Custom hooks
│       ├── store/         # Redux store + slices
│       ├── types/         # TypeScript types
│       └── validations/   # Yup schemas
├── App.tsx                # Root with routing
├── main.tsx               # App entry + providers
└── index.css              # Global styles + theme tokens

public/                    # Static files served at root (favicon, etc.)

.prompts/                  # AI prompts for complex tasks
└── admin-dashboard.md     # Prompt for building admin dashboards
```

## Environment Variables

| Variable            | Description                          |
| ------------------- | ------------------------------------ |
| `VITE_API_BASE_URL` | Base URL for API calls               |
| `NODE_ENV`          | Environment (development/production) |

Copy `.env.sample` to `.env` and adjust values for your setup.

## UI Components

The template includes 17+ production-ready UI components:

- **Layout**: Accordion, Modal, Tabs, Pagination
- **Forms**: Button, Input, TextArea, Checkbox, ToggleSwitch, PhoneInput, FileUpload, Dropdown
- **Feedback**: Alert, Badge, Tooltip, Spinner, NoContentCard, Toast

All components use CSS custom properties for theming and support dark mode.

### Using Components

```tsx
import { Button } from '@/shared/components/ui/button/button';
import { Input } from '@/shared/components/ui/input/input';
import { useToast } from '@/shared/components/ui/toast/toast';

function MyComponent() {
  const { addToast } = useToast();

  return (
    <form>
      <Input label="Email" type="email" />
      <Button onClick={() => addToast({ title: 'Saved!', variant: 'success' })}>
        Save
      </Button>
    </form>
  );
}
```

## Routing

Routes are defined centrally in `src/shared/lib/config/routes.ts`:

```ts
import { ROUTES } from '@/shared/lib/config/routes';

// Use in components
<Link to={ROUTES.LOGIN}>Sign In</Link>
navigate(ROUTES.DASHBOARD);
```

### Protected Routes

Wrap routes with `ProtectedRoute` for authentication:

```tsx
<Route
  path={ROUTES.DASHBOARD}
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

## State Management

Redux Toolkit with persistence:

```tsx
import { useAppDispatch, useAppSelector } from '@/shared/lib/hooks/useRedux';
import { setToken } from '@/shared/lib/store/slices/authSlice';

const dispatch = useAppDispatch();
const user = useAppSelector((state) => state.user.user);
```

## Theming

Dark mode is handled via CSS custom properties. Toggle with:

```tsx
import { useTheme } from '@/shared/lib/hooks/useTheme';

const { theme, toggleTheme } = useTheme();
```

Theme tokens are defined in `src/index.css`.

## API Integration

Pre-configured Axios instance with automatic token refresh:

```ts
import { apiClient } from '@/shared/lib/api/client';

const response = await apiClient.get('/users/me');
```

## Form Validation

Yup schemas included:

```tsx
import { loginSchema } from '@/shared/lib/validations/schemas';
import { useFormik } from 'formik';

const formik = useFormik({
  validationSchema: loginSchema,
  // ...
});
```

## Assets

All app assets (icons, images, fonts) live in `src/shared/assets/` and must be exported through their `index.ts`. Only favicons and root-served static files go in `public/`.

```tsx
import { icons } from '@/shared/assets/icons';
import { images } from '@/shared/assets/images';

<img src={icons.logo} alt="Logo" />;
```

## Code Standards

- **Naming**: camelCase for files/folders (e.g., `button/button.tsx`)
- **Component size**: Max 300-350 lines per file
- **Imports**: Use `@/` prefix for project imports, never relative `../../`
- **Routes**: Always use `ROUTES.*` constants, never string literals
- **Modals & Dialogs**: Always create as separate dedicated components, never inline inside a page

See `.claude/skills/` for detailed coding guidelines.

## License

MIT
