# Summit Component Guide

Comprehensive documentation of reusable React components used throughout the Summit platform.

## Overview

This guide documents all reusable components, their props, usage examples, and design patterns. Use this when building new features or modifying existing pages.

---

## UI Components

### 1. OptimizedImage

**Location:** `src/components/OptimizedImage.tsx`

A Next.js Image-based component for automatic image optimization (WebP, lazy loading, responsive sizing).

**Props:**
```typescript
interface OptimizedImageProps {
  src: string;              // Image URL
  alt: string;              // Alt text for accessibility
  width?: number;           // Image width (default: 400)
  height?: number;          // Image height (default: 300)
  fill?: boolean;           // Fill container (for dynamic sizing)
  sizes?: string;           // Responsive sizes query
  priority?: boolean;       // Load immediately (for above-fold)
  className?: string;       // Tailwind classes
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down'; // Default: 'cover'
  objectPosition?: string;  // CSS object-position (default: 'center')
  blurDataURL?: string;     // LQIP blur placeholder
  onLoad?: () => void;      // Callback when loaded
}
```

**Example:**
```tsx
<OptimizedImage
  src="/images/trip.jpg"
  alt="Mountain trip"
  width={400}
  height={300}
  priority={false}
  objectFit="cover"
/>
```

**Features:**
- ✅ Automatic format optimization (WebP, AVIF)
- ✅ Lazy loading by default
- ✅ Blur placeholder (LQIP) support
- ✅ Responsive sizing with srcSet
- ✅ Error handling with fallback
- ✅ Loading animation

---

### 2. Form Components

**Location:** `src/components/ui/`

Form components built with `react-hook-form` and `zod` validation.

**Standard Pattern:**
```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Define validation schema
const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password too short'),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('email')}
        placeholder="Email"
        className="w-full px-4 py-2 border rounded-lg"
      />
      {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
    </form>
  );
}
```

---

### 3. Modal Components

