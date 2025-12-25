# CrackZone Mobile App

A React Native + Expo mobile application for the CrackZone gaming platform.

## Features

- **Authentication**: Login and registration with secure token storage
- **Dashboard**: Overview of user stats and upcoming tournaments
- **Tournaments**: Browse, search, and join gaming tournaments
- **Teams**: Create and manage gaming teams (Coming Soon)
- **Wallet**: Manage gaming funds and transactions (Coming Soon)
- **Profile**: User profile management and settings

## Tech Stack

- **React Native** with **Expo**
- **React Navigation** for navigation
- **Expo Linear Gradient** for beautiful gradients
- **Expo Vector Icons** (Ionicons)
- **Axios** for API calls
- **Expo Secure Store** for secure token storage

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device (for testing)

### Installation

1. Navigate to the mobile app directory:
   ```bash
   cd mobile-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the API base URL in `src/services/api.js`:
   ```javascript
   const API_BASE_URL = 'http://YOUR_BACKEND_IP:5000/api';
   ```
   Replace `YOUR_BACKEND_IP` with your actual backend server IP address.

### Running the App

1. Start the Expo development server:
   ```bash
   npm start
   ```

2. Scan the QR code with the Expo Go app on your mobile device

### Building for Production

#### Android APK
```bash
expo build:android
```

#### iOS IPA (requires Apple Developer account)
```bash
expo build:ios
```

## Project Structure

```
mobile-app/
├── src/
│   ├── constants/          # App constants (colors, layout)
│   ├── contexts/           # React contexts (auth)
│   ├── navigation/         # Navigation configuration
│   ├── screens/           # App screens
│   │   ├── auth/          # Authentication screens
│   │   └── main/          # Main app screens
│   └── services/          # API services
├── assets/                # Static assets
├── App.js                 # Main app component
└── app.json              # Expo configuration
```

## API Integration

The mobile app connects to the same backend API as the web application. Make sure your backend server is running and accessible from your mobile device.

### API Configuration

Update the `API_BASE_URL` in `src/services/api.js` to point to your backend server:

- For local development: `http://YOUR_LOCAL_IP:5000/api`
- For production: `https://your-domain.com/api`

## Features Status

- ✅ Authentication (Login/Register)
- ✅ Dashboard with stats
- ✅ Tournament browsing and details
- 🚧 Tournament registration
- 🚧 Team management
- 🚧 Wallet functionality
- 🚧 Profile editing
- 🚧 Notifications

## Design System

The app uses a consistent design system with:

- **Dark theme** with CrackZone branding
- **Golden yellow** accent color (#ffd700)
- **Consistent spacing** and typography
- **Smooth gradients** and modern UI elements

## Contributing

1. Follow the existing code structure and naming conventions
2. Use the established color scheme and layout constants
3. Ensure all new screens follow the same navigation patterns
4. Test on both iOS and Android devices

## Deployment

### Android Play Store
1. Build the APK: `expo build:android`
2. Download the APK from Expo
3. Upload to Google Play Console

### iOS App Store
1. Build the IPA: `expo build:ios`
2. Download the IPA from Expo
3. Upload to App Store Connect using Xcode or Application Loader

## Support

For issues and questions, please refer to the main project documentation or create an issue in the project repository.