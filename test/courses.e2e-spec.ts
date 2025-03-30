import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './test-utils';

describe('Courses (e2e)', () => {
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

  describe('GET /courses', () => {
    it('should get all courses', () => {
      return request(app.getHttpServer())
        .get('/courses')
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('level');
          expect(res.body[0]).toHaveProperty('credits');
        });
    });
  });

  describe('GET /courses/:id', () => {
    it('should get course by id', () => {
      return request(app.getHttpServer())
        .get('/courses/1')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('level');
          expect(res.body).toHaveProperty('credits');
        });
    });

    it('should return 404 for non-existent course', () => {
      return request(app.getHttpServer())
        .get('/courses/999')
        .expect(404);
    });
  });

  describe('POST /courses', () => {
    it('should create a new course (admin only)', () => {
      return request(app.getHttpServer())
        .post('/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Course',
          level: 'Beginner',
          credits: 3,
        })
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('New Course');
          expect(res.body.level).toBe('Beginner');
          expect(res.body.credits).toBe(3);
        });
    });

    it('should fail without admin token', () => {
      return request(app.getHttpServer())
        .post('/courses')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          name: 'New Course 2',
          level: 'Beginner',
          credits: 3,
        })
        .expect(403);
    });
  });

  describe('PUT /courses/:id', () => {
    it('should update course (admin only)', () => {
      return request(app.getHttpServer())
        .put('/courses/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Course',
          level: 'Intermediate',
          credits: 4,
        })
        .expect(200)
        .expect(res => {
          expect(res.body.name).toBe('Updated Course');
          expect(res.body.level).toBe('Intermediate');
          expect(res.body.credits).toBe(4);
        });
    });

    it('should fail without admin token', () => {
      return request(app.getHttpServer())
        .put('/courses/1')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          name: 'Updated Course 2',
          level: 'Intermediate',
          credits: 4,
        })
        .expect(403);
    });
  });

  describe('DELETE /courses/:id', () => {
    it('should delete course (admin only)', () => {
      return request(app.getHttpServer())
        .delete('/courses/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should fail without admin token', () => {
      return request(app.getHttpServer())
        .delete('/courses/3')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });
  });

  describe('POST /courses/:id/teacher', () => {
    it('should assign teacher to course (admin only)', () => {
      return request(app.getHttpServer())
        .post('/courses/3/teacher')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          teacherId: 2,
        })
        .expect(200)
        .expect(res => {
          expect(res.body.teacher).toHaveProperty('id');
          expect(res.body.teacher.id).toBe(2);
        });
    });

    it('should fail without admin token', () => {
      return request(app.getHttpServer())
        .post('/courses/3/teacher')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          teacherId: 2,
        })
        .expect(403);
    });

    it('should fail with non-existent teacher', () => {
      return request(app.getHttpServer())
        .post('/courses/3/teacher')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          teacherId: 999,
        })
        .expect(404);
    });
  });
}); 