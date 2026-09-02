import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Operations Integration Suite (Clients, Projects, Tasks, Dashboard)', () => {
  let adminToken = '';
  let memberToken = '';
  let createdClientId = '';
  let createdProjectId = '';
  let createdTaskId = '';

  beforeAll(async () => {
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@clientflow.io', password: 'Password123!' });
    adminToken = adminRes.body.data.accessToken;

    const memberRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alex.chen@clientflow.io', password: 'Password123!' });
    memberToken = memberRes.body.data.accessToken;
  });

  // Client tests
  it('should list clients with pagination and count', async () => {
    const res = await request(app)
      .get('/api/clients?page=1&limit=5')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBeGreaterThan(0);
  });

  it('should filter clients by status', async () => {
    const res = await request(app)
      .get('/api/clients?status=ACTIVE')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    res.body.data.forEach((c: any) => {
      expect(c.status).toBe('ACTIVE');
    });
  });

  it('should create a new client and add contacts', async () => {
    const res = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Quantum Logistics Group',
        company: 'Quantum Global Inc',
        email: 'contact@quantumlogistics.io',
        status: 'ACTIVE'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Quantum Logistics Group');
    createdClientId = res.body.data.id;

    // Add contact
    const contactRes = await request(app)
      .post(`/api/clients/${createdClientId}/contacts`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Jonathan Miller',
        email: 'jmiller@quantumlogistics.io',
        title: 'Chief Technology Officer',
        isPrimary: true
      });

    expect(contactRes.status).toBe(201);
    expect(contactRes.body.data.name).toBe('Jonathan Miller');
  });

  // Project tests
  it('should create a project under client with members', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'AI Routing Engine',
        description: 'Dynamic graph optimization routing for logistics fleet.',
        clientId: createdClientId,
        status: 'ACTIVE',
        priority: 'HIGH',
        budget: 75000
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('AI Routing Engine');
    createdProjectId = res.body.data.id;
  });

  it('should list projects with task completion metrics', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].stats).toBeDefined();
    expect(res.body.data[0].stats.progress).toBeDefined();
  });

  // Task tests
  it('should create a task in project and assign to member', async () => {
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${memberToken}`);
    const memberId = meRes.body.data.id;

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Implement Dijkstra shortest path route optimizer',
        description: 'Implement A* heuristic fallback for dense city topologies.',
        projectId: createdProjectId,
        assigneeId: memberId,
        priority: 'URGENT',
        status: 'TODO',
        estimatedHours: 20
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Implement Dijkstra shortest path route optimizer');
    expect(res.body.data.status).toBe('TODO');
    createdTaskId = res.body.data.id;
  });

  it('should update task status from TODO -> IN_PROGRESS -> DONE', async () => {
    // 1. Move to IN_PROGRESS
    const progressRes = await request(app)
      .patch(`/api/tasks/${createdTaskId}/status`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ status: 'IN_PROGRESS' });

    expect(progressRes.status).toBe(200);
    expect(progressRes.body.data.status).toBe('IN_PROGRESS');

    // 2. Move to DONE
    const doneRes = await request(app)
      .patch(`/api/tasks/${createdTaskId}/status`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ status: 'DONE' });

    expect(doneRes.status).toBe(200);
    expect(doneRes.body.data.status).toBe('DONE');
    expect(doneRes.body.data.completedAt).toBeDefined();
  });

  // Dashboard tests
  it('should compute real database aggregate KPI statistics', async () => {
    const res = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.clients.total).toBeGreaterThan(0);
    expect(res.body.data.projects.total).toBeGreaterThan(0);
    expect(res.body.data.tasks.total).toBeGreaterThan(0);
    expect(res.body.data.tasks.completed).toBeGreaterThan(0);
  });

  it('should return chart breakdown and team workload data', async () => {
    const chartRes = await request(app)
      .get('/api/dashboard/charts')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(chartRes.status).toBe(200);
    expect(chartRes.body.data.projectsByStatus).toBeDefined();
    expect(chartRes.body.data.tasksByStatus).toBeDefined();

    const workloadRes = await request(app)
      .get('/api/dashboard/workload')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(workloadRes.status).toBe(200);
    expect(workloadRes.body.data).toBeInstanceOf(Array);
    expect(workloadRes.body.data[0].totalAssigned).toBeDefined();
  });

  it('should return audit activity log', async () => {
    const res = await request(app)
      .get('/api/activities')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
