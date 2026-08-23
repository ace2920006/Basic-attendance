const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken } = require('../src/utils/generateToken');

describe('🔐 Authentication Module Tests', () => {
  const mockStudent = {
    name: 'John Student',
    email: 'student@example.com',
    password: 'password123',
    role: 'student',
    rollNo: 'CS202601',
    department: 'Computer Science',
    course: 'B.Tech',
    semester: '4'
  };

  describe('POST /api/auth/register', () => {
    it('should register a new student successfully and hash password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(mockStudent);

      if (res.status !== 201) console.log('REGISTRATION ERROR:', res.status, res.body);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.email).toBe(mockStudent.email);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();

      // Check DB password is hashed
      const dbUser = await User.findOne({ email: mockStudent.email }).select('+password');
      expect(dbUser).not.toBeNull();
      const isMatch = await bcrypt.compare('password123', dbUser.password);
      expect(isMatch).toBe(true);
    });

    it('should reject registration if email is already registered', async () => {
      await request(app).post('/api/auth/register').send(mockStudent);

      const res = await request(app)
        .post('/api/auth/register')
        .send(mockStudent);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should reject registration if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'incomplete@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(mockStudent);
    });

    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: mockStudent.email,
          password: mockStudent.password
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.email).toBe(mockStudent.email);
    });

    it('should fail login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: mockStudent.email,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid/i);
    });

    it('should fail login for non-existent user email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Token Generation & RBAC Protection', () => {
    it('should generate valid JWT access and refresh tokens', () => {
      const token = generateAccessToken('user123', 'student');
      const refreshToken = generateRefreshToken('user123');

      expect(typeof token).toBe('string');
      expect(typeof refreshToken).toBe('string');
      expect(token.length).toBeGreaterThan(20);
    });

    it('should block unauthorized requests to protected routes (401 Unauthorized)', async () => {
      const res = await request(app).get('/api/attendance');
      expect(res.status).toBe(401);
    });

    it('should block non-admin users from admin-only routes (403 Forbidden)', async () => {
      const regRes = await request(app).post('/api/auth/register').send(mockStudent);
      const studentToken = regRes.body.data.accessToken;

      const res = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });
  });
});
