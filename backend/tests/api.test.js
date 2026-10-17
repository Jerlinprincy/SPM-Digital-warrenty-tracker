process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_12345';
const request = require('supertest');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { app } = require('../server');
const User = require('../models/User');
const Product = require('../models/Product');
const ServiceRecord = require('../models/ServiceRecord');
const Notification = require('../models/Notification');
const { generateReminders } = require('../services/notificationService');

describe('Full Application API Integration Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });
  let user1Token;
  let user1Id;
  let user2Token;
  let user2Id;
  let product1Id;
  let service1Id;

  const testUser1 = {
    name: 'Alice Cooper',
    email: `alice_${Date.now()}@example.com`,
    password: 'password123',
  };

  const testUser2 = {
    name: 'Bob Martin',
    email: `bob_${Date.now()}@example.com`,
    password: 'password456',
  };

  afterAll(async () => {
    // Clean up test data created during test run
    if (user1Id) {
      await Product.deleteMany({ userId: user1Id });
      await ServiceRecord.deleteMany({ userId: user1Id });
      await Notification.deleteMany({ userId: user1Id });
      await User.findByIdAndDelete(user1Id);
    }
    if (user2Id) {
      await Product.deleteMany({ userId: user2Id });
      await ServiceRecord.deleteMany({ userId: user2Id });
      await Notification.deleteMany({ userId: user2Id });
      await User.findByIdAndDelete(user2Id);
    }
    await mongoose.connection.close();
  });

  describe('1. Authentication Module & Access Protection', () => {
    test('POST /api/auth/register - Successfully registers User 1', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser1);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testUser1.email.toLowerCase());
      expect(res.body.user.passwordHash).toBeUndefined(); // Never expose password

      user1Token = res.body.token;
      user1Id = res.body.user.id;
    });

    test('POST /api/auth/register - Rejects registration with duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser1);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    test('POST /api/auth/register - Rejects registration with missing fields or short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'bad@example.com', password: '123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('POST /api/auth/login - Authenticates with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser1.email, password: testUser1.password });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    test('POST /api/auth/login - Rejects invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser1.email, password: 'wrongpassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('GET /api/auth/me - Rejects unauthorized requests without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('GET /api/auth/me - Returns current user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.name).toBe(testUser1.name);
    });

    test('Register User 2 for multi-tenant isolation testing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser2);

      expect(res.statusCode).toBe(201);
      user2Token = res.body.token;
      user2Id = res.body.user.id;
    });
  });

  describe('2. Product Management Module & Warranty Calculations', () => {
    test('POST /api/products - Creates a product with auto-computed inclusive warranty date', async () => {
      const newProduct = {
        productName: 'Samsung Neo QLED 65 Inch TV',
        category: 'Electronics',
        brand: 'Samsung',
        modelNumber: 'QN65QN90B',
        serialNumber: 'SN-SAM-98231',
        purchaseDate: '2024-01-15',
        purchasePrice: 1499.99,
        seller: 'Best Buy',
        warrantyDurationMonths: 24,
        warrantyStartDate: '2024-01-15',
        description: 'Living room primary display',
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(newProduct);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.product.productName).toBe(newProduct.productName);
      // 24 months from 2024-01-15 inclusive ends on 2026-01-14
      expect(res.body.product.warrantyExpiryDate).toBeDefined();
      expect(new Date(res.body.product.warrantyExpiryDate).toISOString()).toContain('2026-01-14');

      product1Id = res.body.product._id;
    });

    test('POST /api/products - Rejects product creation when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ productName: 'Incomplete' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('GET /api/products - Returns list of user products with warrantyStatus virtuals', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.products.length).toBeGreaterThanOrEqual(1);
      const prod = res.body.products.find((p) => p._id === product1Id);
      expect(prod).toBeDefined();
      expect(prod.warrantyStatus).toBeDefined();
      expect(prod.warrantyStatus.status).toBeDefined();
    });

    test('PUT /api/products/:id - Updates product and recalculates warranty expiration', async () => {
      const res = await request(app)
        .put(`/api/products/${product1Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          warrantyDurationMonths: 36,
          seller: 'Costco Wholesale',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.product.seller).toBe('Costco Wholesale');
      // Recalculated 36 months from 2024-01-15 ends on 2027-01-14
      expect(new Date(res.body.product.warrantyExpiryDate).toISOString()).toContain('2027-01-14');
    });

    test('Security & Multi-Tenant: User 2 CANNOT access or update User 1 product', async () => {
      // User 2 trying to get User 1's product
      const getRes = await request(app)
        .get(`/api/products/${product1Id}`)
        .set('Authorization', `Bearer ${user2Token}`);
      expect(getRes.statusCode).toBe(404);

      // User 2 trying to update User 1's product
      const putRes = await request(app)
        .put(`/api/products/${product1Id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ productName: 'Hacked Product' });
      expect(putRes.statusCode).toBe(404);

      // User 2 trying to delete User 1's product
      const delRes = await request(app)
        .delete(`/api/products/${product1Id}`)
        .set('Authorization', `Bearer ${user2Token}`);
      expect(delRes.statusCode).toBe(404);
    });
  });

  describe('3. Service & Maintenance Management Module', () => {
    test('POST /api/services - Schedules a maintenance service appointment', async () => {
      const newService = {
        productId: product1Id,
        title: 'Screen Calibration & Firmware Update',
        description: 'Professional color calibration',
        scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days ahead
        serviceProvider: 'Geek Squad',
        estimatedCost: 120.0,
      };

      const res = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(newService);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.service.status).toBe('Scheduled');
      expect(res.body.service.title).toBe(newService.title);

      service1Id = res.body.service._id;
    });

    test('Security & Multi-Tenant: User 2 CANNOT schedule service on User 1 product', async () => {
      const res = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          productId: product1Id,
          title: 'Unauthorized service',
          scheduledDate: new Date().toISOString(),
        });

      expect(res.statusCode).toBe(404);
    });

    test('PUT /api/services/:id - Marks service as Completed with actual cost', async () => {
      const res = await request(app)
        .put(`/api/services/${service1Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          status: 'Completed',
          actualCost: 110.0,
          notes: 'Completed ahead of schedule, discount applied',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.service.status).toBe('Completed');
      expect(res.body.service.actualCost).toBe(110.0);
      expect(res.body.service.completedAt).toBeDefined();
    });
  });

  describe('4. Dashboard Analytics Module', () => {
    test('GET /api/dashboard/summary - Accurately computes user metrics', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalProducts).toBeGreaterThanOrEqual(1);
      expect(res.body.data.completedServices).toBeGreaterThanOrEqual(1);
    });

    test('GET /api/dashboard/warranty-stats - Returns correct status distribution array', async () => {
      const res = await request(app)
        .get('/api/dashboard/warranty-stats')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((d) => d.name === 'Active')).toBe(true);
    });

    test('GET /api/dashboard/category-stats - Aggregates product spend by category', async () => {
      const res = await request(app)
        .get('/api/dashboard/category-stats')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      const electronics = res.body.data.find((c) => c.name === 'Electronics');
      expect(electronics).toBeDefined();
      expect(electronics.count).toBeGreaterThanOrEqual(1);
    });
  });

  describe('5. Notification System & Deduplication Engine', () => {
    test('Notification engine idempotency and deduplicationKey check', async () => {
      // Create a test product expiring today to test notification creation
      const expiringProduct = await Product.create({
        userId: user1Id,
        productName: 'Expiring Blender',
        category: 'Kitchen Appliances',
        brand: 'Ninja',
        modelNumber: 'NJ-100',
        purchaseDate: new Date('2023-01-01'),
        purchasePrice: 99.99,
        warrantyDurationMonths: 12,
        warrantyStartDate: new Date('2023-01-01'),
        warrantyExpiryDate: new Date(), // Expires today
      });

      // Run reminder generator first time
      const run1 = await generateReminders();
      expect(run1.success).toBe(true);

      // Fetch created notifications
      const notifs1 = await Notification.find({ userId: user1Id });
      const initialCount = notifs1.length;

      // Run reminder generator second time (Simulate server restart or repeated cron)
      const run2 = await generateReminders();
      expect(run2.success).toBe(true);

      // Verify count did NOT increase (deduplication key prevented duplicate reminder)
      const notifs2 = await Notification.find({ userId: user1Id });
      expect(notifs2.length).toBe(initialCount);

      // Clean up test product
      await expiringProduct.deleteOne();
    });

    test('GET /api/notifications - Fetches user notifications with unread count', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.unreadCount).toBeDefined();
    });

    test('PATCH /api/notifications/read-all - Marks all user notifications as read', async () => {
      const res = await request(app)
        .patch('/api/notifications/read-all')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify unread count is now 0
      const checkRes = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(checkRes.body.unreadCount).toBe(0);
    });
  });

  describe('6. Cascade Product Deletion & Cleanup', () => {
    test('DELETE /api/products/:id - Cascades and removes associated services', async () => {
      const res = await request(app)
        .delete(`/api/products/${product1Id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify product is gone
      const checkProduct = await Product.findById(product1Id);
      expect(checkProduct).toBeNull();

      // Verify associated service was also deleted (cascade)
      const checkService = await ServiceRecord.findById(service1Id);
      expect(checkService).toBeNull();
    });
  });
});
