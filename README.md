# ELROI Predictive Maintenance Platform

A complete, production-grade frontend application for the ELROI Predictive Maintenance Platform built with Next.js 14, Tailwind CSS v4, and Supabase authentication.

## Features

- ✅ Complete Next.js 14 project (App Router)
- ✅ Tailwind CSS v4 setup (clean, no PostCSS)
- ✅ Pixel-perfect login page
- ✅ Dashboard page
- ✅ All four sensor pages (Temperature, Humidity, Pressure, Vibration)
- ✅ Alerts page
- ✅ Supabase authentication flow (Email + Password, Google OAuth)
- ✅ Environment variables in `.env.local`
- ✅ Clean architecture with reusable UI components
- ✅ Responsive design across all screen sizes
- ✅ Middleware protection for authenticated routes

## Tech Stack

- Next.js 14 (App Router)
- JavaScript (No TypeScript)
- Tailwind CSS v4
- Supabase Authentication
- React 18

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Create a Supabase project at https://supabase.com
   - Get your project URL and anon key from the Supabase dashboard
   - Update `.env.local` with your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
     ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── login/
│   ├── dashboard/
│   ├── sensors/
│   │   ├── temperature/
│   │   ├── humidity/
│   │   ├── pressure/
│   │   └── vibration/
│   ├── alerts/
│   ├── layout.js
│   └── page.js
├── lib/
│   └── supabase.js
├── middleware.js
├── .env.local
└── README.md
```

## Authentication

The application uses Supabase for authentication with:
- Email and password login
- Google OAuth login

All routes under `/dashboard`, `/sensors`, and `/alerts` are protected and require authentication.

## Deployment

To deploy this application, you can use Vercel, Netlify, or any other hosting platform that supports Next.js.

For Vercel deployment:
1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Set the environment variables in Vercel dashboard
4. Deploy!

## ELROI Design System

### Primary Colors
- Primary Deep Blue: `#0B1630` (logo, titles)
- Deep Gradient Start: `#0B1630`
- Deep Gradient End: `#081225`
- Accent Blue: `#2563eb` (buttons)
- Light Gray Text: `#A8B3C6`
- Muted Gray: `#94a3b8`
- White: `#ffffff`

### UI Components
- Rounded-lg / rounded-xl components
- Soft shadows
- Smooth hover transitions
- Large readable headings
- Clean minimal spacing
- Modern dashboard look similar to Microsoft / Datadog / Supabase

## Pages

### Login Page
- Full screen two-column layout
- Left panel with gradient background (hidden on mobile)
- Right panel with login form
- Email/password authentication
- Google OAuth option
- Responsive design

### Dashboard Page
- Top navigation bar with logo and user info
- Sensors overview in a grid layout
- Each sensor card with icon, title, description, and view button
- Clicking a sensor card navigates to the respective sensor detail page

### Sensor Detail Pages
- Temperature, Humidity, Pressure, and Vibration sensor pages
- Current sensor value display
- Live data graph placeholder
- Alert threshold section
- Back to dashboard button

### Alerts Page
- List of system alerts
- Color-coded severity indicators
- Alert details with timestamp

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)