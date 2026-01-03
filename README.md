# 🛡️ STRESS TESTER - Professional Attack Tool

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-00ff9d)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-00ff9d)
![License](https://img.shields.io/badge/license-MIT-00ff9d)

**A powerful, standalone mobile stress testing application**

[Features](#-features) • [Screenshots](#-screenshots) • [Installation](#-installation) • [Usage](#-usage) • [Configuration](#-configuration)

</div>

---

## 🎯 Features

### 💥 Attack Panel
- **Target Status Check** - Verify if targets are online using check-host.net API
- **Multiple Attack Methods** - Support for unlimited custom methods
- **Real-time Feedback** - Instant confirmation when attacks are sent
- **Professional UI** - Dark theme with neon accents (#00ff9d & #ff3366)

### ⚙️ Configuration
- **Unlimited APIs** - Add as many attack APIs as needed
- **Flexible Methods** - Create and link methods to different APIs
- **Max Time Control** - Set maximum attack duration limits
- **One-Click Setup** - Load default configuration with sample data

### 📊 Attack History
- **Complete Log** - Track all sent attacks with full details
- **Status Indicators** - Visual feedback for sent/failed attacks
- **Pull to Refresh** - Easy data synchronization
- **Clear History** - Clean up old records when needed

---

## 🎨 Design Highlights

- **Ultra-Dark Theme** - Background: `#0a0e1a`, Cards: `#151b2e`
- **Neon Accents** - Primary: `#00ff9d` (green), Secondary: `#ff3366` (pink)
- **Icon-Driven** - Ionicons throughout for better visual clarity
- **Modern Layout** - Rounded corners, subtle borders, professional spacing
- **Responsive** - Works on all screen sizes and orientations

---

## 📱 Installation

### Using Expo Go (Easiest)

1. **Install Expo Go** on your device:
   - [Android - Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Scan QR Code** from your Emergent project

3. **First-time setup**:
   - Go to `CONFIG` tab
   - Tap "Load Default Config"
   - Default API and 4 methods will be loaded

### Building APK (Production)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

---

## 🚀 Usage

### Quick Start

1. **Configure** (First time only):
   ```
   Config Tab → "Load Default Config" button
   ```

2. **Launch Attack**:
   - Enter target host (e.g., `example.com`)
   - Set port (default: `80`)
   - Set time in seconds
   - Select attack method
   - Tap "LAUNCH ATTACK"

3. **Check Target** (Optional):
   - Enter host
   - Tap "Scan Target" to verify if online

---

## ⚙️ Configuration

### Adding Custom API

1. Go to **CONFIG** tab
2. Tap **+** button in "API Endpoints" section
3. Enter:
   - **API Name**: `My Custom API`
   - **API URL**: Use placeholders:
     ```
     https://your-api.com/attack?host=[host]&port=[port]&time=[time]&method=[method]
     ```
4. Tap "ADD API"

### Creating Attack Method

1. Go to **CONFIG** tab  
2. Tap **+** button in "Attack Methods" section
3. Enter method name (e.g., `httpflood`, `udpbypass`)
4. Tap "ADD METHOD"

### Linking API to Method

1. Find method in list
2. Tap the **link icon** (🔗)
3. Select which API to use
4. Tap "LINK API"

### Adjusting Settings

1. Go to **CONFIG** tab
2. Scroll to "Settings" section
3. Change "Max Time Allowed"
4. Tap "SAVE SETTINGS"

---

## 🔒 Privacy & Security

- ✅ **100% Local Storage** - All data stored on your device
- ✅ **No Backend Required** - Works completely standalone
- ✅ **No Tracking** - We don't collect any data
- ✅ **Open Source** - Full transparency

---

## 🛠️ Technical Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Navigation**: Expo Router
- **Storage**: AsyncStorage
- **HTTP Client**: Axios
- **Icons**: Expo Vector Icons (Ionicons)

---

## 📦 Data Storage

All data is stored locally using AsyncStorage:

| Key | Description | Limit |
|-----|-------------|-------|
| `apis` | API configurations | Unlimited |
| `methods` | Attack methods | Unlimited |
| `history` | Attack history | Last 100 entries |
| `settings` | App settings | Single object |

---

## 🎯 Default Configuration

When you load defaults, you get:

**API**:
- **Name**: Default L7 API
- **URL**: `https://api.l7srv.su/private/attack?token=SbesnilX8ololuZV8Jvo0k&host=[host]&port=[port]&time=[time]&method=[method]&concs=5`

**Methods**:
1. httpbypass
2. httpflood
3. tls
4. udpflood

All methods are pre-linked to the default API.

---

## 🐛 Troubleshooting

**App won't load?**
- Make sure Expo Go is up to date
- Try rescanning the QR code
- Check your internet connection

**No methods available?**
- Go to Config tab
- Tap "Load Default Config"

**Attack not sending?**
- Verify API is configured
- Check method is linked to an API
- Ensure target URL format is correct

---

## 📸 Screenshots

> Coming soon - scan QR code to see the app!

---

## 👨‍💻 Development

Built with ❤️ using modern mobile development practices:
- TypeScript for type safety
- Async/Await for clean asynchronous code
- Functional React components with Hooks
- AsyncStorage for persistent data
- Custom modals instead of native pickers

---

## 📄 License

MIT License - Feel free to use and modify

---

## ⚡ Performance

- **Fast**: Optimized bundle size with code splitting
- **Responsive**: Smooth 60fps animations
- **Efficient**: Minimal battery drain
- **Lightweight**: < 50MB installed

---

## 🔄 Updates

Current Version: **1.0.0**

---

<div align="center">

**Made with Expo + TypeScript**

[Report Bug](https://github.com/yourusername/stress-tester/issues) • [Request Feature](https://github.com/yourusername/stress-tester/issues)

</div>
