# MONOklix / ESAIE - Multi-Branding Unified Platform

All-in-one AI platform powered by MONOklix and ESAIE!

**Unified version that works for both brands (ESAIE.TECH and MONOKLIX.COM), supporting both Electron (Desktop) and Web deployment.**

## 🎯 Multi-Branding System

This application supports **two distinct brands** from a single codebase:

### ESAIE.TECH
- **Domain**: `esaie.tech` (and subdomains)
- **Supabase Project**: `ttohyacakvrdtuarqbwf.supabase.co`
- **Flow Account Prefix**: `E` (E1, E2, E3, etc.)
- **Proxy Servers**: `s1-s5.esaie.tech` (5 servers)
- **Database Tables**: `users` table only (single source of truth)
- **Token Management**: 
  - ✅ Personal Auth Token (editable)
  - ✅ Master Anti-Captcha Token (always, read-only)
  - ❌ Token Ultra (not available)
- **Features**: 
  - Always shows "Generate NEW Token" button
  - Always uses master token for reCAPTCHA (read-only)
  - Simplified token management (no Token Ultra)

### MONOKLIX.COM
- **Domain**: `monoklix.com` (and subdomains)
- **Supabase Project**: `xbbhllhgbachkzvpxvam.supabase.co`
- **Flow Account Prefix**: `G` (G1, G2, G3, etc.)
- **Proxy Servers**: `s1-s12.monoklix.com` (12 servers)
- **Database Tables**: `users` + `token_new_active` + `token_imagen_only_active` + `ultra_ai_email_pool` + `master_recaptcha_tokens`
- **Token Management**:
  - ✅ Personal Auth Token (editable)
  - ✅ Token Ultra subscription (RM21.50 with ToyyibPay fee)
  - ✅ Master reCAPTCHA token (conditional, based on Token Ultra + `allow_master_token`)
- **Features**:
  - Token Ultra subscription service (RM20/month, RM21.50 with processing fee)
  - Conditional token generation UI (based on Token Ultra status)
  - Token pool assignment from `token_new_active` table
  - Email pool management for Token Ultra users

### Shared Resources
- **API Backend**: `api.monoklix.com` (shared by both brands)
- **Video Tutorials**: Hosted on `monoklix.com/wp-content/` (unchanged for both)

## 🚀 Features

### Core Features
- ✅ **Multi-Branding Support** - Single codebase for ESAIE and MONOKLIX
- ✅ **Auto-Brand Detection** - Environment variable or domain-based detection
- ✅ **Brand-Aware Configuration** - Dynamic theming, logos, and domain handling
- ✅ **Separated Supabase Projects** - Isolated data per brand
- ✅ **Unified Codebase** - One codebase for both Electron and Web
- ✅ **Auto-Environment Detection** - Automatically detects if running in Electron or Web
- ✅ **Same UI** - Identical user interface for both platforms
- ✅ **Server Health Check** - Real-time status indicator for operational servers
- ✅ **System Activity Log** - Real-time console log monitoring with debug toggle

### AI Services

#### 🎬 Video Generation
- **Veo 3** - Text-to-Video and Image-to-Video generation
- Video status tracking and download
- Video cache management
- **Video Combiner** - Available in Electron and localhost (requires FFmpeg)

#### 🖼️ Image Generation
- **Imagen 3.5** - Text-to-Image generation
  - Multiple aspect ratios (Portrait, Landscape, Square)
  - Negative prompts support
  - Reference images (Image-to-Image)
  - Image upscaling
- **NANOBANANA 2** - Google's GEM_PIX_2 model
  - Text-to-Image generation
  - Image-to-Image with reference images
  - Multiple aspect ratios
  - Image download via proxy (CORS bypass)
  - Gallery integration with base64 storage

#### 📝 Text Generation
- **Gemini** - Text generation and chat interface
- Multiple AI models support
- Creative direction controls

#### 🎨 Content Creation
- Marketing Copy Generator
- Social Post Studio
- Product Ad Generator
- Product Review Generator
- Content Ideas Generator
- Prompt Library Management

### 🔐 Authentication & Security

#### Token Management

##### Personal Auth Token
- **Both Brands**: Manual token management via Flow Login
- **ESAIE**: Always shows "Generate NEW Token" button
- **MONOKLIX**: Conditional display based on Token Ultra status

