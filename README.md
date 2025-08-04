# Mitutoyo Prospecting Engine

A modern, responsive web application for viewing and analyzing CSV files with intelligent JSON detection and beautiful data visualization. Perfect for data analysts, researchers, and anyone who needs to explore CSV data with embedded JSON content.

## ✨ Features

- **Multi-File Support**: Open and manage multiple CSV files simultaneously with tabs
- **Column Management**: Hide/show columns on demand with an intuitive dropdown
- **File Renaming**: Rename each view/file for better organization
- **Drag & Drop Upload**: Easy file upload with drag and drop support
- **Intelligent Data Analysis**: Automatically detects data types and JSON content
- **JSON Support**: Special handling for JSON strings with formatted display
- **Responsive Table**: Beautiful, scrollable table with hover effects
- **Data Statistics**: Overview of your data structure and content
- **Export Functionality**: Download processed data as CSV
- **Modern UI**: Clean, minimalistic design with harmonized orange theme
- **No Backend Required**: Runs entirely in the browser - no server needed

## 🚀 Quick Start

### Option 1: Run Locally (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/redelefant-mr-e/Mitutoyo-Prospecting-Engine.git
   cd Mitutoyo-Prospecting-Engine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

### Option 2: Deploy to GitHub Pages

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages** (or any static hosting service)
   - The built files will be in the `dist/` folder
   - Upload the contents to your hosting provider

### Option 3: Use as a Desktop App

You can wrap this web app in Electron for a desktop experience:

1. **Install Electron globally**
   ```bash
   npm install -g electron
   ```

2. **Build the project**
   ```bash
   npm run build
   ```

3. **Create a simple Electron wrapper** (see `electron.js` example below)

## 📦 Installation

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Development Setup

```bash
# Clone the repository
git clone https://github.com/redelefant-mr-e/Mitutoyo-Prospecting-Engine.git
cd Mitutoyo-Prospecting-Engine

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Usage

1. **Upload CSV Files**: Drag and drop your CSV files onto the upload area or click to browse
2. **Manage Multiple Files**: Use tabs to switch between different CSV files
3. **Rename Views**: Click the edit icon on any tab to rename it for better organization
4. **Hide Columns**: Use the column selector to hide/show specific columns
5. **View Analysis**: The app will automatically analyze your data and show statistics
6. **Explore Data**: Scroll through the table to view your data
7. **Interact with JSON**: Click on JSON content to view it in a formatted modal
8. **Export**: Download the processed data as a new CSV file

## 🔍 Data Analysis Features

The application automatically analyzes your CSV data to:

- **Detect Data Types**: Identifies strings, numbers, dates, booleans, and JSON
- **JSON Detection**: Recognizes JSON strings and provides special formatting
- **Column Statistics**: Shows counts of different data types
- **Sample Data**: Displays sample values for each column
- **Smart Formatting**: Automatically formats JSON content with proper field detection

## 📊 Sample Data

Two sample CSV files are included to demonstrate the application's capabilities:

**sample-data.csv** contains:
- Regular text data (names, emails)
- JSON metadata with company information and skills
- JSON preferences with user settings
- Various data types (numbers, dates, booleans)

**sample-data-2.csv** contains:
- Product catalog data (product names, categories, prices)
- JSON specifications with technical details
- Inventory and date information
- Different data structure to showcase multi-file functionality

## 🛠️ Technical Details

- **Frontend**: React 18 with Vite
- **CSV Parsing**: PapaParse library
- **Icons**: Lucide React
- **Styling**: Custom CSS with harmonized orange theme
- **JSON Handling**: Custom utilities for safe parsing and formatting
- **Build Tool**: Vite for fast development and optimized builds

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 📱 Deployment Options

### GitHub Pages
```bash
npm run build
# Upload dist/ folder to GitHub Pages
```

### Netlify
```bash
npm run build
# Drag dist/ folder to Netlify
```

### Vercel
```bash
npm run build
# Deploy with Vercel CLI or connect GitHub repository
```

### Docker
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Project Structure

```
Mitutoyo-Prospecting-Engine/
├── src/
│   ├── components/     # React components
│   ├── utils/         # Utility functions
│   ├── App.jsx        # Main app component
│   └── main.jsx       # App entry point
├── public/            # Static assets
├── sample-data.csv    # Sample data files
└── package.json       # Dependencies and scripts
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with React and Vite
- Icons from Lucide React
- CSV parsing with PapaParse
- Modern design principles and accessibility best practices

---

**Made with ❤️ for data exploration** 