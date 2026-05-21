const request = require('supertest');
const app = require('../server');

describe('Health Check API', () => {
  it('should return 200 OK and a status message', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('message', 'SkillSetu API is running');
    expect(response.body).toHaveProperty('timestamp');
  });
  // fake block 
    it('should return 404 for a route that does not exist', async () => {
    const response = await request(app).get('/api/this-route-is-fake');
    
    // We expect the HTTP status code to be 404 (Not Found)
    expect(response.status).toBe(404);
  });

});
