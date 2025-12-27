# Instagram-like Public Profile Feature

## Overview
This feature adds Instagram-like public profile functionality to CrackZone, allowing users to view other players' profiles, follow them, and see their gaming achievements and match history.

## Features

### 🎮 Public Profile View
- **Instagram-like Layout**: Clean, modern profile design similar to Instagram
- **Profile Information**: Username, bio, rank, join date, favorite game
- **Stats Display**: Tournaments won, win rate, total earnings, best rank
- **Follow System**: Follow/unfollow other players
- **Privacy Controls**: Users can set their profile to public, friends-only, or private

### 📊 Profile Content
- **Achievements Tab**: Display earned achievements with dates
- **Match History Tab**: Recent tournament results and performance
- **Posts Tab**: Placeholder for future content (screenshots, highlights, etc.)

### 🔍 User Discovery
- **Search Functionality**: Find users by username through the search modal
- **Profile Sharing**: Share profile links with others
- **Follow Counts**: See follower and following counts

## Usage

### Accessing Public Profiles
1. **Search**: Use the search icon in the navbar to find users
2. **Direct URL**: Visit `/u/username` to view a specific profile
3. **Profile Links**: Click on usernames in tournaments, teams, etc.

### Profile Privacy Settings
Users can control their profile visibility:
- **Public**: Anyone can view the profile
- **Friends**: Only followers can view the profile  
- **Private**: Profile is completely hidden from others

### Following System
- Click "Follow" on any public profile to follow that user
- View your own public profile by clicking "View Public Profile" in your profile settings
- See follower/following counts on profiles

## Technical Implementation

### Frontend Components
- `PublicProfile.jsx`: Main public profile component with Instagram-like design
- `UserSearch.jsx`: User search component (integrated into existing SearchModal)
- Updated `SearchModal.jsx`: Now includes user search results
- Updated `Profile.jsx`: Added "View Public Profile" button

### Backend Routes
- `GET /api/profile/public/:username`: Get public profile data
- `POST /api/profile/follow/:username`: Follow a user
- `DELETE /api/profile/follow/:username`: Unfollow a user
- `GET /api/profile/search`: Search users by username

### Database Schema
```sql
-- User follows table for follow relationships
CREATE TABLE user_follows (
  id SERIAL PRIMARY KEY,
  follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Add best_rank column to user_profiles
ALTER TABLE user_profiles ADD COLUMN best_rank VARCHAR(20) DEFAULT 'Bronze';
```

## Setup Instructions

### 1. Database Migration
Run the SQL script to create the necessary tables:
```bash
# Connect to your PostgreSQL database and run:
psql -d crackzone_db -f backend/scripts/create-user-follows-table.sql
```

### 2. Backend Setup
The backend routes are already integrated into `backend/routes/profile.js`. No additional setup needed.

### 3. Frontend Setup
The frontend components are already integrated. The public profile route is available at `/u/:username`.

## URL Structure
- **Own Profile**: `/profile` (private, editable)
- **Public Profile**: `/u/username` (public view of any user)
- **Search**: Use search modal accessible from navbar

## Privacy & Security
- Private profiles return 403 error when accessed by non-followers
- Users cannot follow themselves
- Follow relationships are stored securely with proper constraints
- Search only returns non-private profiles

## Future Enhancements
- **Posts System**: Allow users to share screenshots, highlights, and achievements
- **Stories**: Temporary content sharing
- **Direct Messaging**: Private messaging between users
- **Profile Verification**: Verified badges for notable players
- **Advanced Privacy**: More granular privacy controls
- **Activity Feed**: See updates from followed users

## Example Usage

### Viewing a Public Profile
```
Visit: https://yourapp.com/u/pro_gamer_123
```

### Searching for Users
1. Click search icon in navbar
2. Type username (minimum 3 characters)
3. Click on user result to view their profile

### Following Users
1. Visit any public profile
2. Click "Follow" button
3. User will see you in their followers list

This feature transforms CrackZone into a more social gaming platform where players can discover, follow, and engage with each other's gaming achievements and progress.