**Pattern:** Use Radix UI Dialog for accessibility.

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function ConfirmModal({ open, onOpenChange, onConfirm, title, description }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
        <div className="flex gap-4">
          <button onClick={() => onOpenChange(false)}>Cancel</button>
          <button onClick={onConfirm} className="bg-red-600 text-white rounded-lg">
            Confirm
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

### 4. Data Table

**Location:** `src/components/admin/DataTable.tsx` (Admin-specific)

Reusable table for displaying paginated data.

**Props:**
```typescript
interface DataTableProps<T> {
  columns: Column<T>[];     // Column definitions
  data: T[];                // Table data
  loading?: boolean;        // Loading state
  error?: string;          // Error message
  pagination?: {           // Pagination control
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}
```

**Example:**
```tsx
<DataTable
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status', render: (status) => <Badge>{status}</Badge> },
  ]}
  data={users}
  pagination={{ page: 1, totalPages: 5, onPageChange: setPage }}
/>
```

---

## Layout Components

### 1. Header/Navigation

**Location:** `src/components/Header.tsx`

Main navigation bar with authentication state and mobile menu.

**Features:**
- Responsive mobile menu
- User profile dropdown
- Dark mode toggle
- Search bar (on some pages)

---

### 2. Sidebar (Admin)

**Location:** `src/app/admin/layout.tsx`

Admin panel sidebar with navigation links.

**Features:**
- Collapsible navigation
- Active route highlighting
- Role-based menu items
- Dark mode support

---

## Patterns & Best Practices

### 1. API Error Handling

**Pattern:**
```typescript
try {
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  const result = await response.json();
  return result;
} catch (err) {
  console.error('Error:', err);
  // Show user-friendly error message
  setError(err.message);
}
```

---

### 2. Loading States

**Pattern:**
```tsx
export function DataFetcher() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data');
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!data) return <div>No data found</div>;

  return <div>{/* Render data */}</div>;
}
```

---

### 3. Form Submission with Validation

**Pattern:**
```tsx
const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
  resolver: zodResolver(schema),
});

const onSubmit = async (data) => {
  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Submission failed');

    // Success handling
    toast.success('Form submitted successfully');
  } catch (err) {
    toast.error(err.message);
  }
};

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <input {...register('field')} />
    {errors.field && <p className="text-red-500">{errors.field.message}</p>}
    <button disabled={isSubmitting}>
      {isSubmitting ? 'Submitting...' : 'Submit'}
    </button>
  </form>
);
```

---

### 4. Dark Mode Consistency

**Pattern:** Use Tailwind's `dark:` prefix consistently.

```tsx
// ✅ Good: Light + dark variants
<div className="bg-white dark:bg-slate-950 text-gray-900 dark:text-white">
  {/* Content */}
</div>

// ❌ Bad: Only light mode
<div className="bg-white text-gray-900">
  {/* Content */}
</div>
```

---

### 5. Responsive Design

**Pattern:** Mobile-first with Tailwind breakpoints.

```tsx
// sm: 640px, md: 768px, lg: 1024px, xl: 1280px
<div className="
  grid grid-cols-1      // Mobile: 1 column
  md:grid-cols-2        // Tablet: 2 columns
  lg:grid-cols-3        // Desktop: 3 columns
  gap-4                 // Consistent spacing
  px-4 sm:px-6          // Responsive padding
">
  {/* Content */}
</div>
```

---

### 6. Accessible Components

**Checklist:**
- ✅ Use semantic HTML (`<button>`, `<form>`, `<a>`)
- ✅ Add `aria-label` for icon-only buttons
- ✅ Use `<label>` with form inputs
- ✅ Include `alt` text on all images
- ✅ Maintain color contrast ratio ≥ 4.5:1
- ✅ Support keyboard navigation
- ✅ Test with screen readers

**Example:**
```tsx
<button
  aria-label="Close menu"
  onClick={closeMenu}
  className="p-2 hover:bg-gray-200"
>
  <X size={20} />
</button>
```

---

## Common Issues & Solutions

### Issue: Image not loading
**Solution:** Check src URL is valid, add `fill` prop if dimensions are unknown, verify CORS headers.

### Issue: Form validation not working
**Solution:** Ensure `zod` schema matches form field names, check resolver is applied.

### Issue: Dark mode not applied
**Solution:** Add `dark:` classes, ensure `dark` class is on parent, check Tailwind config.

### Issue: API request hanging
**Solution:** Add timeout, check CORS headers, verify endpoint exists, check authentication token.

---

## Component Checklist

When creating a new component:

- [ ] Has proper TypeScript types
- [ ] Includes JSDoc comments
- [ ] Responsive design (mobile-first)
- [ ] Dark mode support
- [ ] Accessibility (ARIA labels, semantic HTML)
- [ ] Error handling
- [ ] Loading states
- [ ] Works with Next.js 'use client' / server components
- [ ] Unit tests (if complex logic)
- [ ] Usage example documented

---

## File Structure

```
src/
  components/
    ui/               # Radix UI + custom components
      button.tsx
      dialog.tsx
      input.tsx
    admin/            # Admin-specific components
      DataTable.tsx
      StatsCard.tsx
    OptimizedImage.tsx
  app/
    (routes)/
      page.tsx        # Page components
      layout.tsx      # Layout wrappers
  lib/
    cache.ts          # Caching utilities
    query-optimizer.ts # Query optimization
    api-utils.ts      # API error handling
```

---

## Resources

- **Tailwind CSS**: https://tailwindcss.com/docs
- **Radix UI**: https://www.radix-ui.com/docs
- **React Hook Form**: https://react-hook-form.com/
- **Zod**: https://zod.dev/
- **Next.js**: https://nextjs.org/docs
- **Lucide Icons**: https://lucide.dev/

---

## Support

For component questions or improvements:
- Create an issue: https://github.com/toofuturetechnologies/SummitSite/issues
- Email: dev@summit.local
