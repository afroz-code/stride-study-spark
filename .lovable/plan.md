

# Smart Routine Management System – Student Productivity Suite

A premium, dark-themed SaaS-style student productivity platform with full Supabase backend for real authentication and cloud data persistence.

---

## 1. Authentication & User Profiles
- Modern dark-themed login/signup pages with email authentication
- User profiles table storing display name, avatar, and preferences
- Protected routes — unauthenticated users redirected to login
- Profile settings page to update name and preferences

## 2. Main Dashboard
- Personalized welcome with student name and motivational quote
- Summary stat cards with smooth animations: Today's Tasks, Completed Tasks, Study Hours, Focus Score, Productivity Percentage
- Weekly performance chart (bar/line graph using Recharts)
- Clean sidebar navigation: Dashboard, Daily Planner, Focus Mode, Analytics, Insights, Settings
- Dark glassmorphism card design with subtle gradients and glow effects

## 3. Smart Daily Planner
- Add, edit, and delete tasks with title, description, priority (Low/Medium/High), and deadline
- Mark tasks as completed with visual feedback
- Daily progress bar showing completion percentage
- Drag-and-drop task reordering
- Tasks stored in Supabase with per-user RLS policies
- Filter/sort by priority and status

## 4. Focus Mode (Study Session Tracker)
- Full-screen minimal focus timer (start/pause/stop)
- Pomodoro-style or free-form timer options
- Session history saved to database with duration and date
- Daily and weekly study time statistics displayed on dashboard

## 5. Productivity Analytics
- Dynamic charts using Recharts (already installed):
  - Study hours trend (daily/weekly line chart)
  - Task completion rate (bar chart)
  - Weekly performance score
- Productivity grading system (A/B/C/D based on completion rate and study hours)
- Date range filtering for analytics

## 6. Smart Insights
- Auto-generated suggestions based on user data patterns:
  - Peak study time detection ("You're most productive in the evening")
  - Drop-off warnings ("Your productivity drops after 8 PM")
  - Improvement tips based on trends
- Displayed as cards on the dashboard and a dedicated insights page

## 7. Design & UX
- Dark theme with vibrant blue/purple accent colors
- Glassmorphism cards with backdrop blur and subtle borders
- Smooth page transitions and fade-in animations
- Loading skeletons for data-heavy sections
- Fully responsive: mobile, tablet, and desktop layouts
- Professional SaaS typography and spacing
- Collapsible sidebar with icons in mini mode

## 8. Database Schema (Supabase)
- **profiles** — user display info (linked to auth.users)
- **tasks** — daily planner tasks with priority, status, deadline, sort order
- **study_sessions** — focus mode session logs with start time, duration
- All tables protected with row-level security (users access only their own data)

