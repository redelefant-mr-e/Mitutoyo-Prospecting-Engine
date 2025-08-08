# Data Files

This folder contains CSV files that are automatically loaded by the Mitutoyo Prospecting Engine.

## Adding New Files

### Option 1: Automatic Discovery (Recommended)
1. **Upload your CSV file** to this folder (`public/data/`)
2. **Commit and push** the changes to GitHub:
   ```bash
   git add .
   git commit -m "Add new CSV file: your-file-name.csv"
   git push origin main
   ```
3. **The app will automatically detect** the new file and show it as a tab!

### Option 2: Create File Index (Faster Loading)
1. **Upload your CSV file** to this folder (`public/data/`)
2. **Run the update script** to create a file index:
   ```bash
   node update-file-index.js
   ```
3. **Commit and push** the changes to GitHub:
   ```bash
   git add .
   git commit -m "Add new CSV file: your-file-name.csv"
   git push origin main
   ```

**Note**: The app automatically discovers CSV files even without the file index, but the index makes loading faster.

## File Index

The `file-index.json` file contains metadata about all available CSV files. The app uses this to:
- Discover available files
- Display proper names for each file
- Show descriptions (if provided)

## File Format

CSV files should have:
- Headers in the first row
- Comma-separated values
- UTF-8 encoding

## Current Files

- `All Companies Denmark.csv` - Danish company data
- `All Companies.csv` - Complete company database  
- `Companies - Medium, High, or Perfect Match.csv` - Filtered company matches
- `Enrich Contact Data - Medium, High, or Perfect Match.csv` - Contact enrichment data
- `Enrich Contact Data Denmark - Medium, High, or Perfect Match.csv` - Danish contact data

## Notes

- Files are automatically loaded as tabs in the app
- The app will detect any CSV files in this folder
- File names become tab names (without .csv extension)
- Large files may take a moment to load 