# Firebase Setup Guide

## 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" (or select your existing project)
3. Follow the setup wizard:
   - Enter project name
   - Choose whether to enable Google Analytics
   - Select analytics account (if enabled)

## 2. Enable Firestore Database

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database
5. Click "Done"

## 3. Create Web App

1. In your Firebase project, click the web icon (`</>`) to add a web app
2. Enter your app name (e.g., "Radiant Whiteboard")
3. Optionally enable Firebase Hosting
4. Click "Register app"
5. Copy the Firebase configuration object

## 4. Configure Your App

1. Create a `.env.local` file in your project root
2. Add your Firebase configuration:

```
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

## 5. Security Rules (Important!)

Since we're using Clerk for authentication (not Firebase Auth), you need to update the Firestore security rules:

1. Go to Firestore Database > Rules
2. For development/testing, use these rules (WARNING: This allows all read/write access):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /whiteboards/{document} {
      allow read, write: if true;
    }
  }
}
```

**Important**: The above rules allow anyone to read/write. For production, you should implement proper security rules or use Firebase Auth with Clerk.

## 6. Test Your Setup

1. Start your development server: `npm run dev`
2. Try saving a whiteboard (you must be signed in)
3. Check the Firebase Console > Firestore Database to see if data is saved

## Features Available

- **Save Whiteboard**: Save your current whiteboard with a custom title
- **Load Whiteboard**: Load previously saved whiteboards
- **Delete Whiteboard**: Remove saved whiteboards
- **Auto-sync**: All data is automatically synced to Firebase

## Notes

- You need to be signed in (using Clerk) to save/load whiteboards
- Whiteboards are stored in Firestore with timestamps
- Images are stored as base64 data URLs (consider using Firebase Storage for large images)
- The current implementation doesn't include user isolation (all whiteboards are public)
