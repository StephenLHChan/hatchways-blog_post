process.env.NODE_ENV = 'test';

const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');

const app = require('../app');

chai.use(chaiHttp);

describe('Step 1 : /ping', () => {
  it('Should return the correct body', (done) => {
    chai.request(app)
        .get('/api/ping')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success').eql(true);
          done();
        });
  }); 
});

describe('Step 2 : /posts', () => {
  it('Should return the correct body with all parameter', (done) => {
    chai.request(app)
        .get('/api/posts?tags=history,tech&sortBy=likes&direction=desc')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          done();
        });
  });

  it('Should return the correct body with only tags parameter', (done) => {
    chai.request(app)
        .get('/api/posts?tags=history,tech')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          done();
        });
  });

  it('Should return the error messages for no tags parameter', (done) => {
    chai.request(app)
        .get('/api/posts?tags=&sortBy=likes&direction=desc')
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('error').eql('Tags parameter is required');
          done();
        });
  });

  it('Should return the error messages for invalid sortBy parameter', (done) => {
    chai.request(app)
        .get('/api/posts?tags=history,tech&sortBy=abc')
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('error').eql('sortBy parameter is invalid');
          done();
        });
  });

  it('Should return the error messages for invalid direction parameter', (done) => {
    chai.request(app)
        .get('/api/posts?tags=history,tech&sortBy=likes&direction=abc')
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('error').eql('direction parameter is invalid');
          done();
        });
  });

  it('Should return the posts with unquie ids', (done) => {
    chai.request(app)
        .get('/api/posts?tags=history,tech&sortBy=likes&direction=desc')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          postIdSeen = new Set();
          const data = res.body;
          for (let i = 0; i < data.posts.length; i++) {
            postIdSeen.add(data.posts[i].id);
          }
          expect(data.posts).to.have.lengthOf(postIdSeen.size);
          done();
        });
  });

  it('Should be correctly sorted (desc)', (done) => {
    chai.request(app)
        .get('/api/posts?tags=history,tech&sortBy=reads&direction=desc')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          const data = res.body;

          let test = true;
          for (let i = 0; i < data.posts.length - 1; i++) {
            if (data.posts[i].reads < data.posts[i + 1].reads) {
              test = false;
            }
          }

          expect(test).to.equal(true);
          done();
        });
  });

  it('Should be correctly sorted (asc)', (done) => {
    chai.request(app)
        .get('/api/posts?tags=history,tech&sortBy=likes&direction=asc')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          const data = res.body;

          let test = true;
          for (let i = 0; i < data.posts.length - 1; i++) {
            if (data.posts[i].likes > data.posts[i + 1].likes) {
              test = false;
            }
          }

          expect(test).to.equal(true);
          done();
        });
  });
});