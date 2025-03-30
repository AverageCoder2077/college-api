# School Registration API

A NestJS-based API for managing school registrations, courses, and user roles.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create database:
```bash
createdb school_registration
```

3. Configure environment variables (optional):
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Run database migrations and seed data:
```bash
npm run db:reset
```

## Running the Application

Development mode:
```bash
npm run start:dev
```

Production mode:
```bash
npm run build
npm run start:prod
```

## Testing

Run unit tests:
```bash
npm test
```

Run integration tests:
```bash
npm run test:e2e
```

## API Documentation

Access Swagger documentation at `http://localhost:3000/api` when the application is running.

## Key Information

### Default Admin Credentials
- Email: admin@example.com
- Password: adminpassword123

### User Roles
1. **Admin**
   - Full access to all endpoints
   - Can manage teachers, students, and courses

2. **Teacher**
   - Can view and manage their own courses
   - Can view students in their courses
   - Cannot modify other teachers' data

3. **Student**
   - Can view and update their own profile
   - Can enroll in courses
   - Can view their enrolled courses

### Key Endpoints

#### Authentication
- `POST /auth/student/login` - Student login
- `POST /auth/teacher/login` - Teacher/Admin login

#### Students
- `POST /students` - Register new student (public)
- `GET /students` - Get all students (admin only)
- `GET /students/:id` - Get student profile
- `PUT /students/:id` - Update student profile
- `DELETE /students/:id` - Delete student (admin only)
- `POST /students/:id/enroll` - Enroll in course
- `GET /students/:id/courses` - Get enrolled courses

#### Teachers
- `GET /teachers` - Get all teachers (admin only)
- `GET /teachers/:id` - Get teacher profile
- `POST /teachers` - Create teacher (admin only)
- `GET /teachers/:id/courses` - Get teacher's courses
- `GET /teachers/:id/students` - Get all students in teacher's courses

#### Courses
- `GET /courses` - Get all courses (public)
- `POST /courses` - Create course (admin only)
- `PUT /courses/:id` - Update course (admin only)
- `DELETE /courses/:id` - Delete course (admin only)
- `POST /courses/:id/teacher` - Assign teacher to course (admin only)

## License

MIT
