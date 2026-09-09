const request = require('supertest');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const app = require('../src/app');
const User = require('../src/models/User');
const Leave = require('../src/models/Leave');
const { secureUploadDir } = require('../src/middleware/secureUploadMiddleware');

describe('📄 Phase 31: Document Verification for Leave Applications', () => {
  let studentToken, studentUser;
  let otherStudentToken, otherStudentUser;
  let teacherToken, teacherUser;
  let adminToken, adminUser;
  let parentToken, parentUser;

  // Sample files buffers
  const validPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF\n');
  const validPngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG Signature
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89
  ]);
  const validJpgBuffer = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01 // JPEG SOI + JFIF
  ]);

  beforeEach(async () => {
    // 1. Create Student
    studentUser = await User.create({
      name: 'Alice Student',
      email: 'alice@university.edu',
      password: 'Password123!',
      role: 'student',
      rollNo: 'CS-2026-101',
      department: 'Computer Science'
    });

    otherStudentUser = await User.create({
      name: 'Bob Student',
      email: 'bob@university.edu',
      password: 'Password123!',
      role: 'student',
      rollNo: 'CS-2026-102',
      department: 'Computer Science'
    });

    // 2. Create Teacher
    teacherUser = await User.create({
      name: 'Prof. John Smith',
      email: 'john.smith@university.edu',
      password: 'Password123!',
      role: 'teacher',
      designation: 'Associate Professor',
      department: 'Computer Science'
    });

    // 3. Create Admin
    adminUser = await User.create({
      name: 'Admin Dean',
      email: 'dean@university.edu',
      password: 'Password123!',
      role: 'admin',
      department: 'Administration'
    });

    // 4. Create Parent linked to Alice
    parentUser = await User.create({
      name: 'Mrs. Student Parent',
      email: 'parent.alice@gmail.com',
      password: 'Password123!',
      role: 'parent',
      linkedStudents: [studentUser._id],
      wardRollNo: 'CS-2026-101'
    });

    // Generate tokens via auth
    const studentRes = await request(app).post('/api/auth/login').send({ email: 'alice@university.edu', password: 'Password123!' });
    studentToken = studentRes.body.data.token;

    const otherStudentRes = await request(app).post('/api/auth/login').send({ email: 'bob@university.edu', password: 'Password123!' });
    otherStudentToken = otherStudentRes.body.data.token;

    const teacherRes = await request(app).post('/api/auth/login').send({ email: 'john.smith@university.edu', password: 'Password123!' });
    teacherToken = teacherRes.body.data.token;

    const adminRes = await request(app).post('/api/auth/login').send({ email: 'dean@university.edu', password: 'Password123!' });
    adminToken = adminRes.body.data.token;

    const parentRes = await request(app).post('/api/auth/login').send({ email: 'parent.alice@gmail.com', password: 'Password123!' });
    parentToken = parentRes.body.data.token;
  });

  describe('🔒 1. File Size Limits & Upload Filters', () => {
    it('MUST REJECT files exceeding 5MB with friendly error', async () => {
      // 5.5 MB dummy buffer
      const largeBuffer = Buffer.alloc(5.5 * 1024 * 1024);
      // Prepend valid PDF header
      validPdfBuffer.copy(largeBuffer, 0);

      const res = await request(app)
        .post('/api/leaves/upload-document')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('document', largeBuffer, { filename: 'large_prescription.pdf', contentType: 'application/pdf' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/exceeds maximum allowed limit of 5MB/i);
    });

    it('MUST REJECT unsupported file extensions (.exe, .zip, .html, .csv)', async () => {
      const exeBuffer = Buffer.from('MZ\x90\x00\x03\x00\x00\x00');
      const res = await request(app)
        .post('/api/leaves/upload-document')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('document', exeBuffer, { filename: 'malicious.exe', contentType: 'application/x-msdownload' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Only PDF, JPG, and PNG files are supported/i);
    });
  });

  describe('🔍 2. Magic-Byte MIME Validation & Spoof Detection', () => {
    it('MUST REJECT spoofed file claiming to be PDF but containing plain HTML/text', async () => {
      const spoofedBuffer = Buffer.from('<html><body><h1>Fake Document</h1></body></html>');

      const res = await request(app)
        .post('/api/leaves/upload-document')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('document', spoofedBuffer, { filename: 'fake_medical_slip.pdf', contentType: 'application/pdf' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/signature verification failed|Only genuine PDF/i);
    });

    it('MUST ACCEPT valid PDF with authentic %PDF- header', async () => {
      const res = await request(app)
        .post('/api/leaves/upload-document')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('document', validPdfBuffer, { filename: 'hospital_certificate.pdf', contentType: 'application/pdf' });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.mimeType).toBe('application/pdf');
      expect(res.body.data.scanStatus).toBe('CLEAN');
      expect(res.body.data.hash).toBeDefined();
      expect(res.body.data.hash.length).toBe(64); // SHA-256 length
    });

    it('MUST ACCEPT valid PNG and JPEG images', async () => {
      // PNG test
      const pngRes = await request(app)
        .post('/api/leaves/upload-document')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('document', validPngBuffer, { filename: 'xray_scan.png', contentType: 'image/png' });

      expect(pngRes.statusCode).toBe(201);
      expect(pngRes.body.data.mimeType).toBe('image/png');
      expect(pngRes.body.data.scanStatus).toBe('CLEAN');

      // JPG test
      const jpgRes = await request(app)
        .post('/api/leaves/upload-document')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('document', validJpgBuffer, { filename: 'prescription.jpg', contentType: 'image/jpeg' });

      expect(jpgRes.statusCode).toBe(201);
      expect(jpgRes.body.data.mimeType).toBe('image/jpeg');
      expect(jpgRes.body.data.scanStatus).toBe('CLEAN');
    });
  });

  describe('🛡️ 3. Virus & Malware Scanning Engine', () => {
    it('MUST DETECT EICAR anti-virus test signature, quarantine file, and reject upload', async () => {
      const eicarStr = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';
      // Embed in PDF buffer
      const eicarBuffer = Buffer.concat([validPdfBuffer, Buffer.from(`\n% ${eicarStr}\n`)]);

      const res = await request(app)
        .post('/api/leaves/upload-document')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('document', eicarBuffer, { filename: 'infected_cert.pdf', contentType: 'application/pdf' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Antivirus Test File signature detected|Security Alert/i);
    });

    it('MUST DETECT disguised executable / active script payload', async () => {
      const maliciousScriptImage = Buffer.concat([
        validJpgBuffer,
        Buffer.from('<?php system($_GET["cmd"]); ?><script>eval(alert(1))</script>')
      ]);

      const res = await request(app)
        .post('/api/leaves/upload-document')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('document', maliciousScriptImage, { filename: 'doctor_note.jpg', contentType: 'image/jpeg' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Suspicious active script|Security Alert/i);
    });
  });

  describe('🔄 4. End-to-End Multi-Stage Verification Workflow', () => {
    let leaveId, storedFileName;

    it('Step 1: Student uploads document and applies for leave', async () => {
      // 1. Upload document
      const uploadRes = await request(app)
        .post('/api/leaves/upload-document')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('document', validPdfBuffer, { filename: 'medical_report.pdf', contentType: 'application/pdf' });

      expect(uploadRes.statusCode).toBe(201);
      const docData = uploadRes.body.data;
      storedFileName = docData.storedName;

      // 2. Apply for leave with document metadata
      const leaveRes = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          leaveType: 'Medical',
          startDate: '2026-10-01',
          endDate: '2026-10-03',
          reason: 'Severe migraine and fever',
          document: docData
        });

      expect(leaveRes.statusCode).toBe(201);
      expect(leaveRes.body.data.status).toBe('Pending');
      expect(leaveRes.body.data.verificationStage).toBe('teacher_review');
      expect(leaveRes.body.data.document.scanStatus).toBe('CLEAN');
      expect(leaveRes.body.data.document.hash).toBe(docData.hash);

      leaveId = leaveRes.body.data._id;
    });

    it('Step 2: Teacher reviews document and recommends/approves to Admin', async () => {
      // First create a leave to review
      const uploadRes = await request(app)
        .post('/api/leaves/upload-document')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('document', validPdfBuffer, { filename: 'medical_slip.pdf', contentType: 'application/pdf' });

      const leaveRes = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          leaveType: 'Medical',
          startDate: '2026-10-05',
          endDate: '2026-10-07',
          reason: 'Dengue fever recovery',
          document: uploadRes.body.data
        });

      leaveId = leaveRes.body.data._id;

      // Teacher reviews leave
      const reviewRes = await request(app)
        .put(`/api/leaves/${leaveId}/teacher-review`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          action: 'Approved',
          remarks: 'Medical proof verified by faculty mentor. Forwarding to Admin for sanction.'
        });

      expect(reviewRes.statusCode).toBe(200);
      expect(reviewRes.body.data.status).toBe('Teacher Verified');
      expect(reviewRes.body.data.verificationStage).toBe('admin_verification');
      expect(reviewRes.body.data.teacherReview.status).toBe('Approved');
      expect(reviewRes.body.data.teacherReview.reviewedBy.name).toBe('Prof. John Smith');
    });

    it('Step 3: Admin performs final verification and sanctions leave', async () => {
      // Admin verifies leave
      const verifyRes = await request(app)
        .put(`/api/leaves/${leaveId}/admin-verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          action: 'Verified',
          remarks: 'Official administrative sanction granted. Attendance adjustment permitted.'
        });

      expect(verifyRes.statusCode).toBe(200);
      expect(verifyRes.body.data.status).toBe('Approved');
      expect(verifyRes.body.data.verificationStage).toBe('completed');
      expect(verifyRes.body.data.adminVerification.status).toBe('Verified');
      expect(verifyRes.body.data.adminVerification.verifiedBy.name).toBe('Admin Dean');
    });
  });

  describe('🔐 5. Private Access URLs & Security Headers', () => {
    let leaveId;

    beforeEach(async () => {
      const uploadRes = await request(app)
        .post('/api/leaves/upload-document')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('document', validPdfBuffer, { filename: 'private_doctor_note.pdf', contentType: 'application/pdf' });

      const leaveRes = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          leaveType: 'Medical',
          startDate: '2026-11-01',
          endDate: '2026-11-02',
          reason: 'Oral surgery',
          document: uploadRes.body.data
        });

      leaveId = leaveRes.body.data._id;
    });

    it('MUST REJECT unauthenticated access to private document stream', async () => {
      const res = await request(app).get(`/api/leaves/${leaveId}/document`);
      expect(res.statusCode).toBe(401);
    });

    it('MUST REJECT unauthorized student from viewing another student document', async () => {
      const res = await request(app)
        .get(`/api/leaves/${leaveId}/document`)
        .set('Authorization', `Bearer ${otherStudentToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/Access denied/i);
    });

    it('MUST ALLOW student owner, teacher, admin, and linked parent to view private document', async () => {
      // 1. Student Owner
      const studentStream = await request(app)
        .get(`/api/leaves/${leaveId}/document`)
        .set('Authorization', `Bearer ${studentToken}`);
      expect(studentStream.statusCode).toBe(200);
      expect(studentStream.headers['content-type']).toBe('application/pdf');
      expect(studentStream.headers['x-content-type-options']).toBe('nosniff');

      // 2. Teacher
      const teacherStream = await request(app)
        .get(`/api/leaves/${leaveId}/document`)
        .set('Authorization', `Bearer ${teacherToken}`);
      expect(teacherStream.statusCode).toBe(200);

      // 3. Admin
      const adminStream = await request(app)
        .get(`/api/leaves/${leaveId}/document`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(adminStream.statusCode).toBe(200);

      // 4. Linked Parent
      const parentStream = await request(app)
        .get(`/api/leaves/${leaveId}/document`)
        .set('Authorization', `Bearer ${parentToken}`);
      expect(parentStream.statusCode).toBe(200);
    });

    it('MUST SUPPORT temporary expiring signed preview tokens', async () => {
      // 1. Generate token
      const tokenRes = await request(app)
        .get(`/api/leaves/${leaveId}/document-token`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(tokenRes.statusCode).toBe(200);
      expect(tokenRes.body.token).toBeDefined();
      expect(tokenRes.body.streamUrl).toBeDefined();

      const { token } = tokenRes.body;

      // 2. Stream using token without Authorization header
      const streamRes = await request(app).get(`/api/leaves/document-stream/${token}`);
      expect(streamRes.statusCode).toBe(200);
      expect(streamRes.headers['content-type']).toBe('application/pdf');
      expect(streamRes.headers['x-content-type-options']).toBe('nosniff');

      // 3. Rejects invalid or corrupted token
      const badRes = await request(app).get('/api/leaves/document-stream/invalid_tampered_token_xyz');
      expect(badRes.statusCode).toBe(401);
    });
  });

  describe('⚡ 6. Admin On-Demand Re-scan Endpoint', () => {
    it('allows Admin to re-scan document on disk and verify SHA-256 hash', async () => {
      const uploadRes = await request(app)
        .post('/api/leaves/upload-document')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('document', validPdfBuffer, { filename: 'rescan_test.pdf', contentType: 'application/pdf' });

      const leaveRes = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          leaveType: 'Medical',
          startDate: '2026-11-10',
          endDate: '2026-11-12',
          reason: 'Sprained wrist',
          document: uploadRes.body.data
        });

      const leaveId = leaveRes.body.data._id;

      const rescanRes = await request(app)
        .post(`/api/leaves/${leaveId}/rescan`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(rescanRes.statusCode).toBe(200);
      expect(rescanRes.body.success).toBe(true);
      expect(rescanRes.body.data.scanStatus).toBe('CLEAN');
      expect(rescanRes.body.data.hash).toBe(uploadRes.body.data.hash);
    });
  });
});
