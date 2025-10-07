# GitHub Copilot Instructions for SEP Project

## Project Overview
This is a SEP (Software Engineering Project) - Educational Center Management System built with React + NestJS + PostgreSQL.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL
- **State Management**: TanStack Query (React Query)
- **Authentication**: JWT + AuthGuard

## Code Style & Conventions

### TypeScript
- Use strict typing, avoid `any` when possible
- Use any for object shapes
- Use enums for constants
- Prefer `const` over `let`, avoid `var`

### React Components    
- Use functional components with hooks
- Use PascalCase for component names
- Use kebab-case for file names
- Use any for props
- Use React.FC or explicit return types

### API & Services
- Use async/await instead of .then()
- Handle errors with try/catch
- Use proper HTTP status codes
- Return consistent response format: `{ data: any, message: string }`

### Database (Prisma)
- Use camelCase for field names
- Use PascalCase for model names
- Always include `id`, `createdAt`, `updatedAt` for main models
- Use relations instead of foreign keys

### Styling (Tailwind CSS)
- Use utility classes
- Use responsive prefixes (sm:, md:, lg:, xl:)
- Use dark mode classes (dark:)
- Use consistent spacing scale
- Use semantic color names

## Common Patterns

### React Query Hook
```typescript
const { data, isLoading, isError, refetch } = useQuery({
  queryKey: ['resource', params],
  queryFn: () => service.getData(params),
  enabled: !!requiredParam,
  staleTime: 30000,
  refetchOnWindowFocus: false
})
```

### Service Method
```typescript
async getData(params: any) {
  try {
    const response = await apiClient.get('/endpoint', params)
    return response
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}
```

### Component Props Interface
```typescript
interface ComponentProps {
  id: string
  name: string
  onUpdate?: (data: any) => void
  className?: string
}
```

### Prisma Query
```typescript
const data = await prisma.model.findMany({
  where: { condition },
  include: { relation: true },
  orderBy: { field: 'desc' },
  skip: (page - 1) * limit,
  take: limit
})
```

## File Structure
```
client/src/
├── components/          # Reusable UI components
├── pages/              # Main pages
├── services/           # API services
├── utils/              # Utility functions
├── lib/                # Libraries and configs
└── types/              # TypeScript type definitions

server/src/
├── modules/            # Feature modules
├── db/                 # Database (Prisma)
├── common/             # Shared utilities
└── main.ts             # Entry point
```

## Naming Conventions
- **Variables**: camelCase (`userName`, `isLoading`)
- **Functions**: camelCase (`getUserData`, `handleSubmit`)
- **Components**: PascalCase (`UserProfile`, `DataTable`)
- **Files**: kebab-case (`user-profile.tsx`, `data-table.tsx`)
- **API endpoints**: kebab-case (`/admin-center/leave-requests`)
- **Database tables**: snake_case (`leave_requests`)

## Error Handling
- Use try/catch for async operations
- Return meaningful error messages
- Log errors for debugging
- Use proper HTTP status codes
- Show user-friendly error messages in UI

## Performance
- Use React.memo for expensive components
- Use useMemo/useCallback for expensive calculations
- Implement pagination for large datasets
- Use debouncing for search inputs
- Lazy load routes and components

## Security
- Validate all inputs
- Use proper authentication
- Sanitize user data
- Use HTTPS in production
- Implement proper authorization

## Testing
- Write unit tests for utilities
- Write integration tests for APIs
- Write component tests for UI
- Use meaningful test descriptions
- Test edge cases and error scenarios

## Comments
- Comment complex business logic
- Use JSDoc for functions
- Explain why, not what
- Keep comments up to date
- Use TODO comments for future work

## Git
- Use meaningful commit messages
- Use conventional commits format
- Keep commits small and focused
- Use feature branches
- Write descriptive PR descriptions

## Common Commands
```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run type-check   # TypeScript check

# Backend
npm run start:dev    # Start dev server
npm run build        # Build for production
npx prisma migrate   # Run migrations
npx prisma generate  # Generate Prisma client
```

## Best Practices
- Follow SOLID principles
- Write clean, readable code
- Use meaningful variable names
- Keep functions small and focused
- Avoid deep nesting
- Use early returns
- Prefer composition over inheritance
- Write self-documenting code
- Regular refactoring
- Code reviews
