vite.config.ts, eslint.config.js: Build and lint config.

# Copilot Instructions for Radiant Whiteboard

## Project Overview
This is a modular React + TypeScript whiteboard app built with Vite. The architecture emphasizes separation of concerns via custom hooks for event logic, and clear component boundaries for rendering and state management.

## Key Architectural Patterns
- **Main App Logic**: All global state and orchestration live in `src/App.tsx`. This file wires together hooks, state, and renders the whiteboard and its elements.
- **Custom Hooks**: Event logic is extracted into hooks under `src/hooks/`:
  - `useWhiteboardPanZoom.ts`: Handles pan/zoom state and mouse wheel logic.
  - `useTextBoxHandlers.ts`, `useShapeHandlers.ts`, `useImageHandlers.ts`: Encapsulate event logic for text boxes, shapes, and images.
  - Mouse event handlers (`handleWhiteboardMouseDown.ts`, etc.) are also modularized.
- **Component Structure**: Each element type (TextBox, Shape, Image) has its own component (`src/TextBox.tsx`, `src/ShapeElement.tsx`, `src/ImageElement.tsx`). These receive event handlers and state via props.
- **Data Flow**: State is managed in `App.tsx` and passed down. Event handlers update state via React's `useState` setters, often wrapped in custom hooks.

## Developer Workflows
- **Development**: Run `npm run dev` to start Vite with HMR.
- **Build**: Use `npm run build` for production builds.
- **Linting**: Run `npm run lint` (ESLint config is in `eslint.config.js`).
- **Preview**: Use `npm run preview` to serve the built app locally.
- **Deploy**: Use `npm run deploy` (publishes to GitHub Pages via `gh-pages`).

## Conventions & Patterns
- **Event Handler Extraction**: All complex event logic (mouse, keyboard, drag, resize) is extracted into hooks or handler files in `src/hooks/`. When adding new element types, follow this pattern.
- **Multi-Select**: Selection logic for shapes and text boxes uses Ctrl/Cmd for multi-select, single click for single select.
- **Pan/Zoom**: Mouse wheel zoom and drag-to-pan are handled via the pan/zoom hook, with transform applied to the whiteboard container.
- **State Updates**: Always use functional updates (`setState(prev => ...)`) for array/object state.
- **Component Props**: Pass only the necessary handlers and state to child components. Avoid passing global state unless needed for rendering or interaction.

## Integration Points
- **External Libraries**: Uses `lucide-react` for icons, `tailwindcss` for styling.
- **Vite Plugins**: Configured in `vite.config.ts` for React and optimized dependencies.
- **ESLint**: Type-aware linting is recommended; see `README.md` for advanced config.

## Example: Adding a New Element Type
1. Create a new component in `src/`.
2. Extract event logic into a new hook in `src/hooks/`.
3. Manage state in `App.tsx` and pass handlers to the new component.
4. Follow the pattern in existing hooks/components for selection, drag, resize, and deletion.

## Key Files
- `src/App.tsx`: Main orchestration and state.
- `src/hooks/`: All event logic and custom hooks.
- `src/TextBox.tsx`, `src/ShapeElement.tsx`, `src/ImageElement.tsx`: Element components.
- `vite.config.ts`, `eslint.config.js`: Build and lint config.

## Recent Edits
- We're refactoring App.tsx because it's getting too large. We've successfully extracted each component into it's own .tsx files. We've also done the same with the event handlers and custom hooks.
- Now let's split the UI sections into their own components.