# CBT System - Computer Based Test Platform

An advanced Computer Based Test system with AI scoring, real-time monitoring, and comprehensive test management features.

## Features

### Core Features
- ✅ Multi-role system (Admin, Instructor, Student)
- ✅ 6 question types (MCQ, Essay, Matching, Fill-blank, True/False, Image Recognition)
- ✅ Media support (images, videos, audio, PDF)
- ✅ Advanced security (lock screen, webcam, tab monitoring, keyboard/mouse tracking)
- ✅ AI-powered essay scoring (Claude API)
- ✅ Real-time monitoring dashboard
- ✅ Analytics & reporting (test, student, class, system)
- ✅ Local network deployment (Docker)
- ✅ Cloud deployment (AWS, Vercel, GCP, DigitalOcean)
- ✅ Offline capability (Service Worker, IndexedDB)
- ✅ Mobile-responsive design
- ✅ 2FA authentication

### Security Features
- Full-screen enforcement
- Right-click & context menu disabled
- Developer tools detection
- Copy-paste prevention
- Keyboard shortcut blocking
- Tab switch detection
- Window focus loss detection
- Screenshot detection
- Multiple tab prevention
- Webcam proctoring (optional)
- Face detection & identity verification
- Mouse movement pattern tracking
- Keyboard pattern analysis

## Tech Stack

- **Frontend/Backend**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB
- **Auth**: NextAuth.js with 2FA
- **AI Scoring**: Claude API
- **Real-time**: Socket.io
- **State Management**: Zustand
- **Validation**: Zod
- **Charts**: Chart.js
- **Drag & Drop**: React DnD
- **Rich Text Editor**: React Quill

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- MongoDB (local or Atlas)
- Docker (for containerized deployment)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-repo/cbt-system.git
cd cbt-system
```

2. Install dependencies:

```bash
npm install --legacy-peer-deps
```

3. Create a `.env` file from the example:

```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:

```env
MONGODB_URI=mongodb://localhost:27017/cbt-system
NEXTAUTH_SECRET=your-super-secret-key-here-at-least-32-characters-long
NEXTAUTH_URL=http://localhost:3000
CLAUDE_API_KEY=your-claude-api-key-here
```

### Running the Application

#### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

#### Production Mode

```bash
npm run build
npm run start
```

### Docker Deployment

1. Build and start the containers:

```bash
docker-compose up -d --build
```

2. The application will be available at `http://localhost:3000`

3. To stop the containers:

```bash
docker-compose down
```

## Project Structure

```
cbt-system/
├── app/                  # Next.js app router pages
│   ├── (auth)/           # Authentication pages
│   ├── (admin)/          # Admin dashboard pages
│   ├── (instructor)/     # Instructor portal pages
│   ├── (student)/        # Student portal pages
│   └── api/              # API routes
├── components/           # Reusable components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── tests/            # Test-related components
│   ├── questions/        # Question components
│   ├── users/            # User management components
│   ├── classes/          # Class management components
│   ├── analytics/        # Analytics components
│   └── common/           # Common UI components
├── lib/                  # Library functions
│   ├── auth/             # Authentication utilities
│   ├── database/         # Database connection
│   ├── models/           # MongoDB models
│   ├── utils/            # Utility functions
│   ├── api/              # API utilities
│   ├── constants/        # Constants
│   ├── hooks/            # Custom hooks
│   ├── validations/      # Validation schemas
│   └── ai/               # AI-related functions
├── public/               # Public assets
│   ├── assets/           # Static assets
│   ├── images/           # Images
│   └── uploads/          # File uploads
├── styles/               # CSS styles
├── config/               # Configuration files
└── .env.example          # Environment variables example
```

## Database Models

The system includes comprehensive MongoDB models:

- **User**: User accounts with roles (admin, instructor, student)
- **Test**: Test definitions with settings and questions
- **Question**: Question bank with 6 question types
- **Class**: Class management with students and instructors
- **TestSession**: Active test sessions with monitoring data
- **StudentAnswer**: Student answers with scoring
- **TestResult**: Test results with grades and feedback
- **SecurityEvent**: Security incidents and alerts
- **Settings**: System configuration
- **AuditLog**: Activity logging

## Authentication

The system uses NextAuth.js with:

- Email/password authentication
- 2FA (Time-based One-Time Password)
- JWT session management
- Role-based access control
- Session timeout and refresh

## Security Features

### Browser Security

- Full-screen mode enforcement
- Right-click and context menu disabled
- Developer tools detection
- Copy-paste prevention
- Keyboard shortcut blocking
- Tab switch detection
- Window focus loss detection

### Monitoring

- Real-time activity tracking
- Security event logging
- Suspicious pattern detection
- IP address monitoring
- Multiple device detection

### Webcam Proctoring (Optional)

- Face detection
- Identity verification
- Continuous monitoring
- Alert system

## API Endpoints

The system provides comprehensive API endpoints:

- `/api/auth/*` - Authentication endpoints
- `/api/tests/*` - Test management
- `/api/users/*` - User management
- `/api/classes/*` - Class management
- `/api/results/*` - Results and grading
- `/api/monitoring/*` - Real-time monitoring

## Deployment Options

### Local Network Deployment

1. **Docker**: Use the provided `docker-compose.yml` for easy local deployment
2. **Direct Node.js**: Run with `npm run start` after building

### Cloud Deployment

1. **Vercel**: Optimized for Next.js deployment
2. **AWS**: EC2, ECS, or Lambda
3. **Google Cloud**: Cloud Run or Compute Engine
4. **DigitalOcean**: Droplets or App Platform

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/cbt-system

# NextAuth.js Configuration
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Claude API Configuration
CLAUDE_API_KEY=your-claude-api-key-here

# Security Configuration
ENCRYPTION_KEY=your-32-character-encryption-key
CORS_ORIGINS=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./public/uploads
```

### System Settings

Configure system settings through the admin dashboard:

- Test settings (duration, scoring, attempts)
- Security settings (lock screen, monitoring levels)
- Email configuration
- AI API settings
- Backup settings

## Testing

The system includes comprehensive testing:

- **Unit Tests**: Core functionality
- **Integration Tests**: API endpoints and database
- **E2E Tests**: User flows and scenarios
- **Security Testing**: Vulnerability scanning
- **Performance Testing**: Load and stress testing

## Documentation

Comprehensive documentation is available:

- **Technical Documentation**: Architecture, API reference
- **User Guides**: Admin, Instructor, Student manuals
- **Deployment Guides**: Local and cloud deployment
- **Video Tutorials**: System overview and usage

## Support

For issues and questions:

- Check the documentation
- Review the FAQ
- Contact support team

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please follow the contributing guidelines.

## Roadmap

Future enhancements:

- Mobile app integration
- Offline mode improvements
- Advanced analytics
- AI-powered question generation
- Plagiarism detection
- Multi-language support
- Accessibility improvements