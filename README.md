# Alpha Web App - Frontend MVP

An AI Agent with your Identity. Alpha processes conversational patterns and personality traits to create an AI agent that thinks, responds, and interacts just like you.

## 🚀 Features

### Landing Page

- Modern, minimalist design with dark theme
- Animated futuristic graphics with gradient orbs
- Alpha logo and "Access Beta" call-to-action
- Responsive design for all devices

### Authentication

- Simple email-based login simulation
- Beta access for all email formats (demo purposes)
- Secure session management with localStorage
- Automatic redirects based on authentication state

### Chat Dashboard

- **Dylan IdentityX Agent**: AI agent with Dylan's personality
- Real-time chat interface using assistant-ui
- Thread management and conversation history
- Conversation starters tailored to Dylan's background
- Responsive sidebar with thread list

### Admin Dashboard

- Protected admin-only access (`admin@alpha.com`)
- View all user conversations across the platform
- Sort threads by last updated timestamp
- Detailed conversation view with message timestamps
- User activity monitoring

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Chat Interface**: assistant-ui library
- **Icons**: Lucide React
- **State Management**: React Context + useState
- **Date Formatting**: date-fns

## 📦 Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd alpha-frontend-trial-run
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 Usage

### For Regular Users

1. **Landing Page**: Visit the homepage to see the Alpha introduction
2. **Access Beta**: Click "Access Beta" to sign in
3. **Login**: Enter any email address (all emails accepted for demo)
4. **Chat**: Start conversations with Dylan IdentityX agent
5. **Explore**: Try the conversation starters or ask your own questions

### For Admins

1. **Admin Access**: Login with `admin@alpha.com`
2. **Dashboard**: View all user conversations in the admin panel
3. **Monitor**: Click on any conversation to view detailed messages
4. **Analytics**: See conversation counts and activity timestamps

## 🤖 Dylan IdentityX Agent

Dylan is a 26-year-old software engineer living in NYC with a rich international background:

- **Background**: Grew up in Mauritius, Australia, and Singapore
- **Profession**: Software engineer in Manhattan
- **Interests**: Rugby, travel, technology
- **Personality**: Friendly, knowledgeable, internationally-minded

### Sample Conversations

- Ask about his experience living in different countries
- Discuss React and modern web development
- Learn about life as a software engineer in NYC
- Talk about rugby and sports

## 🎨 Design Features

- **Dark Theme**: Modern black background with white text
- **Gradient Accents**: Blue to purple gradients throughout
- **Animated Graphics**: Mouse-responsive floating orbs and particles
- **Glass Morphism**: Backdrop blur effects for modern UI
- **Responsive**: Works seamlessly on desktop, tablet, and mobile

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Landing page
│   ├── login/             # Authentication
│   ├── dashboard/         # Main chat interface
│   ├── admin/             # Admin dashboard
│   └── api/chat/          # Mock chat API
├── components/
│   ├── landing/           # Landing page components
│   ├── auth/              # Authentication components
│   ├── assistant-ui/      # Chat interface components
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── auth-context.tsx   # Authentication state
│   ├── dummy-data.ts      # Mock data and Dylan responses
│   └── utils.ts           # Utility functions
└── types/
    └── index.ts           # TypeScript type definitions
```

## 🔧 Development

### Key Components

- **Navigation**: Fixed header with logo and access button
- **HeroSection**: Main landing page content with CTA
- **FuturisticGraphic**: Animated background elements
- **LoginForm**: Email authentication with loading states
- **Thread**: Chat interface using assistant-ui
- **ThreadList**: Conversation history sidebar

### Mock Data

The application includes realistic dummy data:

- 5 sample users with varied email addresses
- Multiple conversation threads per user
- Dylan's personality-driven responses
- Realistic timestamps and conversation flow

### API Endpoints

- `POST /api/chat`: Mock chat endpoint that generates Dylan's responses
- Simulates typing delays for realistic chat experience
- Keyword-based response selection for contextual replies

## 🚀 Deployment

This is a frontend-only MVP. To deploy:

1. Build the application:

```bash
npm run build
```

2. Deploy to your preferred platform (Vercel, Netlify, etc.)

## 📝 Notes

- This is a **frontend MVP** with simulated backend functionality
- All authentication is mocked for demonstration purposes
- Chat responses are generated client-side using predefined patterns
- No real data persistence - uses localStorage for session management

## 🎉 Demo Credentials

- **Regular User**: Any email address (e.g., `user@example.com`)
- **Admin Access**: `admin@alpha.com`

---

Built with ❤️ using Next.js, TypeScript, and assistant-ui
