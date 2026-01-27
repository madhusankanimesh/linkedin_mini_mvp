# LinkedIn OAuth Backend - NestJS

A professional NestJS backend implementation for LinkedIn OAuth 2.0 authentication and post publishing.

## 🚀 Features

- **LinkedIn OAuth 2.0 Authentication**: Secure user authentication via LinkedIn
- **JWT Token Management**: Session management with JSON Web Tokens
- **LinkedIn Profile Retrieval**: Fetch user profile data from LinkedIn API
- **Post Publishing**: Create and publish posts directly to LinkedIn
- **Secure Token Storage**: Access tokens stored securely (in-memory, ready for database integration)
- **CORS Enabled**: Frontend integration ready
- **TypeScript**: Fully typed codebase


## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- LinkedIn Developer Account
- LinkedIn App credentials (Client ID & Secret)

## 🛠️ Installation

1. **Clone and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file with your credentials:**
   ```env
   LINKEDIN_CLIENT_ID=your_linkedin_client_id
   LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
   LINKEDIN_CALLBACK_URL=http://localhost:3000/auth/linkedin/callback
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   ```

## 🏃 Running the Application

**Development mode:**
```bash
npm run start:dev
```

**Production build:**
```bash
npm run build
npm run start:prod
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### Authentication

#### `GET /auth/linkedin`
Initiates LinkedIn OAuth flow. Redirect users to this endpoint to start authentication.

#### `GET /auth/linkedin/callback`
LinkedIn OAuth callback URL. Handles the OAuth response and redirects to frontend with JWT token.

#### `GET /auth/status`
Check authentication status (requires JWT token).
- **Headers**: `Authorization: Bearer <token>`

### User

#### `GET /user/profile`
Get current user's profile information.
- **Headers**: `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "id": "user_1",
    "linkedinId": "abc123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "headline": "Software Engineer",
    "profilePicture": "https://..."
  }
  ```

### Posts

#### `POST /posts/create`
Create and publish a post to LinkedIn.
- **Headers**: `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "content": "Your post content here"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Post published successfully on LinkedIn",
    "data": { ... }
  }
  ```

#### `GET /posts/linkedin-profile`
Fetch LinkedIn profile data via API.
- **Headers**: `Authorization: Bearer <token>`

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── auth/                    # Authentication module
│   │   ├── strategies/          # Passport strategies
│   │   │   ├── linkedin.strategy.ts
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts   # Auth endpoints
│   │   ├── auth.service.ts      # Auth business logic
│   │   └── auth.module.ts
│   ├── user/                    # User module
│   │   ├── user.controller.ts
│   │   ├── user.service.ts      # User management
│   │   └── user.module.ts
│   ├── posts/                   # Posts module
│   │   ├── posts.controller.ts
│   │   ├── posts.service.ts     # LinkedIn API integration
│   │   └── posts.module.ts
│   ├── app.module.ts            # Root module
│   └── main.ts                  # Application entry point
├── .env.example                 # Environment template
├── tsconfig.json                # TypeScript config
└── package.json
```

## 🔐 LinkedIn App Setup

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Create a new app
3. Add redirect URL: `http://localhost:3000/auth/linkedin/callback`
4. Request permissions:
   - `r_emailaddress` - Read email address
   - `r_liteprofile` - Read basic profile
   - `w_member_social` - Post on behalf of user
5. Copy Client ID and Client Secret to `.env`

## 🔒 Security Features

- JWT-based authentication
- Passport.js strategy implementation
- CORS protection
- Input validation with class-validator
- Secure token handling

## 📝 Data Storage

Currently uses **in-memory storage** for rapid development. For production:
- Integrate MongoDB, PostgreSQL, or MySQL
- Update `UserService` to use database queries
- Add proper connection pooling
- Implement data persistence

## 🚨 Error Handling

The API returns standard HTTP status codes:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## 🧪 Testing the OAuth Flow

1. Start the backend server
2. Navigate to `http://localhost:3000/auth/linkedin`
3. Complete LinkedIn authentication
4. Get redirected with JWT token
5. Use token in Authorization header for protected endpoints

## 📦 Dependencies

- `@nestjs/core` - NestJS framework
- `@nestjs/passport` - Authentication
- `passport-linkedin-oauth2` - LinkedIn OAuth strategy
- `@nestjs/jwt` - JWT tokens
- `class-validator` - Input validation
- `@nestjs/config` - Environment configuration

## 🎯 Next Steps

- [ ] Add database integration (MongoDB/PostgreSQL)
- [ ] Implement refresh token rotation
- [ ] Add rate limiting
- [ ] Implement post scheduling
- [ ] Add image upload for posts
- [ ] Add analytics tracking
- [ ] Implement post deletion
- [ ] Add user preferences storage

## 👨‍💻 Author

**Email**: madhusanka2023.me@gmail.com

## 📄 License

ISC

---

**Note**: This backend is designed to work with the LinkedIn Mini MVP frontend. Make sure both are running for full functionality.
