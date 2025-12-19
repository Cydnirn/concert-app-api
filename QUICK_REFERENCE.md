# Quick Reference - Authentication

## Getting Started

### 1. Start the Application
```bash
npm run start:dev
```

The database will be automatically seeded with:
- Admin user: `admin@example.com` / `admin123`
- 10 concert tickets at $10 each

### 2. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

**Save the response:**
- `accessToken` - Use for API requests (expires in 60s)
- `sessionToken` - Use to refresh access token (expires in 10 days)

## Common Operations

### Create User (Admin Only)
```bash
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'
```

### Delete User (Admin Only)
```bash
curl -X DELETE http://localhost:3000/users/USER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Upload Image (Admin Only)
```bash
curl -X POST http://localhost:3000/images \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

### Delete Image (Admin Only)
```bash
curl -X DELETE http://localhost:3000/images/filename.jpg \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Image (Public)
```bash
curl http://localhost:3000/images/filename.jpg
```

### List Concerts (Public)
```bash
curl http://localhost:3000/concert
```

### Refresh Access Token
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"sessionToken":"YOUR_SESSION_TOKEN"}'
```

### Logout
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"sessionToken":"YOUR_SESSION_TOKEN"}'
```

## Token Information

| Token Type | Expiry | Usage |
|------------|--------|-------|
| Access Token (JWT) | 60 seconds | Authorization header |
| Session Token | 10 days | Refresh endpoint |

## Protected Endpoints

### Admin Only
- `POST /users` - Create user
- `DELETE /users/:id` - Delete user
- `POST /images` - Upload image
- `DELETE /images/:imageName` - Delete image

### Public
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout
- `GET /concert` - List concerts
- `GET /concert/:id` - Get concert
- `GET /images/:imageName` - Get image

## Manual Database Seeding

```bash
npm run seed
```

## Environment Variables

Create `.env.development` file:
```env
NODE_ENV=development
DATABASE_URL=postgres://postgres:postgres@localhost:5432/concert_db
FILE_DIRECTORY=./uploads
JWT_SECRET=your-secret-key-change-in-production
```

## Troubleshooting

### 401 Unauthorized
- Token expired (refresh it)
- Missing/invalid Authorization header
- Wrong token format (must be `Bearer TOKEN`)

### 403 Forbidden
- Not logged in as admin
- Login with: `admin@example.com` / `admin123`

### Token Workflow
```
Login → Get accessToken + sessionToken
  ↓
Use accessToken (60s)
  ↓
Token expires → Use sessionToken to refresh
  ↓
Get new accessToken → Continue
```

## Documentation

- Full Guide: `AUTH_GUIDE.md`
- Implementation Details: `IMPLEMENTATION_SUMMARY.md`
- Swagger UI: `http://localhost:3000/api`

## Default Credentials

**⚠️ CHANGE IN PRODUCTION**

- Email: `admin@example.com`
- Password: `admin123`
- Role: `admin`
