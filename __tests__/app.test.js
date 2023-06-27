const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data');
const db = require('../db/connection');
const request = require('supertest');
const app = require('../app');

beforeEach(() => seed(data));
afterAll(() => db.end());

describe('ALL non-existent paths', () => {
  it('404: should return a custom error message when the route does not exist', () => {
    return request(app)
      .get('/api/not-a-valid-route')
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe('Not Found');
      });
  });
});

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
});

describe('GET /api/articles', () => {
  it('200: responds with all articles each of which include the required properties sorted by date in descending order', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then((response) => {
        const { articles } = response.body

        expect(articles).toBeInstanceOf(Array);
        expect(articles).toHaveLength(13);
        expect(articles).toBeSortedBy('created_at', { descending: true });

        articles.forEach((article) => {
          expect(article.body).not.toBeDefined();

          expect(article).toMatchObject({
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
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

describe('GET /api/articles/:article_id/comments', () => {
  it('200: responds with all comments when given a valid article id', () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;

        expect(comments).toBeInstanceOf(Array);
        expect(comments).toHaveLength(11);
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            article_id: expect.any(Number),
            body: expect.any(String),
            author: expect.any(String),
            votes: expect.any(Number),
            created_at: expect.any(String),
          });
        });
      });
  });

  it('200: responds with an empty array if the article id exists but has no comments', () => {
    return request(app)
      .get('/api/articles/2/comments')
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;

        expect(comments).toBeInstanceOf(Array);
        expect(comments).toHaveLength(0);
      });
  });

  it('404: responds with not found when given a valid article id that does not exist', () => {
    return request(app)
      .get('/api/articles/9999/comments')
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe('Not Found');
      });
  });

  it('400: responds with bad request when given an invalid article id', () => {
    return request(app)
      .get('/api/articles/not-an-article-id/comments')
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('Bad Request');
      });
  });
});
