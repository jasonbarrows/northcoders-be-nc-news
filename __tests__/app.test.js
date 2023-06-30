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

describe('GET /api/articles', () => {
  it('200: responds with all articles each of which include the required properties sorted by date in descending order', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then((response) => {
        const { articles } = response.body

        expect(articles).toBeInstanceOf(Array);
        expect(articles.length).toBeGreaterThan(1);
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

          expect(articles.length).toBeGreaterThan(1);
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

  describe('?limit', () => {
    it('200: responds with an array of articles limited to the length of limit', () => {
      return request(app)
        .get('/api/articles?limit=5')
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toHaveLength(5);
        });
    });

    it('200: responds with an array of 10 articles by default when not specifically assigned a value', () => {
      return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toHaveLength(10);
        });
    });

    it('400: responds with invalid limit query for an invalid limit query', () => {
      return request(app)
        .get('/api/articles?limit=not-an-integer')
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe('Invalid limit query');
        });
    });
  });

  describe('?p', () => {
    it('200: responds with an array of articles starting at page 1 of n pages', () => {
      return request(app)
        .get('/api/articles?p=1&sort_by=article_id&order=ASC')
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toHaveLength(10);

          const articleIds = articles.map((article) => article.article_id)
          expect(articleIds).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        });
    });

    it('200: responds with an array of articles starting at page 2 of n pages', () => {
      return request(app)
        .get('/api/articles?p=2&sort_by=article_id&order=ASC')
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toHaveLength(3);

          const articleIds = articles.map((article) => article.article_id)
          expect(articleIds).toEqual([11, 12, 13]);
        });
    });

    it('200: responds with an empty array when page is out of range', () => {
      return request(app)
        .get('/api/articles?p=99')
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;

          expect(articles).toBeInstanceOf(Array);
          expect(articles).toHaveLength(0);
        });
    });

    it('400: responds with bad request when page is not a number', () => {
      return request(app)
        .get('/api/articles?p=banana')
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe('Bad request');
        });
    });
  });

  describe('?total_count', () => {
    it('200: it includes a total_count property displaying the total number of articles including any filters applied but discounting the limit', () => {
      return request(app)
        .get('/api/articles?total_count')
        .expect(200)
        .then(({ body }) => {
          const { articles, total_count } = body;
          expect(articles).toHaveLength(10);
          expect(total_count).toBe(13);
        });
    });
  });
});

