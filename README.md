# Smart Door Lock - Expo App

A React Native Expo app for controlling a smart door lock system via ESP8266.

## Features

- Real-time door status monitoring
- Remote lock/unlock control
- Auto-refresh status every 5 seconds
- Configurable IP address and authentication key
- Modern, intuitive UI with status indicators
- Network error handling and user feedback

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device (for testing)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Use the Expo Go app on your mobile device to scan the QR code and run the app.

## Configuration

The app comes pre-configured with:
- Default IP Address: `192.168.1.100`
- Authentication Key: `DoorLock2024!Secure#Key789`

You can change these settings by tapping the settings icon in the top-right corner of the app.

## ESP8266 Integration

This app communicates with an ESP8266-based door lock controller that should expose the following endpoints:

- `GET /status?key={authKey}` - Returns current door status
- `GET /lock?key={authKey}` - Locks the door
- `GET /unlock?key={authKey}` - Unlocks the door

The ESP8266 should return JSON responses in the format:
```json
{
  "door": "locked" | "unlocked",
  "error": "optional error message"
}
```

## Network Requirements

- The mobile device and ESP8266 must be on the same WiFi network
- The ESP8266 should have a static IP address or be accessible via its assigned IP
- Ensure firewall settings allow HTTP connections to the ESP8266

## Troubleshooting

- **Connection Error**: Verify the IP address is correct and the ESP8266 is online
- **Authentication Error**: Check that the authentication key matches the ESP8266 configuration
- **Network Error**: Ensure both devices are on the same WiFi network

## Development

To run on specific platforms:
- iOS: `npm run ios`
- Android: `npm run android`
- Web: `npm run web`

## License

This project is for educational and personal use.
