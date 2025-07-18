# Whiteboard Title Functionality

## Overview
The whiteboard now has an editable title feature in the Header component, allowing users to name their whiteboards and have them auto-saved to Firebase.

## Features

### 1. **Editable Title in Header**
- Located in the Header component next to "Radiant Whiteboard"
- Default title for new whiteboards: "New whiteboard"
- Click the edit icon (appears on hover) to edit the title
- Save with Enter key or clicking the checkmark
- Cancel with Escape key or clicking the X

### 2. **Keyboard Shortcuts**
- **B key**: Toggle sidebar open/close
- **T key**: Add text box
- **D key**: Add shape
- **Q key**: Rectangle tool
- **W key**: Circle tool
- **E key**: Diamond tool
- **R key**: Pen tool
- **Delete/Backspace**: Delete selected elements

### 3. **Auto-saving**
- **New whiteboards**: Automatically saved to Firebase when content is added (3-second delay)
- **Existing whiteboards**: Content auto-saved when modified (2-second delay)
- **Title changes**: Immediately saved when title is updated

### 4. **Sidebar Integration**
- Sidebar automatically refreshes when whiteboard titles are changed
- Shows the updated title in the whiteboard list
- Maintains proper sorting by last updated
- Can be toggled with keyboard shortcut "B"

## Technical Implementation

### Components Modified
1. **Header.tsx**: Added editable title functionality with inline editing
2. **App.tsx**: Added title state management and auto-save logic
3. **useFirebaseWhiteboard.ts**: Added `updateWhiteboardTitle` function
4. **WhiteboardSidebarSheet.tsx**: Added refresh trigger for title updates

### Auto-save Logic
- New whiteboards are saved automatically when content is added
- Existing whiteboards are continuously auto-saved when content changes
- Title changes trigger immediate saves and sidebar refresh

### State Management
- `currentWhiteboardTitle`: Stores the current whiteboard title
- `refreshTrigger`: Triggers sidebar refresh when incremented
- Auto-save timeouts prevent excessive Firebase calls

## User Experience
1. User starts with "New whiteboard" title
2. Can edit title by clicking the edit icon in the header
3. Adding content auto-saves the whiteboard
4. Title changes are immediately reflected in the sidebar
5. All changes persist across sessions

## Firebase Integration
- New `updateWhiteboardTitle` function for title-only updates
- Maintains separate functions for content vs title updates
- Proper error handling for all Firebase operations
