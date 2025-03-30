import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { testConfig } from './test-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

export class TestApp {
  private app: INestApplication;
  private moduleFixture: TestingModule;

  async init() {
    this.moduleFixture = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testConfig),
        AppModule,
      ],
    }).compile();

    this.app = this.moduleFixture.createNestApplication();
    await this.app.init();
    return this;
  }

  async close() {
    const connection = this.moduleFixture.get(Connection);
    await connection.close();
    await this.app.close();
  }

  getApp() {
    return this.app;
  }

  getModuleFixture() {
    return this.moduleFixture;
  }
}

export const createTestApp = async () => {
  const testApp = new TestApp();
  await testApp.init();
  return testApp;
}; 