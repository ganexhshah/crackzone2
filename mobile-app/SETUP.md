# CrackZone Mobile App Setup Guide

## Quick Start

### 1. Prerequisites
- Node.js (v16+)
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your phone

### 2. Installation
```bash
cd mobile-app
npm install
```

### 3. Configure API
Edit `src/services/api.js` and update the API URL:
```javascript
const API_BASE_URL = 'http://YOUR_IP:5000/api';
```

**Important**: Replace `YOUR_IP` with your computer's IP address (not localhost) so your phone can connect to the backend.

### 4. Start Development Server
```bash
npm start
```

### 5. Run on Device
- Scan the QR code with Expo Go app
- Or press 'a' for Android emulator
- Or press 'i' for iOS simulator (Mac only)

## Finding Your IP Address

### Windows
```bash
ipconfig
```
Look for "IPv4 Address" under your network adapter.

### Mac/Linux
```bash
ifconfig
```
Look for "inet" under your network interface (usually en0 or wlan0).

### Example
If your IP is `192.168.1.100`, update the API URL to:
```javascript
const API_BASE_URL = 'http://192.168.1.100:5000/api';
```

## Testing

1. Make sure your backend server is running on port 5000
2. Ensure your phone and computer are on the same WiFi network
3. Test login with existing credentials from your web app

## Troubleshooting

### "Network Error" or "Connection Refused"
- Check if backend server is running
- Verify IP address is correct
- Ensure phone and computer are on same network
- Try disabling firewall temporarily

### "Expo Go not loading"
- Make sure Expo CLI is installed globally
- Try clearing Expo cache: `expo r -c`
- Restart the development server

### "Module not found" errors
- Run `npm install` again
- Clear node_modules: `rm -rf node_modules && npm install`

## Building for Production

### Android APK
```bash
expo build:android
```

### iOS (requires Mac + Apple Developer account)
```bash
expo build:ios
```

## Features Available

✅ **Working Now:**
- User authentication (login/register)
- Tournament browsing and details
- Dashboard with user stats
- Profile management
- Beautiful dark theme UI

🚧 **Coming Soon:**
- Tournament registration
- Team management
- Wallet functionality
- Push notifications
- Real-time updates

## Support

If you encounter issues:
1. Check this troubleshooting guide
2. Ensure backend is running and accessible
3. Verify network connectivity
4. Check Expo documentation: https://docs.expo.dev/