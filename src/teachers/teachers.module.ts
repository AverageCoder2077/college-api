import { Module } from '@nestjs/common';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from '../entities/teacher.entity';
import { Course } from '../entities/course.entity';
import { Student } from '../entities/student.entity'; // Import Student entity
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Teacher, Course, Student]), // Register the Student entity here
    AuthModule,
  ],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TypeOrmModule],
})
export class TeachersModule {}
