# Member Base App

Member Base App - Closepay Application

## Quick Start

### Prerequisites
- Node.js >= 20
- React Native development environment set up
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Setup

**Windows:**
```batch
setup.bat
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

### Running the App

**Start Metro Bundler:**
```bash
npm start
```

**Run on Android:**
```bash
npm run android
```

**Run on iOS:**
```bash
npm run ios
```

## Project Structure

```
member-base-app/
├── apps/
│   └── member-base/          # App source code
│       ├── config/
│       │   └── app.config.ts   # App configuration
│       └── src/
├── packages/
│   ├── core/                   # Core modules
│   └── plugins/                # Enabled plugins
├── android/                    # Android native code
├── ios/                        # iOS native code
├── assets/                     # Assets (fonts, images)
└── tools/
    └── app-manager/            # App management tools
```

## Configuration

App configuration is located in `apps/member-base/config/app.config.ts`.

To update configuration, use the app manager:
```bash
tools/app-manager/manage.bat sync member-base
```

## Development

See the main repository documentation for development guidelines.

## License

Private - Member Base App
