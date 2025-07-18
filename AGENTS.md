# AGENTS.md

## Purpose

This document describes the agent architecture and coding conventions for the Radiant Whiteboard project. It is intended for use by AI coding assistants (such as ChatGPT Codex or GitHub Copilot) to ensure consistent, modular, and maintainable code generation and refactoring.

## Agent Coding Guidelines

- **Main App Logic**: All global state and orchestration live in `src/App.tsx`. This file wires together hooks, state, and renders the whiteboard and its elements.
- **Custom Hooks**: Event logic is extracted into hooks under `src/hooks/`:
  - `useWhiteboardPanZoom.ts`: Handles pan/zoom state and mouse wheel logic.
  - `useTextBoxHandlers.ts`, `useShapeHandlers.ts`, `useImageHandlers.ts`, `useArrowHandlers.ts`: Encapsulate event logic for text boxes, shapes, images, and arrows.
  - `useUniversalDragging.ts`: Handles universal dragging behavior across all element types.
  - `useKeyboardShortcuts.ts`: Manages keyboard shortcuts for various whiteboard actions.
  - `useAutoSave.ts`: Handles automatic saving functionality.
  - `useFirebaseAuth.ts`, `useAuth.ts`, `useFirebaseWhiteboard.ts`: Firebase authentication and data persistence.
  - Mouse event handlers (`handleWhiteboardMouseDown.ts`, `handleWhiteboardMouseMove.ts`, `handleMouseUp.ts`) are modularized.
- **Component Structure**: Each element type has its own component:
  - Core elements: `TextBox.tsx`, `ShapeElement.tsx`, `ImageElement.tsx`, `ArrowElement.tsx`, `MindMapNode.tsx`
  - UI components: `Header.tsx`, `Toolbar.tsx`, `FloatingToolbar.tsx`, `WhiteboardCanvas.tsx`
  - Modal components in `src/components/`: `AuthModal.tsx`, `SaveStatusIndicator.tsx`, `WhiteboardSidebarSheet.tsx`
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
- **Firebase Integration**: Authentication and data persistence are handled through Firebase hooks, with automatic saving and user management.
- **Keyboard Shortcuts**: Extensive keyboard shortcuts are implemented for productivity (T for text, shapes, delete, copy/paste, etc.).
- **Modular UI**: UI sections are separated into their own components (Header, Toolbar, FloatingToolbar) for better maintainability.

## Integration Points

- **External Libraries**: 
  - `lucide-react` for icons
  - `tailwindcss` for styling
  - `firebase` for authentication and data persistence
  - `@radix-ui` components for modal dialogs and UI elements
  - `class-variance-authority` and `clsx` for conditional styling
- **Vite Plugins**: Configured in `vite.config.ts` for React and optimized dependencies.
- **ESLint**: Type-aware linting is recommended; see `README.md` for advanced config.
- **Firebase**: Integrated for user authentication, real-time data sync, and automatic saving.

## Example: Adding a New Element Type

1. Create a new component in `src/`.
2. Extract event logic into a new hook in `src/hooks/`.
3. Manage state in `App.tsx` and pass handlers to the new component.
4. Follow the pattern in existing hooks/components for selection, drag, resize, and deletion.

## Key Files

- `src/App.tsx`: Main orchestration and state management.
- `src/hooks/`: All event logic and custom hooks including Firebase integration.
- **Element Components**: `src/TextBox.tsx`, `src/ShapeElement.tsx`, `src/ImageElement.tsx`, `src/ArrowElement.tsx`, `src/MindMapNode.tsx`
- **UI Components**: `src/Header.tsx`, `src/Toolbar.tsx`, `src/FloatingToolbar.tsx`, `src/WhiteboardCanvas.tsx`
- **Modal Components**: `src/components/AuthModal.tsx`, `src/components/SaveStatusIndicator.tsx`, `src/components/WhiteboardSidebarSheet.tsx`
- **Configuration**: `vite.config.ts`, `eslint.config.js`, `src/lib/firebase.ts`

## Recent Edits

- **Modular Architecture Complete**: Successfully extracted all components into separate `.tsx` files and all event handlers into custom hooks under `src/hooks/`.
- **UI Components Separated**: Split UI sections into their own components (`Header.tsx`, `Toolbar.tsx`, `FloatingToolbar.tsx`, `WhiteboardCanvas.tsx`).
- **Firebase Integration**: Added comprehensive Firebase authentication and real-time data persistence with auto-save functionality.
- **New Element Types**: Added `ArrowElement.tsx` and `MindMapNode.tsx` for enhanced whiteboard capabilities.
- **Enhanced Hooks**: Added `useUniversalDragging.ts`, `useKeyboardShortcuts.ts`, `useAutoSave.ts`, and Firebase-related hooks.
- **Component Organization**: Created `src/components/` directory for modal and utility components with organized UI component structure.
- **Authentication System**: Implemented complete user authentication flow with `AuthModal.tsx` and Firebase integration.
