import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './test-utils';

describe('Teachers (e2e)', () => {
  let app: INestApplication;
  let teacherToken: string;
  let adminToken: string;

  beforeAll(async () => {
    app = (await createTestApp()).getApp();
    
    // Login as teacher
    const teacherResponse = await request(app.getHttpServer())
      .post('/auth/teacher/login')
      .send({
        email: 'robert.miller@example.com',
        password: 'password123456',
      });
    teacherToken = teacherResponse.body.access_token;

    // Login as admin
    const adminResponse = await request(app.getHttpServer())
      .post('/auth/teacher/login')
      .send({
        email: 'admin@example.com',
        password: 'adminpassword123',
      });
    adminToken = adminResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /teachers', () => {
    it('should get all teachers (admin only)', () => {
      return request(app.getHttpServer())
        .get('/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('email');
          expect(res.body[0]).toHaveProperty('title');
        });
    });

    it('should fail without admin token', () => {
      return request(app.getHttpServer())
        .get('/teachers')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });
  });

  describe('GET /teachers/:id', () => {
    it('should get teacher by id (own profile)', () => {
      return request(app.getHttpServer())
        .get('/teachers/2')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('title');
        });
    });

    it('should get teacher by id (admin)', () => {
      return request(app.getHttpServer())
        .get('/teachers/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('title');
        });
    });

    it('should fail to get other teacher profile', () => {
      return request(app.getHttpServer())
        .get('/teachers/3')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });
  });

  describe('POST /teachers', () => {
    it('should create a new teacher (admin only)', () => {
      return request(app.getHttpServer())
        .post('/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'New',
          lastName: 'Teacher',
          email: 'new.teacher@example.com',
          password: 'password123456',
          title: 'Assistant Professor',
        })
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
          expect(res.body.email).toBe('new.teacher@example.com');
          expect(res.body.title).toBe('Assistant Professor');
        });
    });

    it('should fail with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Duplicate',
          lastName: 'Teacher',
          email: 'robert.miller@example.com',
          password: 'password123456',
          title: 'Professor',
        })
        .expect(400);
    });

    it('should fail without admin token', () => {
      return request(app.getHttpServer())
        .post('/teachers')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          firstName: 'New',
          lastName: 'Teacher',
          email: 'new.teacher2@example.com',
          password: 'password123456',
          title: 'Assistant Professor',
        })
        .expect(403);
    });
  });

  describe('GET /teachers/:id/courses', () => {
    it('should get courses for teacher (own courses)', () => {
      return request(app.getHttpServer())
        .get('/teachers/2/courses')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should get courses for teacher (admin)', () => {
      return request(app.getHttpServer())
        .get('/teachers/2/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should fail to get other teacher courses', () => {
      return request(app.getHttpServer())
        .get('/teachers/3/courses')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });
  });

  describe('GET /teachers/:id/courses/:courseId/students', () => {
    it('should get students in course (own course)', () => {
      return request(app.getHttpServer())
        .get('/teachers/2/courses/1/students')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should get students in course (admin)', () => {
      return request(app.getHttpServer())
        .get('/teachers/2/courses/1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should fail to get students in other teacher course', () => {
      return request(app.getHttpServer())
        .get('/teachers/3/courses/1/students')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });
  });

  describe('GET /teachers/:id/students', () => {
    it('should get all students for teacher courses (own courses)', () => {
      return request(app.getHttpServer())
        .get('/teachers/2/students')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should get all students for teacher courses (admin)', () => {
      return request(app.getHttpServer())
        .get('/teachers/2/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should fail to get students for other teacher courses', () => {
      return request(app.getHttpServer())
        .get('/teachers/3/students')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });
  });
}); 