describe('POST /api/articles', () => {
  it('201: should add a new article and respond with the newly added article', () => {
    const testBody = {
      author: 'butter_bridge',
      title: 'New article title',
      body: 'New article body',
      topic: 'mitch',
      article_img_url: 'New article image URL',
    };

    return request(app)
      .post('/api/articles')
      .send(testBody)
      .expect(201)
      .then(({ body }) => {
        const newArticle = body.article;

        expect(newArticle).toMatchObject({
          ...testBody,
          article_id: expect.any(Number),
          votes: 0,
          created_at: expect.any(String),
          comment_count: 0,
        });
      });
  });

  it('201: article_image_url is optional', () => {
    const testBody = {
      author: 'butter_bridge',
      title: 'New article title',
      body: 'New article body',
      topic: 'mitch',
    };

    return request(app)
      .post('/api/articles')
      .send(testBody)
      .expect(201)
      .then(({ body }) => {
        const newArticle = body.article;

        expect(newArticle.article_img_url).toBe(
          'https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700'
        );
      });
  });

  it('201: ignores additional properties passed in the request body', () => {
    const testBody = {
      author: 'butter_bridge',
      title: 'New article title',
      body: 'New article body',
      topic: 'mitch',
      votes: 100,
      foo: 'bar',
    };

    return request(app)
      .post('/api/articles')
      .send(testBody)
      .expect(201)
      .then(({ body }) => {
        const newArticle = body.article;
        expect(newArticle.votes).not.toBe(100);
        expect(newArticle).not.toHaveProperty('foo');
      });
  });

  test('400: an author property is required', () => {
    const testBody = {
      title: 'New article title',
      body: 'New article body',
      topic: 'mitch',
    };

    return request(app)
    .post('/api/articles')
    .send(testBody)
    .expect(400)
    .then(({ body }) => {
      expect(body.message).toBe('Bad request');
    });
  });

  it('400: an author must be the username of a valid user', () => {
    const testBody = {
      author: 'not-a-user',
      title: 'New article title',
      body: 'New article body',
      topic: 'mitch',
    };

    return request(app)
      .post('/api/articles')
      .send(testBody)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('Bad request');
      });
  });

  test('400: a title property is required', () => {
    const testBody = {
      author: 'butter_bridge',
      body: 'New article body',
      topic: 'mitch',
    };

    return request(app)
      .post('/api/articles')
      .send(testBody)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('Bad request');
      });
  });

  test('400: a body property is required', () => {
    const testBody = {
      author: 'butter_bridge',
      title: 'New article title',
      topic: 'mitch',
    };

    return request(app)
      .post('/api/articles')
      .send(testBody)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('Bad request');
      });
  });

  test('400: a topic property is required', () => {
    const testBody = {
      author: 'butter_bridge',
      title: 'New article title',
      body: 'New article body',
    };

    return request(app)
      .post('/api/articles')
      .send(testBody)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('Bad request');
      });
  });

  test('400: a topic must be a valid topic', () => {
    const testBody = {
      author: 'butter_bridge',
      title: 'New article title',
      body: 'New article body',
      topic: 'not-a-topic',
    };

    return request(app)
      .post('/api/articles')
      .send(testBody)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('Bad request');
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

  it('400: responds with bad request message when given an invalid article id', () => {
    return request(app)
      .get('/api/articles/not-an-article-id')
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('Bad request');
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
        expect(body.message).toBe('Bad request');
      });
  });

  it('400: responds with bad request when inc_votes is not an integer', () => {
    const testBody = { inc_votes: 'not-an-integer' };

    return request(app)
    .patch('/api/articles/1')
    .send(testBody)
    .expect(400)
    .then(({ body }) => {
      expect(body.message).toBe('Bad request');
    });
  });

  it('400: responds with bad request when given an invalid article id', () => {
    const testBody = { inc_votes: 1 };

    return request(app)
    .patch('/api/articles/not-an-article-id')
    .send(testBody)
    .expect(400)
    .then(({ body }) => {
      expect(body.message).toBe('Bad request');
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
});

describe('DELETE /api/articles/:article_id', () => {
  it('204: should delete the article with the given article id', () => {
    return request(app)
      .delete('/api/articles/1')
      .expect(204);
  });

  it('400: should return bad request when given an invalid article id', () => {
    return request(app)
      .delete('/api/articles/not-an-id')
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('Bad request');
      });
  });

  it('404: should return not found if the article id is valid but does not exist', () => {
    return request(app)
      .delete('/api/articles/9999')
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe('Not found');
      });
  });
});

describe('GET /api/articles/:article_id/comments', () => {
  it('200: responds with all comments when given a valid article id ordered by created_at in descending order', () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;

        expect(comments).toBeInstanceOf(Array);
        expect(comments.length).toBeGreaterThan(1);
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
        expect(comments).toBeSortedBy('created_at', { descending: true });
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

  it('400: responds with bad request when given an invalid article id', () => {
    return request(app)
      .get('/api/articles/not-an-article-id/comments')
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('Bad request');
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

  describe('?limit', () => {
    it('200: responds with an array of articles limited to the length of limit', () => {
      return request(app)
        .get('/api/articles/1/comments?limit=5')
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toHaveLength(5);
        });
    });

    it('200: responds with an array of 10 articles by default when not specifically assigned a value', () => {
      return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toHaveLength(10);
        });
    });

    it('400: responds with invalid limit query for an invalid limit query', () => {
      return request(app)
        .get('/api/articles/1/comments?limit=not-an-integer')
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe('Invalid limit query');
        });
    });
  });

  describe('?p', () => {
    it('200: responds with an array of articles starting at page 1 of n pages', () => {
      return request(app)
        .get('/api/articles/1/comments?p=1')
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toHaveLength(10);

          const commentIds = comments.map((comment) => comment.comment_id)
          expect(commentIds).toEqual([5, 2, 18, 13, 7, 8, 6, 12, 3, 4]);
        });
    });

    it('200: responds with an array of articles starting at page 2 of n pages', () => {
      return request(app)
        .get('/api/articles/1/comments?p=2')
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toHaveLength(1);

          const commentIds = comments.map((comment) => comment.comment_id)
          expect(commentIds).toEqual([9]);
        });
    });

    it('200: responds with an empty array when page is out of range', () => {
      return request(app)
        .get('/api/articles/1/comments?p=99')
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;

          expect(comments).toBeInstanceOf(Array);
          expect(comments).toHaveLength(0);
        });
    });

    it('400: responds with bad request when page is not a number', () => {
      return request(app)
        .get('/api/articles/1/comments?p=banana')
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe('Bad request');
        });
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
        expect(body.message).toBe('Bad request');
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
        expect(body.message).toBe('Bad request');
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
        expect(body.message).toBe('Bad request');
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
        expect(body.message).toBe('Bad request');
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
});

