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

  private generateUniqueEmail(firstName: string, lastName: string, existingEmails: Set<string>): string {
    const firstInitial = firstName.charAt(0).toLowerCase();
    const lastNameLower = lastName.toLowerCase();
    let sequence = 1;
    let email = `${firstInitial}${lastNameLower}${sequence}@school.edu`;
    
    while (existingEmails.has(email)) {
      sequence++;
      email = `${firstInitial}${lastNameLower}${sequence}@school.edu`;
    }
    
    existingEmails.add(email);
    return email;
  }

  private async seedDatabase() {
    const entityManager = this.connection.createEntityManager();
    const existingEmails = new Set<string>();

    try {
      await entityManager.transaction(async transactionalEntityManager => {
        // Clear existing data
        await transactionalEntityManager.query('TRUNCATE TABLE enrollment RESTART IDENTITY CASCADE;');
        await transactionalEntityManager.query('TRUNCATE TABLE course RESTART IDENTITY CASCADE;');
        await transactionalEntityManager.query('TRUNCATE TABLE student RESTART IDENTITY CASCADE;');
        await transactionalEntityManager.query('TRUNCATE TABLE teacher RESTART IDENTITY CASCADE;');

        console.log('Cleared existing data (PostgreSQL).');

        // Seed Students
        const studentsData = [
          { firstName: 'John', lastName: 'Smith' },
          { firstName: 'Emma', lastName: 'Johnson' },
          { firstName: 'Michael', lastName: 'Brown' },
          { firstName: 'Sarah', lastName: 'Davis' },
          { firstName: 'David', lastName: 'Wilson' },
          { firstName: 'Lisa', lastName: 'Anderson' },
          { firstName: 'James', lastName: 'Taylor' },
          { firstName: 'Emily', lastName: 'Thomas' },
          { firstName: 'Robert', lastName: 'Jackson' },
          { firstName: 'Jennifer', lastName: 'White' }
        ];

        const students: Student[] = [];
        for (const studentData of studentsData) {
          const email = this.generateUniqueEmail(studentData.firstName, studentData.lastName, existingEmails);
          const student = {
            ...studentData,
            email,
            passwordHash: bcrypt.hashSync('password123456', 10),
          };
          const savedStudent = await transactionalEntityManager.getRepository(Student).save(student);
          students.push(savedStudent);
          console.log(`Created student: ${savedStudent.email}`);
        }

        // Seed Teachers (including admin)
        const teachersData = [
          { firstName: 'Admin', lastName: 'User', title: 'Administrator', role: UserRole.Admin },
          { firstName: 'Robert', lastName: 'Miller', title: 'Professor', role: UserRole.Teacher },
          { firstName: 'Mary', lastName: 'Anderson', title: 'Associate Professor', role: UserRole.Teacher },
          { firstName: 'William', lastName: 'Taylor', title: 'Professor', role: UserRole.Teacher },
          { firstName: 'Patricia', lastName: 'Thomas', title: 'Assistant Professor', role: UserRole.Teacher },
          { firstName: 'Joseph', lastName: 'Jackson', title: 'Professor', role: UserRole.Teacher },
          { firstName: 'Jennifer', lastName: 'White', title: 'Associate Professor', role: UserRole.Teacher },
          { firstName: 'Thomas', lastName: 'Harris', title: 'Professor', role: UserRole.Teacher },
          { firstName: 'Margaret', lastName: 'Clark', title: 'Assistant Professor', role: UserRole.Teacher },
          { firstName: 'Christopher', lastName: 'Lewis', title: 'Professor', role: UserRole.Teacher }
        ];

        const teachers: Teacher[] = [];
        for (const teacherData of teachersData) {
          const email = this.generateUniqueEmail(teacherData.firstName, teacherData.lastName, existingEmails);
          const teacher = {
            ...teacherData,
            email,
            passwordHash: bcrypt.hashSync('password123456', 10),
          };
          const savedTeacher = await transactionalEntityManager.getRepository(Teacher).save(teacher);
          teachers.push(savedTeacher);
          console.log(`Created teacher: ${savedTeacher.email} with role: ${savedTeacher.role}`);
        }

        // Seed Courses (40 courses)
        const courseLevels = ['100', '200', '300', '400'];
        const courseSubjects = [
          'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
          'English', 'History', 'Economics', 'Psychology', 'Sociology',
          'Art', 'Music', 'Philosophy', 'Political Science', 'Geography',
          'Environmental Science', 'Statistics', 'Engineering', 'Literature', 'Anthropology'
        ];

        const courses: Course[] = [];
        for (let i = 0; i < 40; i++) {
          const subject = courseSubjects[i % courseSubjects.length];
          const level = courseLevels[Math.floor(i / 10)];
          const courseData = {
            name: `${subject} ${level}`,
            level,
            credits: Math.floor(Math.random() * 2) + 3, // 3-4 credits
          };
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

        // Create enrollments (2-4 courses per student)
        for (const student of students) {
          const numEnrollments = Math.floor(Math.random() * 3) + 2; // 2-4 courses
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

        console.log('Database seeding completed successfully.');
      });
    } catch (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
  }
}