##### Token Ultra (MONOKLIX Only)
- **Price**: RM20/month (RM21.50 with ToyyibPay processing fee)
- **Payment**: Integrated ToyyibPay order form
- **Features**:
  - Automatic token generation
  - Master reCAPTCHA token support (if `allow_master_token = true`)
  - `allow_master_token` preference control
  - Email credentials management from `ultra_ai_email_pool`
  - Status tracking: `active`, `expired`, `expiring_soon`
  - Auto-registration after successful payment

##### Master Token
- **ESAIE**: Always uses master Anti-Captcha API key (read-only, cannot edit)
- **MONOKLIX**: Conditional - only for Token Ultra users with `allow_master_token = true` (read-only)

##### reCAPTCHA Token
- Automatic injection for protected endpoints (Veo, NANOBANANA 2)
- **ESAIE**: Always uses master token
- **MONOKLIX**: 
  - Master token for Token Ultra users (if `allow_master_token = true`)
  - Personal token fallback for others
- Anti-Captcha API integration

#### Flow Login Features
- Manual token input and save
- "Generate NEW Token" - Automatic token generation from server
  - **ESAIE**: Always visible
  - **MONOKLIX**: Conditional - visible for Token Ultra active users
- "Health Test" - Comprehensive token testing
- "Video Tutorial" - Login Google Flow tutorial video
- Auto-hide "Login Google Flow" buttons for active Token Ultra users (MONOKLIX only)
- Token Ultra registration panel (MONOKLIX only) - ToyyibPay integration

### 📊 User Management

#### Token Management Suite
- **User Management** - Admin panel for user management
  - Brand-aware filtering (E folders for ESAIE, G folders for MONOKLIX)
  - Flow code assignment
  - Subscription expiry management
  - Manual expiry date input
- **Cookie Pool Management** - Cookie management with statistics
  - Brand-aware folder filtering
  - Usage statistics integration
  - Most used cookie tracking
- **Flow Account Management** - Google Flow account management
  - Brand-aware code generation (E1-E5 for ESAIE, G1-G12 for MONOKLIX)
  - Up to 10 users per flow account
- **API Requests History** - Track API usage with brand-aware filtering
  - Reset history functionality
- **Token Dashboard** - Overview statistics
  - Brand-specific statistics (users, cookies, requests, flow accounts)

## 📦 Installation

```bash
npm install
```

### Server Setup
```bash
cd server
npm install
```

### Backend Setup (Python)
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

## 🛠️ Development

### Brand-Specific Development

#### Start ESAIE Version
```bash
# Windows
start-esaie.bat

# Or manually:
npm run dev:esai
# Backend (in separate terminal):
cd backend
set BRAND=esai
python web_dashboard.py
```

#### Start MONOKLIX Version
```bash
# Windows
start-monoklix.bat

# Or manually:
npm run dev:monoklix
# Backend (in separate terminal):
cd backend
python web_dashboard.py  # Defaults to MONOKLIX
```

### Environment Files
- `.env.esai` - Contains `VITE_BRAND=esai` for ESAIE development
- `.env.monoklix` - Contains `VITE_BRAND=monoklix` for MONOKLIX development

### Using start.bat (Windows - Generic)
```bash
start.bat
```
This starts the default version (MONOKLIX) with both React dev server and backend server.

## 🏗️ Building

### Build for ESAIE
```bash
npm run build:esai
```

### Build for MONOKLIX
```bash
npm run build:monoklix
```

Build output will be in the `dist/` directory.

## 🔧 Technical Details

### Brand Detection Priority
1. **Environment Variable**: `VITE_BRAND` (esai/monoklix)
2. **Electron localStorage**: `electron_brand` (for runtime switching)
3. **Domain Auto-Detection**: Based on `window.location.hostname`
4. **Default**: MONOKLIX (if none detected)

### Supabase Configuration
- **ESAIE**: `ttohyacakvrdtuarqbwf.supabase.co`
- **MONOKLIX**: `xbbhllhgbachkzvpxvam.supabase.co`
- Both use `users` table as **single source of truth** in separate Supabase projects
- **ESAIE Tables**: `users`, `master_recaptcha_tokens`, `api_requests`, `cookie_usage_stats`
- **MONOKLIX Tables**: `users`, `token_new_active`, `token_imagen_only_active`, `ultra_ai_email_pool`, `master_recaptcha_tokens`, `api_requests`, `cookie_usage_stats`
- Automatic switching based on detected brand
- **Migration Note**: `token_ultra_registrations` table migrated to `users` table (both brands now use `users` only)

