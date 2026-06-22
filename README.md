# Blog System

A modern, full-featured blogging platform built with Next.js, featuring user authentication, blog management, commenting system, and image uploads. Perfect for content creators and bloggers who need a scalable, easy-to-use platform.

## ✨ Features

- **User Authentication** - Register and login with JWT-based authentication
- **Blog Management** - Create, read, update, and delete blog posts
- **Rich Commenting** - Readers can comment on blogs with moderation system
- **Image Uploads** - Upload and manage blog header images
- **Admin Dashboard** - Comprehensive dashboard for managing blogs, comments, and users
- **Search Functionality** - Find blogs quickly with the integrated search bar
- **View Tracking** - Track and display blog view counts
- **Responsive Design** - Mobile-friendly interface built with Tailwind CSS
- **Type-Safe** - Full TypeScript support for type safety
- **Form Validation** - Client-side and server-side validation with Zod

## 🛠️ Tech Stack

- **Frontend Framework:** [Next.js 16](https://nextjs.org/) - React framework for production
- **Language:** [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- **Form Management:** [React Hook Form](https://react-hook-form.com/) - Performant forms with easy validation
- **Validation:** [Zod](https://zod.dev/) - TypeScript-first schema validation
- **Data Fetching:** [SWR](https://swr.vercel.app/) - React Hooks library for data fetching
- **Authentication:** JWT-based token authentication
- **Cookie Management:** [js-cookie](https://github.com/js-cookie/js-cookie)

## 📁 Project Structure

```
blog-system/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin section (protected routes)
│   │   ├── dashboard/            # Admin dashboard
│   │   ├── blogs/                # Blog management (create, edit)
│   │   ├── comments/             # Comments moderation
│   │   ├── login/                # Admin login
│   │   └── register/             # Admin registration
│   ├── blog/                     # Public blog pages
│   │   └── [slug]/               # Individual blog post view
│   ├── demo/                     # Demo pages
│   │   └── image-uploader/       # Image upload demo
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/                   # Reusable React components
│   ├── admin/                    # Admin-specific components
│   ├── BlogForm.tsx              # Blog creation/editing form
│   ├── CommentForm.tsx           # Comment submission form
│   ├── CommentsSection.tsx       # Comments display and moderation
│   ├── ConfirmationModal.tsx     # Confirmation dialog
│   ├── ImageUploader.tsx         # Image upload component
│   ├── SearchBar.tsx             # Blog search functionality
│   └── ViewCountTracker.tsx      # Blog view tracking
├── lib/                          # Utility functions and services
│   ├── services/                 # API services
│   │   ├── auth.service.ts       # Authentication API calls
│   │   ├── blog.service.ts       # Blog API calls
│   │   ├── comment.service.ts    # Comment API calls
│   │   └── upload.service.ts     # File upload API calls
│   └── types/                    # TypeScript type definitions
│       ├── auth.types.ts         # Auth types
│       ├── blog.types.ts         # Blog types
│       ├── comment.types.ts      # Comment types
│       └── upload.types.ts       # Upload types
├── public/                       # Static assets
├── middleware.ts                 # Next.js middleware for auth
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── eslint.config.mjs             # ESLint configuration
├── package.json                  # Project dependencies
├── API.md                        # Detailed API documentation
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or higher
- npm, yarn, or bun package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blog-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (if needed)
   Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The app will auto-reload as you make changes to the code.

### Building for Production

```bash
npm run build
npm start
```

## 📦 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## 🔐 Authentication

The blog system uses JWT (JSON Web Token) for authentication:

- **Register:** Create a new account at `/admin/register`
- **Login:** Sign in at `/admin/login`
- **Token Storage:** JWT tokens are stored in browser cookies and localStorage
- **Protected Routes:** Admin routes require valid authentication

For detailed authentication API documentation, see [API.md](./API.md#-authentication).

## 📝 Main Pages

### Public Pages
- **Home** (`/`) - Blog listing page with search
- **Blog Post** (`/blog/[slug]`) - Individual blog post with comments
- **Image Upload Demo** (`/demo/image-uploader`) - Test image upload functionality

### Admin Pages
- **Admin Login** (`/admin/login`) - Authentication
- **Admin Register** (`/admin/register`) - Create new admin account
- **Dashboard** (`/admin/dashboard`) - Overview and statistics
- **Blog Management** (`/admin/blogs/create`, `/admin/blogs/[slug]/edit`) - Create and edit blogs
- **Comments** (`/admin/comments`) - Moderate comments

## 🔌 API Endpoints

The application includes a complete REST API. Key endpoints:

| Resource | Method | Endpoint | Protected |
|----------|--------|----------|-----------|
| Auth | POST | `/auth/register` | ❌ |
| Auth | POST | `/auth/login` | ❌ |
| Auth | GET | `/auth/profile` | ✅ |
| Blogs | GET | `/blogs` | ❌ |
| Blogs | POST | `/blogs` | ✅ |
| Blogs | GET | `/blogs/:slug` | ❌ |
| Blogs | PATCH | `/blogs/:id` | ✅ |
| Blogs | DELETE | `/blogs/:id` | ✅ |
| Comments | GET | `/comments/blog/:blogId` | ❌ |
| Comments | POST | `/comments/blog/:blogId` | ❌ |
| Comments | PATCH | `/comments/:id/status` | ✅ |
| Upload | POST | `/upload` | ✅ |

For complete API documentation with examples, see [API.md](./API.md).

## 🎨 Styling

The project uses **Tailwind CSS 4** for styling. Key configuration files:

- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.mjs` - PostCSS configuration
- `app/globals.css` - Global styles

## 📖 Component Overview

### Key Components

- **BlogForm.tsx** - Handles blog creation and editing with validation
- **CommentForm.tsx** - Allows users to submit comments
- **CommentsSection.tsx** - Displays and manages comments
- **ImageUploader.tsx** - Handles image uploads for blogs
- **SearchBar.tsx** - Search functionality for finding blogs
- **ViewCountTracker.tsx** - Tracks and displays blog view statistics

## 🔍 Code Quality

The project uses ESLint for code quality checks:

```bash
npm run lint
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to submit pull requests or open issues for bugs and feature requests.
