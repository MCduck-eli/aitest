# Multi-Tenant Admin Panel System

Complete multi-tenant system for managing AI proctoring exams across multiple training centers.

## Features

### Admin Panel Features
- **Training Center Registration & Login** - Register training centers with admin accounts
- **Test Management** - Create, edit, delete tests/exams
- **Question Management** - Add questions with multiple choice options
- **Student Results Dashboard** - View comprehensive exam results and analytics
- **Proctoring Violation Tracking** - Monitor suspicious activities during exams
- **Analytics Dashboard** - Real-time statistics on pass rates, student performance
- **Multi-Tenant Support** - Complete data isolation between training centers

## Architecture

### Backend (Express + TypeScript + PostgreSQL)

**Database Schema:**
- `training_centers` - Training center organizations
- `users` - Admin, teachers, and students
- `test_banks` - Exam/test definitions
- `questions` - Individual questions
- `answer_options` - Question answer choices
- `exam_results` - Student exam attempts and scores
- `student_answers` - Individual student answers
- `proctoring_violations` - Flagged violations during exams
- `subscriptions` - Payment/subscription management

**API Endpoints:**

```
Authentication:
POST   /api/v1/auth/register           - Register training center
POST   /api/v1/auth/login              - Login
GET    /api/v1/auth/me                 - Get current user

Admin - Tests:
POST   /api/v1/admin/tests             - Create test
GET    /api/v1/admin/tests             - List tests
GET    /api/v1/admin/tests/:id         - Get test detail
PUT    /api/v1/admin/tests/:id         - Update test
DELETE /api/v1/admin/tests/:id         - Delete test

Admin - Questions:
POST   /api/v1/admin/tests/:testId/questions             - Create question
GET    /api/v1/admin/tests/:testId/questions             - Get questions
PUT    /api/v1/admin/tests/:testId/questions/:questionId - Update question
DELETE /api/v1/admin/tests/:testId/questions/:questionId - Delete question

Results:
GET    /api/v1/results/tests/:testId/results            - Get test results
GET    /api/v1/results/results/:resultId                - Get result detail
GET    /api/v1/results/dashboard/analytics              - Get dashboard analytics
```

### Frontend (Next.js 16)

**Pages:**
- `/admin/auth` - Login/Register page
- `/admin/dashboard` - Main dashboard with analytics
- `/admin/tests` - Test management list
- `/admin/tests/[testId]/edit` - Edit test and manage questions
- `/admin/results` - View exam results
- `/admin/results/[resultId]` - View detailed result
- `/admin/settings` - Account settings

## Setup Instructions

### Prerequisites
- PostgreSQL 12+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```
   
   The server will automatically initialize the database on first run.

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API URL:**
   Update `lib/api.ts`:
   ```typescript
   export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
   ```

3. **Create .env.local:**
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   
   Access at `http://localhost:3000/admin`

## Database Setup

The backend automatically creates tables on startup. If you need to reset:

1. Drop the database:
   ```bash
   psql -U postgres -c "DROP DATABASE aitest_db;"
   ```

2. Create fresh database:
   ```bash
   psql -U postgres -c "CREATE DATABASE aitest_db;"
   ```

3. Restart the backend server

## Usage Workflow

### 1. Register Training Center
- Visit `/admin/auth`
- Click "Register"
- Fill in center name, email, admin details
- Submit to create account and automatically login

### 2. Create Tests
- Go to "Tests" section
- Click "+ Create Test"
- Fill in test details (title, subject, duration, passing score)
- Create test

### 3. Add Questions
- Click "Edit" on a test
- Click "+ Add Question"
- Enter question text and answer options
- Mark the correct answer
- Save question

### 4. Publish Test
- Test is automatically available once created
- Students can take the exam through the main exam interface

### 5. View Results
- Go to "Results" section
- Select a test from dropdown
- View analytics and student results
- Click "View Details" for detailed answer breakdown

## Authentication

The system uses JWT tokens for authentication.

**Token Structure:**
```typescript
{
  userId: string;
  trainingCenterId: string;
  email: string;
  role: string;
  expiresIn: '7d'
}
```

**Authorization Header:**
```
Authorization: Bearer <token>
```

## Multi-Tenancy

Each training center has:
- Isolated user accounts
- Isolated tests and questions
- Isolated exam results
- Isolated analytics

API queries automatically filter by `training_center_id` from JWT token.

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Role-based access control (Admin, Teacher, Student)
- SQL injection prevention via parameterized queries
- CORS configuration
- Environment variable secrets

## Payment Integration (Future)

Stripe integration ready in database schema:
- Subscription management
- Billing period tracking
- Plan upgrades (free → starter → pro → enterprise)

## Deployment

### Vercel (Frontend)
```bash
git push origin main
```

### Render/Railway (Backend)
1. Create PostgreSQL database
2. Deploy backend
3. Set environment variables
4. Database initializes on first deploy

## Support

For issues or questions:
1. Check the database logs
2. Review backend error messages
3. Check browser console for frontend errors
4. Verify JWT tokens are valid

## Future Enhancements

- [ ] Student user management
- [ ] Exam scheduling
- [ ] Email notifications
- [ ] Payment processing
- [ ] Advanced analytics reports
- [ ] Question bank import/export
- [ ] Student groups/batches
- [ ] Custom branding per center
