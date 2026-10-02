# Lingua

**Learn something new. Share what you know.**

Lingua is a web-based learning marketplace designed to connect learners with course creators. Learners can discover courses that match their interests, while creators can share their knowledge by creating and managing courses.

## Overview

Lingua aims to provide a platform where people can explore learning opportunities and share their expertise through online courses.

The platform is designed around two primary user roles:

* **Learners** — Discover courses, explore different topics, and enroll in courses that match their learning goals.
* **Creators** — Create, publish, and manage courses to share their knowledge with learners.

## Tech Stack

Lingua is built using the following technologies.

| Technology                                                            | Purpose                                                                                |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [Vue 3](https://vuejs.org/)                                           | Frontend framework for building interactive user interfaces using the Composition API. |
| [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) | Main programming language for application logic.                                       |
| [Vite](https://vite.dev/)                                             | Development server and build tool for the frontend.                                    |
| [Tailwind CSS](https://tailwindcss.com/)                              | Utility-first CSS framework for responsive UI styling.                                 |
| [Pinia](https://pinia.vuejs.org/)                                     | State management for shared application state.                                         |
| [Vue Router](https://router.vuejs.org/)                               | Client-side routing and navigation between pages.                                      |
| [Supabase](https://supabase.com/)                                     | Backend platform providing PostgreSQL database, authentication, and APIs.              |

### Architecture Responsibilities

* **Views** — Render pages and handle user interactions.
* **Components** — Provide reusable UI elements.
* **Stores** — Manage shared state, loading states, errors, and application actions using Pinia.
* **Services** — Handle communication with Supabase and encapsulate data operations.
* **Lib** — Configure and export the Supabase client.
* **Router** — Define application routes and navigation rules.
* **Constants** — Store reusable values such as database table names.

The typical data flow is:

```text
View
  ↓
Pinia Store
  ↓
Service
  ↓
Supabase Client
  ↓
Supabase Backend
```

This separation helps keep components maintainable and makes application logic easier to test and reuse.

## Development Goals

Lingua is also a project for exploring and applying modern frontend development practices, including:

* Component-based architecture with Vue 3.
* Centralized state management with Pinia.
* API integration and asynchronous data handling.
* Authentication and authorization.
* Database operations with Supabase.
* Reusable UI components and responsive design.
* Separation of concerns and maintainable code.

## Project Status

**Status:** In Development

Features, architecture, and UI are being developed incrementally.