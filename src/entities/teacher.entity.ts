import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Course } from './course.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../auth/user-role.enum';

@Entity()
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: false })  // <--  This is the important part
   title: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })  // Password should not be selected by default
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.Teacher
  })
  role: UserRole;

  @OneToMany(() => Course, (course) => course.teacher)
  courses: Course[];

  @BeforeInsert()
  @BeforeUpdate()
  async generateEmail() {
    if (!this.email) {
        const baseEmail = `${this.firstName.toLowerCase()}.${this.lastName.toLowerCase()}`;
        let count = 0;
        let generatedEmail = `${baseEmail}@school.edu`;
         this.email = generatedEmail;
    }
  }

  async setPassword(password: string): Promise<void> {
    const saltRounds = 10;
    this.passwordHash = await bcrypt.hash(password, saltRounds);
  }

  async validatePassword(password: string): Promise<boolean> {
      return bcrypt.compare(password, this.passwordHash);
  }
}