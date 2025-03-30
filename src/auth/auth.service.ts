import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Student } from '../entities/student.entity'; // Import Student and Teacher entities
import { Teacher } from '../entities/teacher.entity';
import { StudentLoginDto, TeacherLoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Define types for the return values of validateStudent and validateTeacher
type ValidatedStudent = Omit<Student, 'passwordHash'>;
type ValidatedTeacher = Omit<Teacher, 'passwordHash'>;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
  ) {}

  async validateStudent(email: string, pass: string): Promise<ValidatedStudent | null> {
    this.logger.debug(`Attempting to validate student with email: ${email}`);
    
    const student = await this.studentRepository
      .createQueryBuilder('student')
      .addSelect('student.passwordHash')
      .where('student.email = :email', { email })
      .getOne();

    if (!student) {
      this.logger.debug('No student found with this email');
      return null;
    }

    if (!student.passwordHash) {
      this.logger.debug('Student found but no password hash');
      return null;
    }

    const isMatch = await bcrypt.compare(pass, student.passwordHash);
    this.logger.debug(`Password match result: ${isMatch}`);

    if (isMatch) {
      const { passwordHash, ...result } = student;
      this.logger.debug(`Student validated successfully: ${result.email}`);
      return result as ValidatedStudent;
    }

    this.logger.debug('Password mismatch');
    return null;
  }

  async validateTeacher(email: string, pass: string): Promise<ValidatedTeacher | null> {
    this.logger.debug(`Attempting to validate teacher with email: ${email}`);
    
    const teacher = await this.teacherRepository
      .createQueryBuilder('teacher')
      .addSelect('teacher.passwordHash')
      .where('teacher.email = :email', { email })
      .getOne();

    if (!teacher) {
      this.logger.debug('No teacher found with this email');
      return null;
    }

    if (!teacher.passwordHash) {
      this.logger.debug('Teacher found but no password hash');
      return null;
    }

    const isMatch = await bcrypt.compare(pass, teacher.passwordHash);
    this.logger.debug(`Password match result: ${isMatch}`);

    if (isMatch) {
      const { passwordHash, ...result } = teacher;
      this.logger.debug(`Teacher validated successfully: ${result.email}`);
      return result as ValidatedTeacher;
    }

    this.logger.debug('Password mismatch');
    return null;
  }

  async studentLogin(dto: StudentLoginDto): Promise<{ access_token: string }> {
    const student = await this.validateStudent(dto.email, dto.password);
    if (!student) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: student.id, email: student.email, role: 'student' };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async teacherLogin(dto: TeacherLoginDto): Promise<{ access_token: string }> {
    this.logger.debug(`Attempting teacher login for email: ${dto.email}`);
    const teacher = await this.validateTeacher(dto.email, dto.password);
    
    if (!teacher) {
      this.logger.warn(`Failed login attempt for email: ${dto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: teacher.id, email: teacher.email, role: teacher.role };
    this.logger.debug(`Login successful for teacher: ${teacher.email} with role: ${teacher.role}`);
    
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}