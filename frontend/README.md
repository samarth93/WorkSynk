# WorkSynk Frontend

This is the frontend application for WorkSynk, built with Next.js 15, React 19, and TypeScript.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

## Getting Started

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Main dashboard pages
│   └── layout.tsx      # Root layout
├── components/         # Reusable components
│   ├── auth/          # Authentication components
│   ├── chat/          # Chat components
│   ├── layout/        # Layout components
│   └── ui/            # UI components
├── contexts/          # React contexts
├── hooks/             # Custom React hooks
├── lib/              # API and utilities
├── types/            # TypeScript definitions
└── utils/            # Utility functions
```

## Key Features

- **Modern UI**: Responsive design with dark/light themes
- **Real-time**: WebSocket integration for live updates
- **Authentication**: JWT-based auth with protected routes
- **Video Calls**: Integrated video calling functionality
- **Chat System**: Real-time messaging
- **Role Management**: User and admin interfaces

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```
