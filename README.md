# QR White Label - Web Dev Class Presentation System

A React-based web application for managing classroom sessions with QR code-based student sign-ins, attendance tracking, code examples, and interactive presentations.

## Features

- 🎯 QR code-based student authentication
- 📊 Real-time attendance tracking
- 💻 Code playground with Monaco editor
- 📚 Resource library management
- 📝 Lesson plans and syllabus management
- 📈 Analytics and attendance history
- 🎨 Session templates
- 🗄️ Semester archiving

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- A **Supabase** account and project

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/MaxFishman/QR-WHITELABEL.git
cd QR-WHITELABEL
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory based on the `.env.example` file:

```bash
cp .env.example .env
```

Then edit the `.env` file and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings:
1. Go to https://supabase.com
2. Select your project
3. Navigate to Settings > API
4. Copy the "Project URL" and "anon/public" key

### 4. Set Up Supabase Database

The database migrations are located in the `supabase/migrations` directory. You'll need to run these migrations in your Supabase project to set up the required tables and functions.

### 5. Run the Development Server

```bash
npm run dev
```

The application will open in your browser at `http://localhost:5173` (or another port if 5173 is in use).

## Available Scripts

- **`npm run dev`** - Start the development server with hot-reload
- **`npm run build`** - Build the application for production
- **`npm run preview`** - Preview the production build locally
- **`npm run lint`** - Run ESLint to check for code quality issues
- **`npm run typecheck`** - Run TypeScript compiler to check for type errors

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory, ready to be deployed to your hosting service.

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
QR-WHITELABEL/
├── src/
│   ├── components/      # Reusable React components
│   ├── contexts/        # React Context providers
│   ├── data/            # Static data files
│   ├── lib/             # Utility libraries (Supabase client)
│   ├── pages/           # Page components
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main App component with routing
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── supabase/
│   ├── functions/       # Edge functions
│   └── migrations/      # Database migrations
├── public/              # Static assets
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # Project dependencies and scripts
```

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Supabase** - Backend as a Service (database, auth, storage)
- **Tailwind CSS** - Utility-first CSS framework
- **Monaco Editor** - Code editor component
- **QRCode.react** - QR code generation
- **P5.js** - Creative coding library
- **Lucide React** - Icon library

## Usage

### Teacher Workflow

1. Navigate to `/login` and sign in with your teacher credentials
2. Access the teacher dashboard at `/teacher`
3. Create a new session or select an existing one
4. Start presenting at `/present/:sessionId` which displays a QR code
5. Students scan the QR code to sign in

### Student Workflow

1. Scan the QR code displayed in class
2. Enter your information on the sign-in page
3. Access the student portal to view resources and participate

## Troubleshooting

### Port Already in Use

If you see an error that port 5173 is already in use, Vite will automatically try the next available port. Check the terminal output for the actual URL.

### Missing Environment Variables

If you see an error about missing Supabase environment variables, ensure your `.env` file exists and contains the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values.

### Build Errors

Run `npm run typecheck` to check for TypeScript errors before building.

## License

This project is private and proprietary.