### Environment Detection
The app automatically detects:
- **Electron**: `window.location.protocol === 'file:'` or Electron user agent
- **Web Localhost**: `hostname === 'localhost'` or `127.0.0.1`
- **Web Production**: 
  - ESAIE: `app.esaie.tech`, `dev.esaie.tech`, or `*.esaie.tech`
  - MONOKLIX: `app.monoklix.com`, `dev.monoklix.com`, or `*.monoklix.com`

### Server Configuration
- **Electron**: Always uses `localhost:3001`
- **Web ESAIE**: Supports `s1-s5.esaie.tech` (5 servers)
- **Web MONOKLIX**: Supports `s1-s12.monoklix.com` (12 servers)
- Server usage tracking and statistics
- Health check endpoint (`/health`)

### API Endpoints

#### Client-side Services
- `services/veo3Service.ts` - Veo 3 video generation
- `services/imagenV3Service.ts` - Imagen 3.5 image generation
- `services/nanobanana2Service.ts` - NANOBANANA 2 image generation
- `services/geminiService.ts` - Gemini text generation
- `services/apiClient.ts` - Unified API client with reCAPTCHA injection

#### Server Endpoints (`server/index.js`)
- `/api/veo/generate-t2v` - Veo Text-to-Video
- `/api/veo/generate-i2v` - Veo Image-to-Video
- `/api/veo/status` - Video status check
- `/api/veo/download` - Video download (CORS bypass)
- `/api/imagen/generate` - Imagen image generation
- `/api/imagen/upload` - Image upload for Imagen
- `/api/imagen/run-recipe` - Imagen image editing
- `/api/nanobanana/generate` - NANOBANANA 2 image generation
- `/api/nanobanana/download-image` - Image download proxy (CORS bypass)
- `/api/video/combine` - Video combiner (requires FFmpeg)
- `/health` - Server health check

#### Backend Endpoints (`backend/web_dashboard.py`)
- `/api/generate-token-for-user` - Generate token for user
- `/api/cookies` - Cookie management
- `/api/api-requests` - API requests history (GET/DELETE)
- Brand-aware Supabase integration

### reCAPTCHA Token Injection
- **Veo**: Injected in top-level `clientContext.recaptchaToken`
- **NANOBANANA 2**: Injected in top-level `clientContext.recaptchaToken` (same as Veo)
- **Imagen**: No reCAPTCHA required
- Automatic token generation via Anti-Captcha API
- **ESAIE**: Always uses master token (read-only, auto-fetched from `master_recaptcha_tokens`)
- **MONOKLIX**: 
  - Master token for Token Ultra users with `allow_master_token = true` (read-only)
  - Personal token for others (editable)

## 📁 Project Structure

```
VERSION ALL NEW + TOKEN GEN/
├── components/          # React components
│   ├── common/         # Shared components
│   └── views/          # View components
│       ├── token-management/  # Token management suite
│       └── ...
├── services/           # Service layer
│   ├── brandConfig.ts  # Brand configuration and detection
│   ├── supabaseClient.ts  # Brand-aware Supabase client
│   ├── apiClient.ts    # Unified API client
│   ├── userService.ts  # User management (brand-aware)
│   └── ...
├── backend/            # Python backend
│   ├── web_dashboard.py  # Flask server with brand detection
│   ├── config.py       # Brand-aware backend config
│   ├── flow_account_manager.py  # Brand-aware flow account codes
│   └── ...
├── server/             # Node.js backend
│   └── index.js        # Express server
├── start-esaie.bat     # Start ESAIE version
├── start-monoklix.bat  # Start MONOKLIX version
├── .env.esai           # ESAIE environment variables
├── .env.monoklix       # MONOKLIX environment variables
├── types.ts            # TypeScript types
├── App.tsx             # Main app component
└── index.tsx           # Entry point
```

## 🔑 Configuration

### Environment Variables
- `VITE_BRAND` - Brand identifier (esai/monoklix)
- `BRAND` - Backend brand identifier (for Python backend)

### Service Configuration
- `services/brandConfig.ts` - Central brand configuration
- `services/appConfig.ts` - Application version and API URLs
- `services/serverConfig.ts` - Brand-aware proxy server configuration
- `services/environment.ts` - Brand-aware environment detection
- `services/supabaseClient.ts` - Brand-aware Supabase connection

### Backend Configuration
- `backend/config.py` - Brand-aware Supabase configs
- `backend/web_dashboard.py` - Brand-aware user management
- `backend/flow_account_manager.py` - Brand-aware flow account code generation

