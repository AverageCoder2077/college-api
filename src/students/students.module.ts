import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../entities/student.entity';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule

@Module({
  imports: [TypeOrmModule.forFeature([Student]), AuthModule], // Import AuthModule
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [TypeOrmModule],
})
export class StudentsModule {}
