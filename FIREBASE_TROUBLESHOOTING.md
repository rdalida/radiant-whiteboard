# Firebase Troubleshooting Guide

## Possible Causes for Data Disappearing

### 1. Firebase Security Rules
Check your Firebase Console > Firestore Database > Rules

**Common problematic rules:**
```javascript
// Too restrictive - might delete data
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

**Recommended rules for testing:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /whiteboards/{whiteboardId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 2. Data Validation Issues
- Check if your data contains any invalid characters
- Verify all fields are properly serializable
- Check for circular references in your data

### 3. Network Issues
- Check browser's Network tab for failed requests
- Look for CORS errors
- Verify Firebase project configuration

### 4. Concurrent Operations
- Multiple auto-save operations might be conflicting
- Check if sidebar refresh is overwriting data

## Debugging Steps

1. **Check Firebase Console directly**
   - Go to Firebase Console > Firestore Database
   - Navigate to your collection
   - Watch for real-time changes

2. **Use the test function**
   - Open browser console
   - Run: `testFirebasePersistence('your-whiteboard-id')`
   - Watch the console logs

3. **Check Network Tab**
   - Open DevTools > Network
   - Filter by Firebase/Firestore requests
   - Look for failed requests or unexpected deletions

4. **Check Security Rules**
   - Go to Firebase Console > Firestore Database > Rules
   - Temporarily set rules to allow all reads/writes for testing

## Common Solutions

1. **Simplify Security Rules** (for testing)
2. **Add retry logic** to handle transient failures
3. **Use batch operations** to ensure atomicity
4. **Add proper error handling** for rule violations
