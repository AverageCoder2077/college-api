import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { Teacher } from '../entities/teacher.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'), // Get the secret from ConfigService
    });
  }

  async validate(payload: any): Promise<any> {
    // 'payload' contains the decoded JWT payload (e.g., sub, email, role)
    let user: Student | Teacher | null = null;
    if (payload.role === 'student') {
      user = await this.studentRepository.findOne({ where: { id: payload.sub } });
    } else if (payload.role === 'teacher') {
      user = await this.teacherRepository.findOne({ where: { id: payload.sub } });
    }

    if (!user) {
      throw new UnauthorizedException();
    }
    return user; // NestJS will attach this to the request object (req.user)
  }
}