describe('PATCH /api/comments/:comment_id', () => {
  it("200: should increment a comment's votes by a positive inc_votes value for a valid comment id and responds with the updated comment", () => {
    const testBody = { inc_votes: 1 };

    return request(app)
      .patch('/api/comments/1')
      .send(testBody)
      .expect(200)
      .then(({ body }) => {
        const { comment } = body;

        expect(comment.votes).toBe(17);
      })
  });

  it("200: should decrement a comment's votes by a negative inc_votes value for a valid comment id and responds with the updated comment", () => {
    const testBody = { inc_votes: -1 };

    return request(app)
      .patch('/api/comments/1')
      .send(testBody)
      .expect(200)
      .then(({ body }) => {
        const { comment } = body;

        expect(comment.votes).toBe(15);
      })
  });

  it('200: ignores additional properties passed in the request body ', () => {
    const testBody = {
      inc_votes: 1,
      body: 'New test body',
    };

    return request(app)
      .patch('/api/comments/1')
      .send(testBody)
      .expect(200)
      .then(({ body }) => {
        const { comment } = body
        expect(comment.body).not.toBe(testBody.body);
      });
  });

  it('400: an inc_votes property is required in the request body', () => {
    const testBody = {};

    return request(app)
      .patch('/api/comments/1')
      .send(testBody)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('Bad request');
      });
  });

  it('400: responds with bad request when inc_votes is not an integer', () => {
    const testBody = { inc_votes: 'not-an-integer' };

    return request(app)
    .patch('/api/comments/1')
    .send(testBody)
    .expect(400)
    .then(({ body }) => {
      expect(body.message).toBe('Bad request');
    });
  });

  it('400: responds with bad request when given an invalid comment id', () => {
    const testBody = { inc_votes: 1 };

    return request(app)
    .patch('/api/comments/not-an-comment-id')
    .send(testBody)
    .expect(400)
    .then(({ body }) => {
      expect(body.message).toBe('Bad request');
    });
  });

  it('404: responds with not found when given a valid comment id that does not exist', () => {
    const testBody = { inc_votes: 1 };

    return request(app)
      .patch('/api/comments/9999')
      .send(testBody)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe('Not found');
      });
  });
});

describe('DELETE /api/comments/:comment_id', () => {
  it('204: should delete the comment with the given comment id', () => {
    return request(app)
      .delete('/api/comments/1')
      .expect(204);
  });

  it('400: should return bad request when given an invalid comment id', () => {
    return request(app)
      .delete('/api/comments/not-a-valid-id')
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('Bad request');
      });
  });

  it('404: should return not found if the comment id is valid but does not exist', () => {
    return request(app)
      .delete('/api/comments/999')
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe('Not found');
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

describe('POST /api/topics', () => {
  it('200: creates a new topic and responds with the new topic object', () => {
    const testBody = {
      slug: 'new-topic',
      description: 'New topic description',
    };

    return request(app)
      .post('/api/topics')
      .send(testBody)
      .expect(201)
      .then(({ body }) => {
        const newTopic = body.topic;
        expect(newTopic).toEqual(testBody);
      });
  });

  it('200: a description property is optional', () => {
    const testBody = {
      slug: 'new-topic',
      description: 'New topic description',
    };

    return request(app)
      .post('/api/topics')
      .send(testBody)
      .expect(201)
      .then(({ body }) => {
        const newTopic = body.topic;
        expect(newTopic).toEqual(testBody);
      });
  });

  it('201: ignores additional properties passed in the request body', () => {
    const testBody = {
      slug: 'new-topic',
      description: 'New topic description',
      foo: 'bar',
    };

    return request(app)
      .post('/api/topics')
      .send(testBody)
      .expect(201)
      .then(({ body }) => {
        const newTopic = body.topic;
        expect(newTopic).not.toHaveProperty('foo');
      });
  });

  it('400: a slug property is required', () => {
    const testBody = {
      description: 'New topic description',
    };

    return request(app)
      .post('/api/topics')
      .send(testBody)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('Bad request');
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
