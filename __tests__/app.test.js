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
        expect(body.message).toBe('Not found');
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
            expect(endpoint.requestBodyFormat).not.toEqual(expect.any(Array));
            expect(endpoint.requestBodyFormat).toEqual(expect.any(Object));
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

  describe('?topic', () => {
    it('200: responds with only articles with that topic', () => {
      return request(app)
        .get('/api/articles?topic=mitch')
        .expect(200)
        .then(({ body }) => {
          const { articles } = body

          expect(articles).toHaveLength(12);
          articles.forEach((article) => {
            expect(article.topic).toBe('mitch');
          });
        });
    });

    it('200: responds with an empty array if the topic exists but there are no articles with that topic', () => {
      return request(app)
        .get('/api/articles?topic=paper')
        .expect(200)
        .then(({ body }) => {
          const { articles } = body
          expect(articles).toBeInstanceOf(Array);
          expect(articles).toHaveLength(0);
        });
    });

    it('404: responds with topic not found if the topic does not exist', () => {
      return request(app)
        .get('/api/articles?topic=non-existent-topic')
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe('Topic not found');
        });
    });
  });

  describe('?sort_by (sorted in descending order by default)', () => {
    it('200: responds with articles sorted by a valid sort_by option', () => {
      return request(app)
        .get('/api/articles?sort_by=title')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy('title', { descending: true });
        });
    });

    it('400: responds with invalid sort_by query for an invalid sort_by query', () => {
      return request(app)
        .get('/api/articles?sort_by=invalid-column')
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe('Invalid sort_by query');
        });
    });
  });

  describe('?order', () => {
    it('200: responds with articles sorted in ascending order when order is asc', () => {
      return request(app)
        .get('/api/articles?order=asc')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy('created_at', { ascending: true });
        });
    });

    it('200: responds with articles sorted in descending order when order is DESC', () => {
      return request(app)
        .get('/api/articles?order=DESC')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy('created_at', { descending: true });
        });
    });

    it('400: responds with invalid order query for an invalid order query', () => {
      return request(app)
        .get('/api/articles?order=not-a-valid-order')
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe('Invalid order query');
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

  it('200: articles should also include a comment_count property', () => {
    return request(app)
      .get('/api/articles/2')
      .expect(200)
      .then(({ body }) => {
        const { article } = body;

        expect(article.comment_count).toEqual(expect.any(Number));
      });
  });

  it('404: responds with not found message when given a valid article id that does not exist', () => {
    return request(app)
      .get('/api/articles/9999')
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe('Not found');
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
        expect(body.message).toBe('Not found');
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

describe('POST /api/articles/:article_id/comments', () => {
  it('201: creates a new comment for a valid article id and responds with the new comment object', () => {
    const testNewComment = {
      username: 'butter_bridge',
      body: 'This is a test comment body.',
    };

    return request(app)
      .post('/api/articles/1/comments')
      .send(testNewComment)
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;

        expect(comment).toMatchObject({
          comment_id: expect.any(Number),
          body: expect.any(String),
          article_id: expect.any(Number),
          author: expect.any(String),
          votes: expect.any(Number),
          created_at: expect.any(String),
        });
      });
  });

  it('201: ignores additional properties passed in the request body', () => {
    const testNewComment = {
      username: 'butter_bridge',
      body: 'This is a test comment body.',
      votes: 100,
      foo: 'bar',
    };

    return request(app)
      .post('/api/articles/1/comments')
      .send(testNewComment)
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;

        expect(comment.votes).not.toBe(100);
        expect(comment).not.toHaveProperty('foo');
      });
  });

  it('400: a username property is required in the request body', () => {
    const testNewComment = {
      body: 'This is a test comment body.',
    };

    return request(app)
      .post('/api/articles/1/comments')
      .send(testNewComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('Bad Request');
      });
  });

  it('400: a username must belong to a valid user', () => {
    const testNewComment = {
      username: 'john',
      body: 'This is a test comment body.',
    };

    return request(app)
      .post('/api/articles/1/comments')
      .send(testNewComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('Bad Request');
      });
  });

  it('400: a body property is required in the request body', () => {
    const testNewComment = {
      username: 'butter_bridge',
    };

    return request(app)
      .post('/api/articles/1/comments')
      .send(testNewComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('Bad Request');
      });
  });

  it('404: responds with not found when given a valid article id that does not exist', () => {
    const testNewComment = {
      username: 'butter_bridge',
      body: 'This is a test comment body.',
    };

    return request(app)
      .post('/api/articles/9999/comments')
      .send(testNewComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe('Not found');
      });
  });

  it('400: responds with bad request when given an invalid article id', () => {
    const testNewComment = {
      username: 'butter_bridge',
      body: 'This is a test comment body.',
    };

    return request(app)
      .post('/api/articles/not-an-article-id/comments')
      .send(testNewComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('Bad Request');
      });
  });
});

