# LinkedIn Mini MVP - Frontend

A modern Next.js frontend for LinkedIn OAuth authentication and post publishing.

## 🚀 Features

- ✅ **LinkedIn OAuth 2.0** - Secure authentication
- ✅ **Responsive Design** - Works on all devices
- ✅ **TypeScript** - Full type safety
- ✅ **Tailwind CSS** - Beautiful UI
- ✅ **Real-time Updates** - Instant feedback
- ✅ **Post Creation** - Publish to LinkedIn directly

## 📋 Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:3000`

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   # .env.local is already configured
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:3001
   ```

## 📁 Project Structure

```
frontend/
├── app/
│   ├── page.tsx              # Home page with login
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   ├── auth/
│   │   └── callback/
│   │       └── page.tsx      # OAuth callback handler
│   └── dashboard/
│       └── page.tsx          # Dashboard with post creation
├── lib/
│   └── api.ts                # API service for backend calls
└── components/               # Reusable components (future)
```

## 🎯 How It Works

1. **Login**: Click "Sign in with LinkedIn" on home page
2. **Authorize**: Grant permissions on LinkedIn
3. **Redirect**: Return to app with JWT token
4. **Dashboard**: View profile and create posts
5. **Publish**: Post directly to LinkedIn

## 🎨 Responsive Design

The UI is fully responsive:
- **Mobile**: Optimized for small screens
- **Tablet**: Adapts to medium screens
- **Desktop**: Full-width layout

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 API Integration

The frontend communicates with the backend via:
- **Base URL**: `http://localhost:3000`
- **Authentication**: JWT Bearer token
- **Endpoints**:
  - `GET /auth/linkedin` - Initiate OAuth
  - `GET /auth/status` - Check auth status
  - `GET /user/profile` - Get user profile
  - `POST /posts/create` - Create LinkedIn post

## 📱 Pages

### Home Page (`/`)
- Hero section with features
- "Sign in with LinkedIn" button
- Responsive design

### Auth Callback (`/auth/callback`)
- Receives JWT token from backend
- Stores token in localStorage
- Redirects to dashboard

### Dashboard (`/dashboard`)
- Displays user profile
- LinkedIn post creation form
- Success/error messages
- Logout functionality

## 🔐 Security

- JWT tokens stored in localStorage
- Automatic token attachment to API requests
- Protected routes (redirect if not authenticated)
- CORS configured for backend communication

## 🎨 UI Components

- **Gradient backgrounds**
- **Smooth animations**
- **Hover effects**
- **Loading states**
- **Success/error alerts**
- **Responsive navigation**

## 📦 Dependencies

- `next` - React framework
- `react` & `react-dom` - UI library
- `axios` - HTTP client
- `tailwindcss` - CSS framework
- `typescript` - Type safety

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```
4. Deploy!

### Other Platforms

1. Build the project:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm run start
   ```

## 🐛 Troubleshooting

**Issue**: "Failed to fetch profile"
- **Solution**: Make sure backend is running on port 3000

**Issue**: "Unauthorized" error
- **Solution**: Clear localStorage and login again

**Issue**: "Failed to publish post"
- **Solution**: Check LinkedIn API permissions in developer portal

## 👨‍💻 Author

madhusanka2023.me@gmail.com

## 📄 License

ISC

---

**Note**: This frontend requires the NestJS backend to be running.
