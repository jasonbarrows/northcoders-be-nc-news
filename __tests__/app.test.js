const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data');
const db = require('../db/connection');
const request = require('supertest');
const app = require('../app');

beforeEach(() => seed(data));
afterAll(() => db.end());

describe('GET /api', () => {
  it('200: responds with an object describing all available endpoints', () => {
    return request(app)
      .get('/api')
      .expect(200)
      .then(({ body }) => {
        const { api } = body;

        Object.keys(api).forEach((key) => {
          const endpoint = api[key];
          expect(endpoint.description).toEqual(expect.any(String));

          if (key !== 'GET /api') {
            expect(endpoint.queries).toEqual(expect.any(Array));
            expect(endpoint.exampleResponse).toEqual(expect.any(Object));
          }

          const verb = key.split(' ')[0];
          if (['POST', 'PUT', 'PATCH'].includes(verb)) {
            expect(endpoint.requestBodyFormat).toBe(expect.any(Object));
          }
        });
      });
  });

  it('404: responds with a 404 status for endpoints that do not exist on /', () => {
    return request(app)
      .get('/banana')
      .expect(404);
  });
});

describe('GET /api/topics', () => {
  it('200: responds with all topics including slug and description properties', () => {
    return request(app)
      .get('/api/topics')
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;

        expect(topics).toBeInstanceOf(Array);
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });

  it('404: responds with a 404 status for endpoints that do not exist on /api', () => {
    return request(app)
      .get('/api/bananas')
      .expect(404);
  });
});

describe('GET /api/articles/:article_id', () => {
  it('200: responds with an article object when given a valid article id', () => {
    return request(app)
      .get('/api/articles/2')
      .expect(200)
      .then(({ body }) => {
        const { article } = body;

        expect(article).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: expect.any(Number),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });

  it('404: responds with not found message when given a valid article id that does not exist', () => {
    return request(app)
      .get('/api/articles/9999')
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe('Not Found');
      });
  });

  it('400: responds with bad request message when given an invalid article id', () => {
    return request(app)
      .get('/api/articles/not-an-article-id')
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('Bad Request');
      });
  });
});
