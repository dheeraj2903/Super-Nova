require('dotenv').config();

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key_123';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const userModel = require('../src/models/user.model');

jest.setTimeout(30000);

describe('Address Management APIs', () => {
  let userACookie;
  let userBCookie;
  let userAAddressId;
  let userBAddressId;

  const ADDRESS_API = '/api/auth/users/me/addresses';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/super-nova');
    }

    // Clean up
    await userModel.deleteMany({ email: { $in: ['usera_test@example.com', 'userb_test@example.com'] } });

    // Register User A
    await request(app).post('/api/auth/register').send({
      username: 'user_a_test',
      email: 'usera_test@example.com',
      password: 'password123',
      fullName: { firstName: 'User', lastName: 'A' }
    });

    // Register User B
    await request(app).post('/api/auth/register').send({
      username: 'user_b_test',
      email: 'userb_test@example.com',
      password: 'password123',
      fullName: { firstName: 'User', lastName: 'B' }
    });

    // Login User A
    const loginA = await request(app).post('/api/auth/login').send({
      email: 'usera_test@example.com',
      password: 'password123'
    });
    userACookie = loginA.headers['set-cookie'];

    // Safeguard check
    if (!userACookie) {
      throw new Error(`Login A failed with status ${loginA.statusCode}: ${JSON.stringify(loginA.body)}`);
    }

    // Login User B
    const loginB = await request(app).post('/api/auth/login').send({
      email: 'userb_test@example.com',
      password: 'password123'
    });
    userBCookie = loginB.headers['set-cookie'];

    if (!userBCookie) {
      throw new Error(`Login B failed with status ${loginB.statusCode}: ${JSON.stringify(loginB.body)}`);
    }
  });

  afterAll(async () => {
    await userModel.deleteMany({ email: { $in: ['usera_test@example.com', 'userb_test@example.com'] } });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  // ==========================================
  // 1. POST Address
  // ==========================================
  describe('POST Address', () => {
    it('1.1 Should create a new address successfully with valid data', async () => {
      const res = await request(app)
        .post(ADDRESS_API)
        .set('Cookie', userACookie)
        .send({
          street: '123 Main Street',
          city: 'Bhopal',
          state: 'MP',
          zip: '462001',
          country: 'India',
          isDefault: true
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('address');
      expect(res.body.address).toHaveProperty('_id');
      expect(res.body.address.street).toBe('123 Main Street');

      userAAddressId = res.body.address._id;
    });

    it('1.2 Should return 401 Unauthorized if token/cookie is not provided', async () => {
      const res = await request(app)
        .post(ADDRESS_API)
        .send({
          street: '123 Main Street',
          city: 'Bhopal'
        });

      expect(res.statusCode).toEqual(401);
    });
  });

  // ==========================================
  // 2. GET Addresses
  // ==========================================
  describe('GET Addresses', () => {
    it('2.1 Should fetch all addresses for the logged-in user', async () => {
      const res = await request(app)
        .get(ADDRESS_API)
        .set('Cookie', userACookie);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('User addresses fetched successfully');
      expect(Array.isArray(res.body.addresses)).toBe(true);
      expect(res.body.addresses.length).toBeGreaterThan(0);
    });

    it('2.2 Should return 401 Unauthorized if no token is passed', async () => {
      const res = await request(app).get(ADDRESS_API);
      expect(res.statusCode).toEqual(401);
    });
  });

  // ==========================================
  // 3. DELETE Address
  // ==========================================
  describe('DELETE Address', () => {
    beforeAll(async () => {
      const res = await request(app)
        .post(ADDRESS_API)
        .set('Cookie', userBCookie)
        .send({
          street: '456 Park Avenue',
          city: 'Indore',
          state: 'MP',
          zip: '452001',
          country: 'India'
        });

      if (res.body && res.body.address) {
        userBAddressId = res.body.address._id;
      }
    });

    it('3.1 Security Check (IDOR): User A should NOT delete User B address', async () => {
      if (!userBAddressId) return;

      const res = await request(app)
        .delete(`${ADDRESS_API}/${userBAddressId}`)
        .set('Cookie', userACookie);

      expect(res.statusCode).toEqual(404);

      const checkRes = await request(app)
        .get(ADDRESS_API)
        .set('Cookie', userBCookie);

      const exists = checkRes.body.addresses.some(
        (addr) => addr._id.toString() === userBAddressId.toString()
      );
      expect(exists).toBe(true);
    });

    it('3.2 Should successfully delete own address', async () => {
      const res = await request(app)
        .delete(`${ADDRESS_API}/${userAAddressId}`)
        .set('Cookie', userACookie);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Address deleted successfully');

      const checkRes = await request(app)
        .get(ADDRESS_API)
        .set('Cookie', userACookie);

      const exists = checkRes.body.addresses.some(
        (addr) => addr._id.toString() === userAAddressId.toString()
      );
      expect(exists).toBe(false);
    });
  });
});