import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';
import { CoursesModule } from './courses/courses.module';
import { SeederService } from './seeder.service';
import { Student } from './entities/student.entity';
import { Teacher } from './entities/teacher.entity';
import { Course } from './entities/course.entity';
import { Enrollment } from './entities/enrollment.entity';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const dataSource = new DataSource({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: 'postgres', // Connect to default database first
        });

        await dataSource.initialize();
        
        // Create database if it doesn't exist
        const dbName = process.env.DB_NAME || 'school_registration';
        const result = await dataSource.query(
          `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`
        );
        
        if (result.length === 0) {
          await dataSource.query(`CREATE DATABASE ${dbName}`);
        }
        
        await dataSource.destroy();

        return {
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: dbName,
          entities: [Student, Teacher, Course, Enrollment],
          synchronize: true,
        };
      },
    }),
    TypeOrmModule.forFeature([Student, Teacher, Course, Enrollment]),
    AuthModule,
    StudentsModule,
    TeachersModule,
    CoursesModule,
  ],
  providers: [SeederService],
})
export class AppModule {}