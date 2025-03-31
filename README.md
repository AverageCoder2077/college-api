# School Registration API

A NestJS-based API for managing school registrations, courses, students, and teachers.

## Features

- Student registration and management
- Teacher registration and management
- Course management
- Enrollment system
- Role-based authentication
- JWT-based authorization
- Swagger API documentation

## Prerequisites

- Node.js (v20 or later)
- PostgreSQL (v16 or later)
- Docker and Docker Compose (for containerized deployment)

## Installation

### Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/AverageCoder2077/college-api.git
cd college-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=school_registration

# JWT Configuration
JWT_SECRET=your-super-secret-key
JWT_EXPIRATION=1h

# Server Configuration
PORT=3000
```

4. Start the development server:
```bash
npm run start:dev
```

### Docker Setup

The project is containerized using Docker and Docker Compose, making it easy to run in any environment.

1. Clone the repository:
```bash
git clone https://github.com/AverageCoder2077/college-api.git
cd college-api
```

2. Build and start the containers:
```bash
docker-compose up --build
```

This will:
- Build the NestJS application container
- Start a PostgreSQL database container
- Set up the network between containers
- Create necessary volumes for data persistence

3. To stop the containers:
```bash
docker-compose down
```

4. To view logs:
```bash
docker-compose logs -f
```

#### Docker Configuration Details

The project uses a multi-stage Docker build to keep the final image size small:

- **Build Stage**: Uses Node.js 20 Alpine to build the application
- **Production Stage**: Contains only the necessary production dependencies and built application
- **Database**: Uses PostgreSQL 16 Alpine for the database

The `docker-compose.yml` file sets up:
- Application service on port 3000
- PostgreSQL database on port 5432
- Persistent volume for database data
- Network isolation between services
- Environment variable configuration
- Hot-reload support through volume mounting

## API Documentation

Once the server is running, you can access the Swagger API documentation at:
```
http://localhost:3000/api
```

## Database Seeding

The application includes a seeder service that populates the database with:
- 10 students with unique email addresses
- 10 teachers (including admin)
- 40 courses with proper level format (100/200/300/400)
- Course enrollments for each student

The seeder runs automatically when the application starts.

## Testing

Run the test suite:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
