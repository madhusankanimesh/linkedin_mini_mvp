# 🚀 LinkedIn Mini MVP - AI-Powered Content Assistant

A full-stack LinkedIn automation platform with AI-powered content generation, built with NestJS, Next.js, TypeORM, and MySQL.

## ✨ Features Implemented

### 1. ✅ LinkedIn OAuth Authentication
- Secure OAuth 2.0 integration
- JWT token management
- Session persistence

### 2. ✅ Real Profile Data Fetching
- First name, last name from LinkedIn
- Professional headline
- Profile picture
- Email address
- All data stored in MySQL database

### 3. ✅ AI Personalization Setup
- **Role** - User's professional role
- **Goals** - Career objectives
- **Challenges** - Professional challenges
- **Target Country** - Geographic focus
- **Content Tone** - Professional, Casual, Inspirational, Educational
- All preferences persisted in database

### 4. ✅ AI Content Generation
- Dynamic post generation based on user profile
- 4 different content tones with unique templates
- Personalized content using user's role, goals, and challenges
- Preview before publishing

### 5. ✅ Publish Posts to LinkedIn
- Direct publishing via LinkedIn API (w_member_social)
- Post preview functionality
- LinkedIn post ID tracking
- Timestamp recording
- Success/error notifications

### 6. ✅ Comprehensive Dashboard
- Profile summary with avatar
- Post count statistics
- AI preferences management
- Post history with status badges
- AI-generated content indicators
- Tabbed interface (Create Post / Post History)

## 🛠️ Tech Stack

**Backend:**
- NestJS (Node.js framework)
- TypeORM (Database ORM)
- MySQL (Database via XAMPP)
- Passport.js (Authentication)
- JWT (Token management)

**Frontend:**
- Next.js 15 (React framework)
- TypeScript
- Tailwind CSS
- Axios (HTTP client)

## 📋 Database Schema

### Tables Created (Auto-generated):
1. **users** - LinkedIn profile data
2. **posts** - Published LinkedIn posts
3. **user_preferences** - AI personalization settings

## 🚦 Quick Start

### Prerequisites
- Node.js v16+
- MySQL (XAMPP running)
- LinkedIn Developer Account

### Backend Setup

1. **Navigate to backend:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Ensure .env is configured:**
```env
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
LINKEDIN_CALLBACK_URL=http://localhost:3000/auth/linkedin/callback
FRONTEND_URL=http://localhost:3001
JWT_SECRET=your_super_secret_jwt_key_change_this
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=linkedin_mini_mvp
```

4. **Start backend:**
```bash
npm run start:dev
```

✅ Backend runs on: **http://localhost:3000**

### Frontend Setup

1. **Navigate to frontend:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start frontend:**
```bash
npm run dev
```

✅ Frontend runs on: **http://localhost:3001**

## 🎯 Complete API Endpoints

### Authentication
- `GET /auth/linkedin` - Initiate OAuth flow
- `GET /auth/linkedin/callback` - OAuth callback handler
- `GET /auth/status` - Check authentication status

### User Management
- `GET /user/profile` - Get user profile
- `GET /user/linkedin-profile` - Fetch real LinkedIn data via API
- `GET /user/preferences` - Get AI preferences
- `PUT /user/preferences` - Update AI preferences
- `GET /user/dashboard` - Get complete dashboard data

### Posts
- `POST /posts/create` - Create & publish post to LinkedIn
- `GET /posts/generate-ai-content` - Generate AI-powered content
- `GET /posts/my-posts` - Get user's post history
- `GET /posts/all` - Get all posts (admin)
- `GET /posts/linkedin-profile` - Get LinkedIn profile data

## 🎨 Feature Details

### AI Content Generation Engine

The system generates personalized content using:
- ✅ User's professional role
- ✅ Career goals and aspirations
- ✅ Current professional challenges
- ✅ Target geographic market
- ✅ Selected content tone/style

**Available Content Tones:**
1. **Professional** - Formal, business-oriented language
2. **Casual** - Friendly, conversational style
3. **Inspirational** - Motivational, uplifting messages
4. **Educational** - Informative, teaching-focused content

### Dashboard Features
- ✅ Real-time profile display with LinkedIn data
- ✅ Post statistics and analytics
- ✅ AI preferences editor (inline modal)
- ✅ Complete post history with filters
- ✅ AI-generated content badges
- ✅ Publication timestamps
- ✅ Post status indicators (Published/Failed)

## 📊 Database Structure

```sql
-- users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  linkedinId VARCHAR(255) UNIQUE,
  email VARCHAR(255),
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  headline TEXT,
  profilePicture VARCHAR(500),
  accessToken TEXT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);

-- posts table
CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  content TEXT,
  linkedinPostId VARCHAR(255),
  status VARCHAR(50) DEFAULT 'PUBLISHED',
  isAIGenerated BOOLEAN DEFAULT FALSE,
  userId INT,
  createdAt TIMESTAMP,
  publishedAt TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- user_preferences table
CREATE TABLE user_preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT,
  role VARCHAR(255),
  goals TEXT,
  challenges TEXT,
  targetCountry VARCHAR(255),
  contentTone VARCHAR(50) DEFAULT 'professional',
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

## 🔐 Security Features
- ✅ JWT authentication with 7-day expiration
- ✅ OAuth 2.0 authorization flow
- ✅ Secure token storage (httpOnly cookies recommended for production)
- ✅ CORS protection (configured for localhost:3001)
- ✅ Input validation with class-validator
- ✅ SQL injection prevention (TypeORM parameterized queries)
- ✅ XSS protection

## 📝 User Flow

1. **Login** → Click "Continue with LinkedIn"
2. **Authorize** → Grant permissions on LinkedIn
3. **Setup Preferences** → Configure AI settings (role, goals, challenges, tone)
4. **Generate Content** → Click "✨ Generate AI Content"
5. **Review & Edit** → Modify AI-generated content as needed
6. **Publish** → Post directly to LinkedIn with one click
7. **Track History** → View all published posts with status

## 🎓 LinkedIn API Permissions Required

Make sure your LinkedIn app has these permissions:
- ✅ `r_emailaddress` - Read email address
- ✅ `r_liteprofile` - Read basic profile information
- ✅ `w_member_social` - Post on behalf of user

## 🐛 Troubleshooting

### LinkedIn API Error: "Request body could not be converted to data map"
This error occurs when the request format doesn't match LinkedIn's expected schema. Check the backend logs for detailed request/response information.

**Solution:**
- Ensure your LinkedIn app has `w_member_social` permission
- Verify the access token is still valid
- Check backend logs for the exact request being sent

### Database Connection Failed
**Solution:**
- Ensure XAMPP MySQL is running
- Verify database `linkedin_mini_mvp` exists
- Check DB credentials in `.env` file

### Port Already in Use
**Solution:**
```bash
# Kill process on port 3000 (backend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001 (frontend)
lsof -ti:3001 | xargs kill -9
```

## 🚀 Deployment Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Set NODE_ENV=production
- [ ] Update FRONTEND_URL to production domain
- [ ] Update LinkedIn callback URL to production
- [ ] Set up proper database credentials
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Enable rate limiting
- [ ] Add monitoring (e.g., Sentry)

## 📧 Support & Contact

**Developer:** madhusanka2023.me@gmail.com

## 📄 License

ISC

---

**Built with ❤️ for LinkedIn automation and AI-powered content creation**
