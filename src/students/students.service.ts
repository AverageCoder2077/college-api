import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  async getStudents(): Promise<Student[]> {
    return this.studentRepository.find();
  }

  async getStudentById(id: number): Promise<Student> {
    const student = await this.studentRepository.findOneBy({ id });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async registerStudent(dto: CreateStudentDto): Promise<Student> {
    const { password, confirmPassword, email, ...studentData } = dto; // Extract email
    
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match'); // Consider a more specific exception
    }

    const existingStudent = await this.studentRepository.findOneBy({ email });
    if (existingStudent) {
      throw new Error('Student with this email already exists'); // Consider a more specific exception
    }
    const student = this.studentRepository.create({...studentData, email}); // Include email in create
    student.passwordHash = await bcrypt.hash(password, 10);
    return this.studentRepository.save(student);
  }

  async updateStudent(id: number, dto: UpdateStudentDto): Promise<Student> {
    const student = await this.getStudentById(id);
    Object.assign(student, dto);
    return this.studentRepository.save(student);
  }

  async updateStudentPassword(id: number, dto: { currentPassword: string; newPassword: string }): Promise<Student> {
    const student = await this.getStudentById(id);
    // In a real application, you would verify the current password before updating
    student.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    return this.studentRepository.save(student);
  }

  async unregisterStudent(id: number): Promise<void> {
    const student = await this.getStudentById(id);
    await this.studentRepository.remove(student);
  }

  // Implement enrollInCourse, unenrollFromCourse, getEnrolledCourses methods here
  async enrollInCourse(studentId: number, courseId: number): Promise<any> {
    // Implementation for enrolling a student in a course
    return {}; // Placeholder
  }

  async unenrollFromCourse(studentId: number, courseId: number): Promise<void> {
    // Implementation for unenrolling a student from a course
  }

  async getEnrolledCourses(studentId: number): Promise<any[]> {
    // Implementation for getting enrolled courses
    return []; // Placeholder
  }
}
