// src/entities/course.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany,ManyToMany } from 'typeorm';
import { Teacher } from './teacher.entity';
import { Student } from './student.entity';
import { Enrollment } from './enrollment.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: false })
  level: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.courses, { eager: true, nullable: true })
  teacher: Teacher;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];
  
  @ManyToMany(() => Student, student => student.courses)
  students: Student[];
}