# CrackZone Backend API

Node.js backend API for the CrackZone gaming platform with PostgreSQL database.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Database Setup:**
   - Install PostgreSQL on your system
   - Create a database named `crackzone_db`
   - Copy `.env.example` to `.env` and update database credentials

3. **Environment Configuration:**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your database credentials and JWT secret.

4. **Run Database Migration:**
   ```bash
   npm run migrate
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Tournaments
- `GET /api/tournaments` - Get all tournaments
- `GET /api/tournaments/:id` - Get tournament by ID
- `POST /api/tournaments/:id/join` - Join tournament

### Teams
- `GET /api/teams/my-teams` - Get user's teams
- `POST /api/teams` - Create new team

### Health Check
- `GET /api/health` - Server health status

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts and profiles
- `teams` - Gaming teams
- `team_members` - Team membership relationships
- `tournaments` - Tournament information
- `tournament_participants` - Tournament participation
- `matches` - Match results and scheduling
- `notifications` - User notifications

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation

## Development

- Uses nodemon for auto-restart during development
- Environment-based configuration
- Error handling middleware
- Structured logging