# GitHub Copilot Rules for School Management System

## Project Overview

This is a school management system built with:

- Laravel (Backend)
- React (Frontend)
- Inertia.js (Server-side rendering)
- Shadcn UI (Component library)

## User Roles

The system has the following user roles:

- Registrar
- Teacher/Professor
- Program Head
- Treasurer
- HR
- Student

## Development Guidelines

### General Coding Standards

- Use TypeScript for React components
- Follow Laravel conventions for backend code
- Use proper namespacing and directory structure

### Frontend Development

- Utilize Shadcn UI components for consistent design
- Create reusable components in `resources/js/components`
- Follow React best practices (hooks, functional components)
- Use Inertia.js for page transitions and data fetching

### Form Handling

- Use Inertia Forms for all form submissions
- Implement proper validation both on frontend and backend
- For frontend validation: `const { data, setData, errors, post, processing } = useForm({...})`
- For backend validation: Use Laravel form requests

### Authentication & Authorization

- Use Laravel's built-in authentication with proper guards
- Implement role-based access control for different user types
- Ensure proper route protection both in Laravel and Inertia

### Performance Considerations

- Use lazy loading for heavy components
- Implement pagination for large data sets
