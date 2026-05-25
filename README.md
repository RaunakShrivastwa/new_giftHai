# Bloom & Bow — Plain React

A plain React + Vite + React Router e-commerce demo. No TanStack.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build for production

```bash
npm run build
npm run preview
```

## Stack

- React 18
- Vite 5
- React Router v6
- Tailwind CSS v3
- lucide-react icons
- sonner toasts
- qrcode.react

## Project structure

```
src/
  main.tsx          # entry point + providers
  App.tsx           # all routes
  index.css         # Tailwind + design tokens
  pages/            # one file per page (Home, Cart, ...)
  components/       # site-header, site-footer, banner, 3D preview
  lib/              # auth, cart, products data
  assets/           # images
```
