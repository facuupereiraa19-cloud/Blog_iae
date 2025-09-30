import request from 'supertest';
import { app } from '../server.js';

describe('API basic endpoints (DEMO)', function () {
  let token = '';
  let createdId = '';

  it('GET /api/ping -> 200', async function () {
    const res = await request(app).get('/api/ping');
    if (res.status !== 200) throw new Error('Expected 200');
    if (!res.body || res.body.message !== 'pong') throw new Error('Invalid ping response');
  });

  it('GET /api/health -> 200', async function () {
    const res = await request(app).get('/api/health');
    if (res.status !== 200) throw new Error('Expected 200');
    if (!res.body || typeof res.body.ok === 'undefined') throw new Error('Invalid health');
  });

  it('POST /api/auth/login (demo creds) -> token', async function () {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@iae.com', password: 'admin123' });
    if (res.status !== 200) throw new Error(`Login failed: ${res.text}`);
    if (!res.body || !res.body.token) throw new Error('Missing token');
    token = res.body.token;
  });

  it('GET /api/posts -> array', async function () {
    const res = await request(app).get('/api/posts');
    if (res.status !== 200) throw new Error('Expected 200');
    if (!Array.isArray(res.body)) throw new Error('Expected array');
  });

  it('POST /api/posts -> create', async function () {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'T1', content: 'C1' });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}: ${res.text}`);
    if (!res.body || !res.body._id) throw new Error('Missing created id');
    createdId = String(res.body._id);
  });

  it('PUT /api/posts/:id -> update', async function () {
    const res = await request(app)
      .put(`/api/posts/${createdId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'C2' });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${res.text}`);
    if (!res.body || res.body.content !== 'C2') throw new Error('Did not update content');
  });

  it('POST /api/posts/:id/view -> increment', async function () {
    const res = await request(app).post(`/api/posts/${createdId}/view`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.body || typeof res.body.views !== 'number') throw new Error('Invalid views payload');
  });

  it('POST /api/posts/:id/like -> increment', async function () {
    const res = await request(app).post(`/api/posts/${createdId}/like`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.body || typeof res.body.likes !== 'number') throw new Error('Invalid likes payload');
  });

  it('DELETE /api/posts/:id -> delete', async function () {
    const res = await request(app)
      .delete(`/api/posts/${createdId}`)
      .set('Authorization', `Bearer ${token}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${res.text}`);
  });
});

