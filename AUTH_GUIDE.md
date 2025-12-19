# Authentication Guide

## Overview

This API uses a dual-token authentication system:
- **Access Token (JWT)**: Short-lived token (60 seconds) for authenticating API requests
- **Session Token**: Long-lived refresh token (10 days) for obtaining new access tokens

## Authentication Flow

### 1. Login

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionToken": "a1b2c3d4e5f6...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

Store both tokens securely:
- Use the `accessToken` in the Authorization header for API requests
- Store the `sessionToken` to refresh the access token when it expires

### 2. Making Authenticated Requests

Include the access token in the Authorization header:

```
Authorization: Bearer <accessToken>
```

**Example**:
```bash
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"user"}'
```

### 3. Refreshing Access Token

When the access token expires (after 60 seconds), use the session token to get a new one:

**Endpoint**: `POST /auth/refresh`

**Request Body**:
```json
{
  "sessionToken": "a1b2c3d4e5f6..."
}
```

**Response**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### 4. Logout

**Endpoint**: `POST /auth/logout`

**Request Body**:
```json
{
  "sessionToken": "a1b2c3d4e5f6..."
}
```

**Response**:
```json
{
  "message": "Logged out successfully"
}
```

## Protected Endpoints

### Admin-Only Endpoints

The following endpoints require both authentication (valid JWT) and admin role:

#### Users
- `POST /users` - Create new user
- `DELETE /users/:id` - Delete user

#### Images
- `POST /images` - Upload new image
- `DELETE /images/:imageName` - Delete image

### Public Endpoints

- `GET /concert` - List all concerts
- `GET /concert/:id` - Get concert details
- `GET /images/:imageName` - Get image
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout

## Default Admin User

The application comes with a pre-seeded admin user:

- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: `admin`

**⚠️ IMPORTANT**: Change this password in production!

## Pre-seeded Concert Data

The database is pre-populated with:
- 1 Concert: "New Year's Eve Concert"
- 10 tickets at $10 each
- Organizer: Music Events Inc
- Artist: The Amazing Band
- Venue: Grand Stadium
- Date: December 31, 2024
- Image: placeholder-concert-image.jpg

## Error Responses

### 401 Unauthorized
```json
{
  "status": 401,
  "error": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "status": 403,
  "error": "Access denied. Admin role required."
}
```

### 401 Token Expired
```json
{
  "status": 401,
  "error": "Invalid or expired token"
}
```

## Environment Variables

Add the following to your `.env` file:

```env
JWT_SECRET=your-very-secret-key-change-this-in-production
```

If not set, a default value is used (NOT recommended for production).

## Token Expiry

- **Access Token**: 60 seconds
- **Session Token**: 10 days

## Database Seeding

### Automatic Seeding
The database is automatically seeded when the application starts.

### Manual Seeding
Run the seed script manually:

```bash
npm run seed
```

This will create:
1. Default admin user (if not exists)
2. Concert with 10 tickets (if no concerts exist)

## Security Considerations

1. **Password Hashing**: The current implementation stores passwords in plain text. In production, use bcrypt:
   ```typescript
   import * as bcrypt from 'bcrypt';
   const hashedPassword = await bcrypt.hash(password, 10);
   const isMatch = await bcrypt.compare(password, user.password);
   ```

2. **JWT Secret**: Use a strong, random secret key in production
3. **HTTPS**: Always use HTTPS in production
4. **Token Storage**: Store tokens securely (HttpOnly cookies or secure storage)
5. **Session Cleanup**: Old sessions are kept in the database. Consider implementing a cleanup job

## Example Workflow

```bash
# 1. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Response: Save accessToken and sessionToken

# 2. Create a user (admin only)
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"pass123","role":"user"}'

# 3. When access token expires, refresh it
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"sessionToken":"<sessionToken>"}'

# 4. Upload an image (admin only)
curl -X POST http://localhost:3000/images \
  -H "Authorization: Bearer <accessToken>" \
  -F "image=@/path/to/image.jpg"

# 5. Delete an image (admin only)
curl -X DELETE http://localhost:3000/images/image-filename.jpg \
  -H "Authorization: Bearer <accessToken>"

# 6. Logout
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"sessionToken":"<sessionToken>"}'
```

## Testing

Use the Swagger documentation at `http://localhost:3000/api` to test the endpoints interactively.

## Troubleshooting

### "User not authenticated" error
- Ensure you're including the Authorization header
- Check that the token hasn't expired (60 seconds)
- Verify the Bearer prefix is included

### "Access denied. Admin role required" error
- This endpoint requires admin privileges
- Login with the admin account

### "Session expired" error
- Your session token has expired (10 days)
- Login again to get a new session

### "Invalid credentials" error
- Check email and password
- Ensure the admin user was created (check logs on startup)