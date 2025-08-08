# Shared Data Files

This folder contains CSV files that will be available to all users of the app.

## How to add files:

1. **Add your CSV file** to this folder (e.g., `my-data.csv`)
2. **Update the file list** in `src/utils/sharedDataLoader.js`:
   ```javascript
   const SHARED_FILES = [
     {
       name: 'my-data.csv',
       displayName: 'My Data',
       url: '/data/my-data.csv'
     }
   ];
   ```
3. **Commit and push** to GitHub
4. **All users will see the file** when they load the app

## File Requirements:
- Must be valid CSV format
- Should have headers
- Keep files reasonably small (< 1MB recommended)
- Use descriptive names

## Notes:
- Files are read-only for users
- Users cannot delete shared files
- Files are loaded automatically when users log in 