# Better Moodle

Avoid Moodle's poor UX/UI, session timeouts, and cumbersome navigation.
A modern, web-based file explorer for browsing and accessing course materials with an elegant interface.

## Features

- 🌐 **Web-based Interface**: Access your files through any browser
- 📁 **Folder Navigation**: Click to navigate through directory structure
- 🔗 **Direct File Access**: Click files to view/download them directly
- 🧭 **Breadcrumb Navigation**: Easy navigation back to parent directories
- 🎨 **Modern UI**: Clean, responsive design with file type icons
- ⚡ **Fast Performance**: Efficient file serving and directory scanning

## Project Structure

```
├── src/
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces and types
│   ├── utils/
│   │   └── fileSystem.ts     # File system utilities and helpers
│   ├── templates/
│   │   └── pageTemplate.ts   # HTML template generation
│   └── routes/
│       └── index.ts          # Route handlers and server logic
├── index.ts                  # Main server entry point
├── package.json              # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## Installation & Usage

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the server:**

   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Architecture

### Modular Design

- **Types**: Centralized TypeScript interfaces for type safety
- **Utils**: Reusable utilities for file system operations
- **Templates**: HTML generation separated from business logic
- **Routes**: Clean route handlers with proper separation of concerns

### Key Components

- **File Scanner**: Recursively scans directories while filtering system files
- **MIME Type Detection**: Proper content-type headers for file serving
- **Tree Generator**: Builds hierarchical HTML structure for file tree
- **Breadcrumb Navigation**: Generates navigation trail for current location

## Technology Stack

- **Runtime**: Node.js with ES modules
- **Framework**: Fastify (high-performance web framework)
- **Language**: TypeScript for type safety
- **File Serving**: Custom implementation with some MIME types
- **UI**: Pure HTML/CSS/JavaScript (no framework dependencies)

## File Support

The explorer supports various file types with appropriate icons and handling:

- 📄 PDF documents
- 📝 Word documents (DOC, DOCX)
- 🌐 HTML files
- 📦 ZIP archives
- ⚡ TypeScript/JavaScript files
- 📊 R scripts
- 📋 Markdown files
- And more...

### Available Scripts

- `npm start` - Start the development server
- `npm run build` - Compile TypeScript (if configured)
- `npm run build-css` - Build Tailwind CSS
- `npm run watch-css` - Watch and rebuild Tailwind CSS on changes (for development)
