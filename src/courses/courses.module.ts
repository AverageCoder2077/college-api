import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { AuthModule } from '../auth/auth.module';
import { CoursesController } from './courses.controller';
import { Course } from '../entities/course.entity';
import { Teacher } from '../entities/teacher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Teacher]),
  AuthModule, // Add AuthModule to the array
],
  providers: [CoursesService],
  controllers: [CoursesController],
  exports: [TypeOrmModule],
})
export class CoursesModule {}