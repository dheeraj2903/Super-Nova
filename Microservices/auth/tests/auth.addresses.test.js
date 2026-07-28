const request = require('supertest');
const app = require('../src/app'); // Tumhari Express app ka path

describe('Address Management APIs', () => {
  let userAToken;
  let userBToken;
  let userAAddressId;
  let userBAddressId;

  // Setup: Users login karke JWT tokens nikalna
  beforeAll(async () => {
    // User A Login (Prefix /api fix kiya)
    const resA = await request(app)
      .post('/api/auth/login')
      .send({ email: 'usera@example.com', password: 'Password123!' });
    userAToken = resA.body.token;

    // User B Login
    const resB = await request(app)
      .post('/api/auth/login')
      .send({ email: 'userb@example.com', password: 'Password123!' });
    userBToken = resB.body.token;
  });


  describe('POST /api/auth/users/me/addresses', () => {
    it('1.1 Should create a new address successfully with valid data', async () => {
      const res = await request(app)
        .post('/api/auth/users/me/addresses')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          street: '123 Main Street',
          city: 'Bhopal',
          state: 'MP',
          postalCode: '462001',
          country: 'India',
          isDefault: true
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.street).toBe('123 Main Street');
      
      userAAddressId = res.body.id;
    });

    it('1.2 Should return 400 Bad Request when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/users/me/addresses')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          city: 'Bhopal'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
    });

    it('1.3 Should return 401 Unauthorized if token is not provided', async () => {
      const res = await request(app)
        .post('/api/auth/users/me/addresses')
        .send({
          street: '123 Main Street',
          city: 'Bhopal',
          postalCode: '462001'
        });

      expect(res.statusCode).toEqual(401);
    });
  });

  // ==========================================
  // 2. GET /api/auth/users/me/addresses
  // ==========================================
  describe('GET /api/auth/users/me/addresses', () => {
    it('2.1 Should fetch all addresses for the logged-in user', async () => {
      const res = await request(app)
        .get('/api/auth/users/me/addresses')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('2.2 Should return 401 Unauthorized if no token is passed', async () => {
      const res = await request(app).get('/api/auth/users/me/addresses');
      expect(res.statusCode).toEqual(401);
    });
  });

  // ==========================================
  // 3. DELETE /api/auth/users/me/addresses/:addressId
  // ==========================================
  describe('DELETE /api/auth/users/me/addresses/:addressId', () => {
    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/users/me/addresses')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          street: '456 Park Avenue',
          city: 'Indore',
          state: 'MP',
          postalCode: '452001',
          country: 'India'
        });
      userBAddressId = res.body.id;
    });

    it('3.1 Security Check (BOLA/IDOR): User A should NOT be able to delete User B address', async () => {
      const res = await request(app)
        .delete(`/api/auth/users/me/addresses/${userBAddressId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect([403, 404]).toContain(res.statusCode);
    });

    it('3.2 Should return 404 if addressId does not exist', async () => {
      const nonExistentId = '99999999-9999-9999-9999-999999999999';
      const res = await request(app)
        .delete(`/api/auth/users/me/addresses/${nonExistentId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.statusCode).toEqual(404);
    });

    it('3.3 Should successfully delete own address', async () => {
      const res = await request(app)
        .delete(`/api/auth/users/me/addresses/${userAAddressId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect([200, 204]).toContain(res.statusCode);

      const checkRes = await request(app)
        .get('/api/auth/users/me/addresses')
        .set('Authorization', `Bearer ${userAToken}`);
      
      const exists = checkRes.body.some(addr => addr.id === userAAddressId);
      expect(exists).toBe(false);
    });
  });
});