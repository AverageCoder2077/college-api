import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './test-utils';

describe('Students (e2e)', () => {
  let app: INestApplication;
  let studentToken: string;
  let adminToken: string;

  beforeAll(async () => {
    app = (await createTestApp()).getApp();
    
    // Login as student
    const studentResponse = await request(app.getHttpServer())
      .post('/auth/student/login')
      .send({
        email: 'john.smith@example.com',
        password: 'password123456',
      });
    studentToken = studentResponse.body.access_token;

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

  describe('GET /students', () => {
    it('should get all students (admin only)', () => {
      return request(app.getHttpServer())
        .get('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('email');
        });
    });

    it('should fail without admin token', () => {
      return request(app.getHttpServer())
        .get('/students')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  describe('GET /students/:id', () => {
    it('should get student by id (own profile)', () => {
      return request(app.getHttpServer())
        .get('/students/1')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
        });
    });

    it('should get student by id (admin)', () => {
      return request(app.getHttpServer())
        .get('/students/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
        });
    });

    it('should fail to get other student profile', () => {
      return request(app.getHttpServer())
        .get('/students/2')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  describe('POST /students', () => {
    it('should register a new student', () => {
      return request(app.getHttpServer())
        .post('/students')
        .send({
          firstName: 'New',
          lastName: 'Student',
          email: 'new.student@example.com',
          password: 'password123456',
        })
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
          expect(res.body.email).toBe('new.student@example.com');
        });
    });

    it('should fail with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/students')
        .send({
          firstName: 'Duplicate',
          lastName: 'Student',
          email: 'john.smith@example.com',
          password: 'password123456',
        })
        .expect(400);
    });
  });

  describe('PUT /students/:id', () => {
    it('should update own profile', () => {
      return request(app.getHttpServer())
        .put('/students/1')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
        })
        .expect(200)
        .expect(res => {
          expect(res.body.firstName).toBe('Updated');
          expect(res.body.lastName).toBe('Name');
        });
    });

    it('should update student profile (admin)', () => {
      return request(app.getHttpServer())
        .put('/students/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Admin',
          lastName: 'Updated',
        })
        .expect(200)
        .expect(res => {
          expect(res.body.firstName).toBe('Admin');
          expect(res.body.lastName).toBe('Updated');
        });
    });

    it('should fail to update other student profile', () => {
      return request(app.getHttpServer())
        .put('/students/2')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
        })
        .expect(403);
    });
  });

  describe('DELETE /students/:id', () => {
    it('should delete student (admin only)', () => {
      return request(app.getHttpServer())
        .delete('/students/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should fail to delete student (student)', () => {
      return request(app.getHttpServer())
        .delete('/students/1')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  describe('POST /students/:id/enroll', () => {
    it('should enroll in a course', () => {
      return request(app.getHttpServer())
        .post('/students/1/enroll')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: 1,
        })
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('student');
          expect(res.body).toHaveProperty('course');
        });
    });

    it('should fail to enroll in same course twice', () => {
      return request(app.getHttpServer())
        .post('/students/1/enroll')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: 1,
        })
        .expect(400);
    });
  });

  describe('GET /students/:id/courses', () => {
    it('should get enrolled courses', () => {
      return request(app.getHttpServer())
        .get('/students/1/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should fail to get other student courses', () => {
      return request(app.getHttpServer())
        .get('/students/2/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });
}); 