import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('RBAC Authorization Tests', () => {
  let adminToken = '';
  let managerToken = '';
  let memberToken = '';

  beforeAll(async () => {
    // Login as Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@clientflow.io', password: 'Password123!' });
    adminToken = adminRes.body.data.accessToken;

    // Login as Manager
    const managerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@clientflow.io', password: 'Password123!' });
    managerToken = managerRes.body.data.accessToken;

    // Login as Member
    const memberRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alex.chen@clientflow.io', password: 'Password123!' });
    memberToken = memberRes.body.data.accessToken;
  });

  it('should allow Admin to create a client', async () => {
    const res = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Admin Created Client LLC',
        status: 'ACTIVE'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should allow Manager to create a client', async () => {
    const res = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        name: 'Manager Created Client LLC',
        status: 'ACTIVE'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should FORBID Member from creating a client (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        name: 'Member Illegal Client',
        status: 'ACTIVE'
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should FORBID Manager from archiving client (Admin only)', async () => {
    // First get a client
    const clientsRes = await request(app)
      .get('/api/clients')
      .set('Authorization', `Bearer ${managerToken}`);
    const clientId = clientsRes.body.data[0].id;

    const res = await request(app)
      .delete(`/api/clients/${clientId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(403);
  });

  it('should ALLOW Admin to archive client', async () => {
    const clientsRes = await request(app)
      .get('/api/clients')
      .set('Authorization', `Bearer ${adminToken}`);
    const clientId = clientsRes.body.data[0].id;

    const res = await request(app)
      .delete(`/api/clients/${clientId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ARCHIVED');
  });
});