## 📝 Recent Updates

### Database Migration (Latest)
- ✅ Migrated `token_ultra_registrations` to `users` table
- ✅ Both brands now use `users` table as single source of truth
- ✅ Added `token_ultra_status`, `email_code`, `expires_at`, `registered_at`, `allow_master_token` to `users` table
- ✅ Removed dependency on `token_ultra_registrations` table
- ✅ Migrated `api_requests.json` and `cookie_usage.json` to Supabase tables
- ✅ Disabled local JSON file sync (Supabase-only now)

### Token Ultra Enhancements (MONOKLIX)
- ✅ ToyyibPay payment integration (RM21.50 with processing fee)
- ✅ Auto-registration after successful payment
- ✅ Payment return handler with automatic token assignment
- ✅ Editable amount field in registration form
- ✅ Email pool assignment from `ultra_ai_email_pool`

### User Status Enforcement
- ✅ Block inactive users from login, token generation, and AI generation
- ✅ Block expired subscription users
- ✅ MONOKLIX: Allow login with expired Token Ultra, but block token/AI generation
- ✅ Brand-aware status checking

### Multi-Branding System
- ✅ Complete multi-branding implementation (ESAIE & MONOKLIX)
- ✅ Brand-aware Supabase project switching
- ✅ Dynamic theming and logos
- ✅ Brand-aware flow account codes (E/G prefixes)
- ✅ Cookie folder filtering by brand
- ✅ Token management suite with brand awareness
- ✅ Separate user tables per Supabase project
- ✅ Brand-aware proxy server configuration
- ✅ Environment-based brand detection

### Token Management Suite
- ✅ User Management with brand-aware filtering
- ✅ Cookie Pool Management with statistics
- ✅ Flow Account Management with brand-aware codes
- ✅ API Requests History with brand filtering
- ✅ Token Dashboard with brand-specific stats

### NANOBANANA 2 Integration
- ✅ Full text-to-image and image-to-image support
- ✅ Reference image upload and processing
- ✅ Image download via proxy (CORS bypass)
- ✅ Gallery integration with base64 storage
- ✅ Aspect ratio controls
- ✅ reCAPTCHA token injection (top-level only, same as Veo)

### FAQ Page
- ✅ New FAQ page in Settings tab
- ✅ Categorized issues and solutions
- ✅ Image carousel for visual guides
- ✅ Introduction section explaining platform
- ✅ "PM Admin" button with pre-filled message

### UI Improvements
- ✅ Preview modal full height display
- ✅ Close button always visible
- ✅ System Activity Log with debug toggle
- ✅ Server health status indicator
- ✅ Brand-aware dynamic theming

### Code Cleanup
- ✅ Removed duplicate brand detection logic
- ✅ Brand-aware localStorage keys
- ✅ Unified reCAPTCHA injection logic
- ✅ Consistent error handling

## 🐛 Known Limitations

### 2K/4K Image Generation
- NANOBANANA 2 2K/4K download feature is currently on hold
- API may require different endpoint or parameters
- Client-side upscaling implementation available but not activated

### Video Combiner
- Only available in Electron and localhost environments
- Requires FFmpeg installation
- Hidden in production web environment

## 📄 License

Private - All rights reserved

## 🔗 Links

### MONOKLIX
- Production: `https://app.monoklix.com`
- Development: `https://dev.monoklix.com`
- API: `https://api.monoklix.com` (shared)

### ESAIE
- Production: `https://app.esaie.tech`
- Development: `https://dev.esaie.tech`
- API: `https://api.monoklix.com` (shared)

## 👨‍💻 Development Notes

- UI is identical for both Electron and Web versions
- Behavior adapts automatically based on detected environment
- Brand detection happens at module load and can be overridden
- Supabase client is initialized once per app load (brand-specific)
- All features from both previous versions are included
- Server selection is available in both versions (but Electron only shows localhost)
- Cookie folders are filtered by brand (E folders for ESAIE, G folders for MONOKLIX)

## 📚 Additional Documentation

- **[README2.md](./README2.md)** - Detailed comparison between ESAIE and MONOKLIX brands
- **[DEVELOPMENT_NOTES.md](./DEVELOPMENT_NOTES.md)** - Development notes and technical details
- **[USER_GUIDE.md](./USER_GUIDE.md)** - User guide for both brands

For detailed brand differences, see [README2.md](./README2.md)
