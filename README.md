# My Trello Clone

A modern, full-featured Trello-like project management application built with Next.js 15, TypeScript, and Supabase.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## 📋 Overview

This is a feature-rich Kanban board application that enables teams to organize tasks, collaborate on projects, and track progress. Built with modern web technologies, it offers a seamless user experience with real-time updates and drag-and-drop functionality.

## ✨ Features

- **🔐 Authentication** - Secure user authentication powered by Clerk
- **📊 Kanban Boards** - Create multiple boards with customizable columns (To Do, In Progress, Review, Done)
- **🎯 Task Management** - Create, edit, and organize tasks with:
  - Titles and descriptions
  - Priority levels (Low, Medium, High)
  - Due dates
  - Assignees
- **🎨 Customization** - Personalize boards with color themes
- **🔍 Filtering** - Filter tasks by priority, assignee, and due date
- **📱 Responsive Design** - Fully responsive UI that works on desktop, tablet, and mobile devices
- **⚡ Real-time Updates** - Powered by Supabase for instant data synchronization
- **🎭 Drag & Drop** - Intuitive drag-and-drop interface for task organization (via @dnd-kit)

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) - React framework with App Router
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) - Type-safe development
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- **UI Components**: [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- **Icons**: [Lucide React](https://lucide.dev/) - Beautiful & consistent icons
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/) - Modern drag and drop toolkit

### Backend
- **Database**: [Supabase](https://supabase.com/) - PostgreSQL database with real-time capabilities
- **Authentication**: [Clerk](https://clerk.com/) - Complete user management and authentication

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint 9 with Next.js config
- **Type Checking**: TypeScript strict mode

## 📁 Project Structure

```
my-app/
├── app/                      # Next.js App Router
│   ├── boards/              # Board-related pages
│   │   └── [id]/           # Individual board page
│   ├── layout.tsx          # Root layout with Clerk provider
│   ├── page.tsx            # Home page with board list
│   └── globals.css         # Global styles
├── components/              # React components
│   ├── ui/                 # Reusable UI components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   └── textarea.tsx
│   └── navbar.tsx          # Navigation bar
├── lib/                     # Utilities and configurations
│   ├── hooks/              # Custom React hooks
│   │   └── useBoards.ts   # Board management hook
│   ├── supabase/           # Supabase configuration
│   │   ├── models.ts      # TypeScript interfaces
│   │   └── SupabaseProvider.tsx
│   ├── services.ts         # API service layer
│   └── utils.ts            # Utility functions
├── middleware.ts            # Clerk authentication middleware
└── package.json            # Project dependencies

```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn**
- **Supabase account** ([supabase.com](https://supabase.com))
- **Clerk account** ([clerk.com](https://clerk.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-own-trello/my-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Clerk Redirects (optional)
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   ```

4. **Set up Supabase Database**

   Run the following SQL in your Supabase SQL editor:

   ```sql
   -- Create boards table
   CREATE TABLE boards (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     title TEXT NOT NULL,
     description TEXT,
     color TEXT DEFAULT 'bg-blue-500',
     user_id TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create columns table
   CREATE TABLE columns (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     sort_order INTEGER NOT NULL,
     user_id TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create tasks table
   CREATE TABLE tasks (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     column_id UUID REFERENCES columns(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     description TEXT,
     assignee TEXT,
     due_date TEXT,
     priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
     sort_order INTEGER NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
   ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
   ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

   -- Create policies for boards
   CREATE POLICY "Users can view their own boards" ON boards
     FOR SELECT USING (auth.uid()::text = user_id);

   CREATE POLICY "Users can create their own boards" ON boards
     FOR INSERT WITH CHECK (auth.uid()::text = user_id);

   CREATE POLICY "Users can update their own boards" ON boards
     FOR UPDATE USING (auth.uid()::text = user_id);

   CREATE POLICY "Users can delete their own boards" ON boards
     FOR DELETE USING (auth.uid()::text = user_id);

   -- Create policies for columns
   CREATE POLICY "Users can view columns from their boards" ON columns
     FOR SELECT USING (
       EXISTS (
         SELECT 1 FROM boards 
         WHERE boards.id = columns.board_id 
         AND boards.user_id = auth.uid()::text
       )
     );

   CREATE POLICY "Users can create columns in their boards" ON columns
     FOR INSERT WITH CHECK (
       EXISTS (
         SELECT 1 FROM boards 
         WHERE boards.id = columns.board_id 
         AND boards.user_id = auth.uid()::text
       )
     );

   -- Create policies for tasks
   CREATE POLICY "Users can view tasks from their boards" ON tasks
     FOR SELECT USING (
       EXISTS (
         SELECT 1 FROM columns 
         JOIN boards ON boards.id = columns.board_id
         WHERE columns.id = tasks.column_id 
         AND boards.user_id = auth.uid()::text
       )
     );

   CREATE POLICY "Users can create tasks in their boards" ON tasks
     FOR INSERT WITH CHECK (
       EXISTS (
         SELECT 1 FROM columns 
         JOIN boards ON boards.id = columns.board_id
         WHERE columns.id = tasks.column_id 
         AND boards.user_id = auth.uid()::text
       )
     );

   CREATE POLICY "Users can update tasks in their boards" ON tasks
     FOR UPDATE USING (
       EXISTS (
         SELECT 1 FROM columns 
         JOIN boards ON boards.id = columns.board_id
         WHERE columns.id = tasks.column_id 
         AND boards.user_id = auth.uid()::text
       )
     );
   ```

5. **Configure Clerk Supabase Integration**

   In your Clerk Dashboard:
   - Go to **JWT Templates**
   - Create a new **Supabase** template
   - Copy the Issuer URL and add it to your Supabase Auth settings

6. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Creating a Board
1. Click the "Create New Board" button on the home page
2. Your new board will be created with default columns: To Do, In Progress, Review, Done

### Managing Tasks
1. Navigate to a board
2. Click "Add Task" to create a new task
3. Fill in task details (title, description, priority, assignee, due date)
4. Tasks appear in the first column by default
5. Drag and drop tasks between columns to update their status

### Customizing Boards
1. Click the board title or edit button
2. Change the board name
3. Select a color theme from the available options

### Filtering Tasks
1. Click the filter icon in the board toolbar
2. Select filters by priority or due date
3. Apply filters to view specific tasks

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🏗️ Architecture

### Data Flow
1. **Authentication**: Clerk handles user authentication and provides JWT tokens
2. **API Layer**: Custom fetch function in `SupabaseProvider` injects Clerk token into Supabase requests
3. **Service Layer**: `services.ts` provides clean API for database operations
4. **Hooks**: Custom React hooks (`useBoards`) manage state and side effects
5. **Components**: React components consume hooks and render UI

### Key Components
- **SupabaseProvider**: Manages Supabase client with Clerk authentication
- **useBoards**: Hook for board and task CRUD operations
- **Board Page**: Main kanban board interface with columns and tasks
- **Task Components**: Individual task cards with details

## 🔒 Security

- **Row Level Security (RLS)** enabled on all Supabase tables
- **Authentication** required for all operations via Clerk
- **JWT tokens** used for secure API communication
- **User isolation** - users can only access their own data

## 🎨 Customization

### Adding New Colors
Edit the color array in `app/boards/[id]/page.tsx`:
```typescript
["bg-blue-500", "bg-green-500", /* add more colors */]
```

### Modifying Default Columns
Edit `lib/services.ts` in the `createBoardWithDefaultColumns` function:
```typescript
const defaultColumns = [
  { title: "To Do", sort_order: 0 },
  // Add or modify columns here
];
```

## 🐛 Troubleshooting

### Common Issues

**400 Bad Request on board creation**
- Ensure all required environment variables are set
- Check Supabase RLS policies are correctly configured
- Verify Clerk JWT template is set up for Supabase

**Authentication errors**
- Verify Clerk publishable key and secret key
- Check middleware configuration
- Ensure Clerk provider wraps the app in layout.tsx

**Database errors**
- Run the SQL schema scripts in Supabase
- Check table and column names match the TypeScript models
- Verify RLS policies allow the operation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Clerk](https://clerk.com/) - Authentication
- [Radix UI](https://www.radix-ui.com/) - UI primitives
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [dnd-kit](https://dndkit.com/) - Drag and drop

## 📞 Support

For support, please open an issue in the GitHub repository.

---

Built with ❤️ using Next.js and Supabase
