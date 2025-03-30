import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn ,Column, OneToMany} from 'typeorm';
import { Student } from './student.entity';
import { Course } from './course.entity';

@Entity()
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, (student) => student.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @ManyToOne(() => Course, (course) => course.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;
  
  @Column({ type: 'float', nullable: true }) // Added grade, and made it nullable
  grade?: number;

  @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP' }) // Added enrollmentDate
  enrollmentDate?: Date;
}