describe('PATCH /api/articles/:article_id', () => {
  it('200: should increment an article\'s votes count by a positive inc_votes property for a valid article id and responds with the updated article', () => {
    const testBody = { inc_votes: 1 };

    return request(app)
      .patch('/api/articles/1')
      .send(testBody)
      .expect(200)
      .then(({ body }) => {
        const { article } = body;

        expect(article.votes).toBe(101);
      });
  });

  it('200: should decrement an article\'s votes count by a negative inc_votes property for a valid article id and responds with the updated article', () => {
    const testBody = { inc_votes: -87 };

    return request(app)
      .patch('/api/articles/1')
      .send(testBody)
      .expect(200)
      .then(({ body }) => {
        const { article } = body;

        expect(article.votes).toBe(13);
      });
  });

  it('200: ignores additional properties passed in the request body ', () => {
    const testBody = {
      inc_votes: 1,
      body: 'New test body',
    };

    return request(app)
      .patch('/api/articles/1')
      .send(testBody)
      .expect(200)
      .then(({ body }) => {
        expect(body.article.body).not.toBe(testBody.body);
      });
  });

  it('400: a inc_votes property is required in the request body', () => {
    const testBody = {};

    return request(app)
      .patch('/api/articles/1')
      .send(testBody)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('Bad Request');
      });
  });

  it('400: responds with bad request when inc_votes is not an integer', () => {
    const testBody = { inc_votes: 'not-an-integer' };

    return request(app)
    .patch('/api/articles/1')
    .send(testBody)
    .expect(400)
    .then(({ body }) => {
      expect(body.message).toBe('Bad Request');
    });
  });

  it('404: responds with not found when given a valid article id that does not exist', () => {
    const testBody = { inc_votes: 1 };

    return request(app)
      .patch('/api/articles/9999')
      .send(testBody)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe('Not found');
      });
  });

  it('400: responds with bad request when given an invalid article id', () => {
    const testBody = { inc_votes: 1 };

    return request(app)
    .patch('/api/articles/not-an-article-id')
    .send(testBody)
    .expect(400)
    .then(({ body }) => {
      expect(body.message).toBe('Bad Request');
    });
  });
});

describe('DELETE /api/comments/:comment_id', () => {
  it('204: should delete the comment with the given comment id', () => {
    return request(app)
      .delete('/api/comments/1')
      .expect(204);
  });

  it('404: should return not found if the comment id is valid but does not exist', () => {
    return request(app)
      .delete('/api/comments/999')
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe('Not found');
      });
  });

  it('400: should return bad request when given an invalid comment id', () => {
    return request(app)
      .delete('/api/comments/not-a-valid-id')
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('Bad Request');
      });
  });
});

describe('GET /api/users', () => {
  it('200: responds with an array of all user objects that include the required properties', () => {
    return request(app)
      .get('/api/users')
      .expect(200)
      .then(({ body }) => {
        const { users } = body;

        expect(users).toBeInstanceOf(Array);
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe('GET /api/users/:username', () => {
  it('200: responds with a user object when given a valid username', () => {
    return request(app)
      .get('/api/users/butter_bridge')
      .expect(200)
      .then(({ body }) => {
        const { user } = body;

        expect(user).toMatchObject({
          username: expect.any(String),
          name: expect.any(String),
          avatar_url: expect.any(String),
        });
      });
  });

  it('404: responds with not found message when given a username that does not exist', () => {
    return request(app)
      .get('/api/users/unknown-user')
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe('Not found');
      });
  });
});
