# 98070 Admin Panel

This is the admin panel for the CrackZone tournament management system.

## Features

- **Admin Authentication**: Secure login system for administrators
- **Dashboard**: Overview of system statistics (users, tournaments, teams)
- **Tournament Management**: Create, edit, delete, and manage tournament status
- **User Management**: View and manage user accounts
- **Team Management**: View and manage team registrations

## Access

The admin panel is accessible at `/admin/login` in the frontend application.

### Default Credentials
- Username: `admin`
- Password: `admin123`

**Important**: Change these credentials in production by updating the environment variables:
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

## Backend Routes

All admin routes are prefixed with `/api/admin`:

- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/tournaments` - List all tournaments
- `POST /api/admin/tournaments` - Create new tournament
- `PUT /api/admin/tournaments/:id/status` - Update tournament status
- `DELETE /api/admin/tournaments/:id` - Delete tournament
- `GET /api/admin/users` - List all users
- `GET /api/admin/teams` - List all teams

## Frontend Components

Located in `frontend/src/admin/`:

- `AdminLogin.jsx` - Login form
- `AdminDashboard.jsx` - Main dashboard with statistics
- `AdminLayout.jsx` - Shared layout with navigation
- `TournamentManagement.jsx` - Tournament CRUD operations
- `UserManagement.jsx` - User listing and management
- `TeamManagement.jsx` - Team listing and management

## Security

- JWT-based authentication
- Admin role verification middleware
- Protected routes requiring admin token
- Rate limiting on all endpoints

## Setup

1. Install backend dependencies:
   ```bash
   cd backend
   npm install bcrypt
   ```

2. Update your `.env` file with admin credentials:
   ```
   ADMIN_USERNAME=your_admin_username
   ADMIN_PASSWORD=your_secure_password
   ```

3. Start the backend server:
   ```bash
   npm run dev
   ```

4. Access the admin panel at `http://localhost:5173/admin/login`

## Usage

1. Navigate to `/admin/login`
2. Enter admin credentials
3. Use the sidebar navigation to access different management sections
4. Create, edit, and manage tournaments, users, and teams as needed

## Production Notes

- Change default admin credentials
- Use environment variables for sensitive configuration
- Consider implementing role-based permissions for multiple admin levels
- Add audit logging for admin actions
- Implement proper session management and token refresh