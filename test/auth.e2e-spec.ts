import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './test-utils';

describe('Authentication (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = (await createTestApp()).getApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/student/login', () => {
    it('should login a student successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/student/login')
        .send({
          email: 'john.smith@example.com',
          password: 'password123456',
        })
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user).toHaveProperty('email');
          expect(res.body.user).toHaveProperty('role');
          expect(res.body.user.role).toBe('student');
        });
    });

    it('should fail with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/student/login')
        .send({
          email: 'john.smith@example.com',
          password: 'wrongpassword',
        })
        .expect(401)
        .expect(res => {
          expect(res.body.message).toBe('Invalid credentials');
        });
    });
  });

  describe('POST /auth/teacher/login', () => {
    it('should login a teacher successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/teacher/login')
        .send({
          email: 'robert.miller@example.com',
          password: 'password123456',
        })
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user).toHaveProperty('email');
          expect(res.body.user).toHaveProperty('role');
          expect(res.body.user.role).toBe('teacher');
        });
    });

    it('should login an admin successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/teacher/login')
        .send({
          email: 'admin@example.com',
          password: 'adminpassword123',
        })
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user).toHaveProperty('email');
          expect(res.body.user).toHaveProperty('role');
          expect(res.body.user.role).toBe('admin');
        });
    });

    it('should fail with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/teacher/login')
        .send({
          email: 'robert.miller@example.com',
          password: 'wrongpassword',
        })
        .expect(401)
        .expect(res => {
          expect(res.body.message).toBe('Invalid credentials');
        });
    });
  });
}); 