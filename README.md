# Radiant Whiteboard

A modular React + TypeScript whiteboard app with mind mapping, drawing, and authentication features.

## Features

- 🎨 **Multi-Tool Whiteboard**: Text boxes, shapes (rectangle, circle, diamond), drawing pen, and mind maps
- 🧠 **Mind Mapping**: Create hierarchical mind maps with smooth connectors and gradient themes
- 🔐 **Authentication**: Secure user authentication with Clerk
- 💾 **Auto-Save**: User-specific data persistence with auto-save
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎯 **Multi-Select**: Select and manipulate multiple elements at once
- 🔄 **Pan & Zoom**: Navigate large whiteboards with smooth pan and zoom
- 🎨 **Beautiful UI**: Modern design with gradients and animations

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/radiant-whiteboard.git
cd radiant-whiteboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up Clerk authentication:
   - Go to [Clerk Dashboard](https://dashboard.clerk.com/)
   - Create a new application
   - Copy your publishable key
   - Create a `.env` file in the root directory:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
   ```

4. Start the development server:
```bash
npm run dev
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to GitHub Pages

## Architecture

The app follows a modular architecture with clear separation of concerns:

- **Components**: UI components for each element type
- **Hooks**: Custom hooks for event handling and state management
- **Authentication**: Clerk integration for user management
- **Data Persistence**: User-specific localStorage with auto-save

## Key Files

- `src/App.tsx` - Main app logic and state management
- `src/hooks/` - Custom hooks for event handling
- `src/components/` - UI components
- `src/AuthWrapper.tsx` - Authentication wrapper
- `src/ClerkAuthButtons.tsx` - Sign in/out buttons

## Keyboard Shortcuts

- `T` - Text tool
- `R` - Rectangle tool  
- `C` - Circle tool
- `D` - Diamond tool
- `P` - Pen tool
- `M` - Create mind map node
- `Tab` - Add sibling node (mind map)
- `Enter` - Add child node (mind map)
- `Delete` - Delete selected elements
- `Ctrl/Cmd + Click` - Multi-select

## Deployment

The app is configured for GitHub Pages deployment:

```bash
npm run deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
