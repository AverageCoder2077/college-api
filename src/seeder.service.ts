import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { Student } from './entities/student.entity';
import { Teacher } from './entities/teacher.entity';
import { Course } from './entities/course.entity';
import { Enrollment } from './entities/enrollment.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from './auth/user-role.enum';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async onApplicationBootstrap() {
    await this.seedDatabase();
  }

  private async seedDatabase() {
    const entityManager = this.connection.createEntityManager();

    try {
      await entityManager.transaction(async transactionalEntityManager => {
        // *IMPORTANT: Clear existing data before seeding (for development) - PostgreSQL Version*
        // PostgreSQL doesn't use SET FOREIGN_KEY_CHECKS.  Instead, we use CASCADE when deleting.
        // The order of deletion is important because of dependencies.
        await transactionalEntityManager.query('TRUNCATE TABLE enrollment RESTART IDENTITY CASCADE;');
        await transactionalEntityManager.query('TRUNCATE TABLE course RESTART IDENTITY CASCADE;');
        await transactionalEntityManager.query('TRUNCATE TABLE student RESTART IDENTITY CASCADE;');
        await transactionalEntityManager.query('TRUNCATE TABLE teacher RESTART IDENTITY CASCADE;');

        console.log('Cleared existing data (PostgreSQL).');

        // Seed Students
        const studentsData = [
          {
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@example.com',
            passwordHash: bcrypt.hashSync('password123456', 10),
          },
          {
            firstName: 'Emma',
            lastName: 'Johnson',
            email: 'emma.johnson@example.com',
            passwordHash: bcrypt.hashSync('password123456', 10),
          },
          {
            firstName: 'Michael',
            lastName: 'Brown',
            email: 'michael.brown@example.com',
            passwordHash: bcrypt.hashSync('password123456', 10),
          },
          {
            firstName: 'Sarah',
            lastName: 'Davis',
            email: 'sarah.davis@example.com',
            passwordHash: bcrypt.hashSync('password123456', 10),
          },
          {
            firstName: 'David',
            lastName: 'Wilson',
            email: 'david.wilson@example.com',
            passwordHash: bcrypt.hashSync('password123456', 10),
          },
          {
            firstName: 'Lisa',
            lastName: 'Anderson',
            email: 'lisa.anderson@example.com',
            passwordHash: bcrypt.hashSync('password123456', 10),
          },
          {
            firstName: 'James',
            lastName: 'Taylor',
            email: 'james.taylor@example.com',
            passwordHash: bcrypt.hashSync('password123456', 10),
          },
          {
            firstName: 'Emily',
            lastName: 'Thomas',
            email: 'emily.thomas@example.com',
            passwordHash: bcrypt.hashSync('password123456', 10),
          },
          {
            firstName: 'Robert',
            lastName: 'Jackson',
            email: 'robert.jackson@example.com',
            passwordHash: bcrypt.hashSync('password123456', 10),
          },
          {
            firstName: 'Jennifer',
            lastName: 'White',
            email: 'jennifer.white@example.com',
            passwordHash: bcrypt.hashSync('password123456', 10),
          }
        ];

        const students: Student[] = [];
        for (const studentData of studentsData) {
          const savedStudent = await transactionalEntityManager.getRepository(Student).save(studentData);
          students.push(savedStudent);
          console.log(`Created student: ${savedStudent.email}`);
        }

        // Seed Teachers (including admin)
        const teachersData = [
          {
            firstName: 'Admin',
            lastName: 'User',
            title: 'Administrator',
            email: 'admin@example.com',
            passwordHash: bcrypt.hashSync('adminpassword123', 10),
            role: UserRole.Admin,
          },
          {
            firstName: 'Robert',
            lastName: 'Miller',
            title: 'Professor',
            email: 'robert.miller@example.com',
            passwordHash: bcrypt.hashSync('password123456', 10),
            role: UserRole.Teacher,
          },
          {
            firstName: 'Mary',
            lastName: 'Anderson',
            title: 'Associate Professor',
            email: 'mary.anderson@example.com',
            passwordHash: bcrypt.hashSync('password123456', 10),
            role: UserRole.Teacher,
          },
          {
            firstName: 'William',
            lastName: 'Taylor',
            title: 'Professor',
            email: 'william.taylor@example.com',
            passwordHash: bcrypt.hashSync('password123456', 10),
            role: UserRole.Teacher,
          },
          {
            firstName: 'Patricia',
            lastName: 'Thomas',
            title: 'Assistant Professor',
            email: 'patricia.thomas@example.com',
            passwordHash: bcrypt.hashSync('password123456', 10),
            role: UserRole.Teacher,
          },
          {
            firstName: 'Joseph',
            lastName: 'Jackson',
            title: 'Professor',
            email: 'joseph.jackson@example.com',
            passwordHash: bcrypt.hashSync('password123456', 10),
            role: UserRole.Teacher,
          },
          {
            firstName: 'Jennifer',
            lastName: 'White',
            title: 'Associate Professor',
            email: 'jennifer.white@example.com',
            passwordHash: bcrypt.hashSync('password123456', 10),
            role: UserRole.Teacher,
          },
          {
            firstName: 'Thomas',
            lastName: 'Harris',
            title: 'Professor',
            email: 'thomas.harris@example.com',
            passwordHash: bcrypt.hashSync('password123456', 10),
            role: UserRole.Teacher,
          },
          {
            firstName: 'Margaret',
            lastName: 'Clark',
            title: 'Assistant Professor',
            email: 'margaret.clark@example.com',
            passwordHash: bcrypt.hashSync('password123456', 10),
            role: UserRole.Teacher,
          },
          {
            firstName: 'Christopher',
            lastName: 'Lewis',
            title: 'Professor',
            email: 'christopher.lewis@example.com',
            passwordHash: bcrypt.hashSync('password123456', 10),
            role: UserRole.Teacher,
          }
        ];

        const teachers: Teacher[] = [];
        for (const teacherData of teachersData) {
          const savedTeacher = await transactionalEntityManager.getRepository(Teacher).save(teacherData);
          teachers.push(savedTeacher);
          console.log(`Created teacher: ${savedTeacher.email} with role: ${savedTeacher.role}`);
        }

        // Seed Courses
        const coursesData = [
          { name: 'Mathematics 101', level: 'Beginner', credits: 3 },
          { name: 'Physics 101', level: 'Beginner', credits: 4 },
          { name: 'Chemistry 101', level: 'Beginner', credits: 4 },
          { name: 'Biology 101', level: 'Beginner', credits: 3 },
          { name: 'Computer Science 101', level: 'Beginner', credits: 3 },
          { name: 'Advanced Mathematics', level: 'Advanced', credits: 4 },
          { name: 'Quantum Physics', level: 'Advanced', credits: 4 },
          { name: 'Organic Chemistry', level: 'Intermediate', credits: 4 },
          { name: 'Genetics', level: 'Intermediate', credits: 3 },
          { name: 'Data Structures', level: 'Intermediate', credits: 3 }
        ];

        const courses: Course[] = [];
        for (const courseData of coursesData) {
          const savedCourse = await transactionalEntityManager.getRepository(Course).save(courseData);
          courses.push(savedCourse);
          console.log(`Created course: ${savedCourse.name}`);
        }

        // Assign teachers to courses
        for (let i = 0; i < courses.length; i++) {
          const course = courses[i];
          const teacher = teachers[i % teachers.length];
          course.teacher = teacher;
          await transactionalEntityManager.getRepository(Course).save(course);
          console.log(`Assigned teacher ${teacher.email} to course ${course.name}`);
        }

        // Create some random enrollments
        for (const student of students) {
          // Each student is enrolled in 2-4 random courses
          const numEnrollments = Math.floor(Math.random() * 3) + 2;
          const shuffledCourses = [...courses].sort(() => Math.random() - 0.5);
          
          for (let i = 0; i < numEnrollments; i++) {
            const course = shuffledCourses[i];
            const enrollment = new Enrollment();
            enrollment.student = student;
            enrollment.course = course;
            enrollment.grade = Math.random() * 4;
            enrollment.enrollmentDate = new Date();
            await transactionalEntityManager.getRepository(Enrollment).save(enrollment);
            console.log(`Enrolled student ${student.email} in course ${course.name}`);
          }
        }

        // Verify admin user was created correctly
        const adminUser = await transactionalEntityManager.getRepository(Teacher).findOne({
          where: { email: 'admin@example.com' },
        });
        if (adminUser) {
          console.log(`Admin user verified in database: ${adminUser.email} with role: ${adminUser.role}`);
        } else {
          console.error('Admin user was not created successfully!');
        }
      });
    } catch (error) {
      console.error("Seeding failed within transaction:", error);
      throw error;
    }

    console.log('Database seeding complete.');
  }
}/*
  "email": "admin@example.com",
  "password": "adminpassword"
}*/