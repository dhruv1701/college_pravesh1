const _ = require('lodash');
const {app} = require('./../server');
const expect = require('expect');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const {populateAdmins, populateRankings, rankings, admins} = require('./seed/seed');
const {Admin} = require('./../models/admin');
const {Ranking} = require('./../models/ranking');

beforeEach(populateAdmins);
beforeEach(populateRankings);

var agent = request.agent(app);

describe('POST /admin/login', () => {
    it('should correctly login admins', (done) => {
        let username = admins[0].username;
        let password = admins[0].password;
        agent
          .post('/admin/login')
          .send({username, password})
          .expect(200)
          .expect(async (res) => {
              let doc = await Admin.findByToken(res.headers['token']);
              expect(doc.username).toBe(username)
              expect(typeof res.headers['token']).toBe('string');
          }).end(done);
    });

    it('should not login wrong users', (done) => {
        let username = admins[0].username;
        let password = admins[0].password + 'a';
        request(app)
          .post('/admin/login')
          .send({username, password})
          .expect(401)
          .end(done);
    });

});

describe('POST /admin/signup', () => {

    it('should reject inputs without login session', (done) => {
        let username = 'newAdmin';
        let password = 'newAdmin';
        request(app)
          .post('/admin/signup')
          .send({username, password})
          .expect(401)
          .end(done);
    });


    it('should correctly create admins', (done) => {
        let username = 'newAdmin';
        let password = 'newAdmin';
        agent
          .post('/admin/signUp')
          .query(`{token: ${admins[0].tokens[0].token}}`)
          .send({username, password})
          .expect(200)
          .expect((res) => {
              expect(res.body.username).toBe(username);
          }).end((err, res) => {
              if (err) return done(err);
              Admin.find({username, password}).then((doc) => {
                  expect(doc.length).toBe(1);
                  expect(doc[0].username).toBe(username);
                  expect(doc[0].password).toBe(password);
                  done();
                }).catch((e) => done(e));
          })
    });
});

describe('POST /admin/create', () => {

    it('should reject inputs without login session', (done) => {
        let newRanking = {    
            site: 'Niche',
            ranking: 5,
            description: 'none',
            imgUrl: 'https://niche.com',
            stats: [{
                name: 'Overall',
                value: 5
            },
            {
                name: 'Age',
                value: 1
            },
            {
                name: 'Traffic',
                value: 1
            }, {
                name: 'reputation',
                value: 2
            }]
        }
        request(app)
          .post('/admin/create')
          .send(newRanking)
          .expect(401)
          .end(done);
    });

    it('should correctly create rankings', (done) => {
        let newRanking = {    
            site: 'Niche',
            ranking: 5,
            description: "none",
            imgUrl: 'https://niche.com',
            stats: [{
                name: 'Overall',
                value: 5
            },
            {
                name: 'Age',
                value: 1
            },
            {
                name: 'Traffic',
                value: 1
            }, {
                name: 'reputation',
                value: 2
            }]
        }
        agent        
          .post('/admin/create')
          .send(newRanking)
          .expect(200)
          .expect((res) => {
            expect(res.body.site).toBe(newRanking.site);
            expect(res.body.ranking).toBe(newRanking.ranking);
            expect(res.body.imgUrl).toBe(newRanking.imgUrl);
            expect(res.body.stats[0].name).toBe(newRanking.stats[0].name);
            expect(res.body.stats[0].value).toBe(newRanking.stats[0].value);
            expect(res.body.stats[3].name).toBe(newRanking.stats[3].name);
            expect(res.body.stats[3].value).toBe(newRanking.stats[3].value);
        }).end(async (err, res) => {
            if (err) return done(err);
            try {
                let doc = await Ranking.getSite(newRanking.site);
                expect(doc.site).toBe(newRanking.site);
                expect(doc.ranking).toBe(newRanking.ranking);
                expect(doc.imgUrl).toBe(newRanking.imgUrl);
                expect(doc.stats[0].name).toBe(newRanking.stats[0].name);
                expect(doc.stats[0].value).toBe(newRanking.stats[0].value);
                expect(doc.stats[3].name).toBe(newRanking.stats[3].name);
                expect(doc.stats[3].value).toBe(newRanking.stats[3].value);
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it('should correctly reject invalid rankings', (done) => {
        let newRanking = {    
            site: 'Niche',
            imgUrl: 'https://niche.com',
            stats: [{
                name: 'Overall',
                value: 5
            },
            {
                name: 'Age',
                value: 1
            },
            {
                name: 'Traffic',
                value: 1
            }, {
                name: 'reputation',
                value: 2
            }]
        }
        agent        
          .post('/admin/create')
          .send(newRanking)
          .expect(400)
        //   .end(done);
          .expect((res) => {
            expect(res.body.site).toBeFalsy();
        //   }).end(done)
        }).end(async (err, res) => {
            if (err) return done(err);
            try {
                let doc = await Ranking.getSite(newRanking.site);
                expect(doc).toBeFalsy();
                done();
            } catch (e) {
                done(e);
            }
        });
    });
});

describe('POST /admin/update', () => {
    let newRanking = {    
        site: 'Times',
        ranking: 5,
        imgUrl: 'https://niche.com',
        description: "none",
        stats: [{
            name: 'Overall',
            value: -1
        },
        {
            name: 'Traffic',
            value: -1
        }, {
            name: 'reputation',
            value: -1
        }, {
            name: 'fake',
            value : -1
        }]
    };

    it('should reject inputs without site name', (done) => {
        agent        
          .post('/admin/update')
          .send(_.pick(newRanking, ['ranking', 'imgUrl', 'stats']))
          .expect(400)
          .end(done);
    });

    it('should reject inputs without login session', (done) => {
        request(app)
          .post('/admin/update')
          .send(newRanking)
          .expect(401)
          .end(done);
    });


    it('should correctly update ranking', (done) => {
        agent        
          .post('/admin/update')
          .send(_.pick(newRanking, ['site','ranking']))
          .expect(200)
          .expect((res) => {
              expect(res.body.ranking).toBe(newRanking.ranking);
          }).end(async (err, res) => {
              if (err) return done(err);
              try {
                let doc = await Ranking.getSite(newRanking.site);
                expect(doc.ranking).toBe(newRanking.ranking);
                expect(doc.imgUrl).not.toBe(newRanking.imgUrl);
                done();  
              } catch (e) {
                  done(e);
              }
          });
    });

    it('should correctly update imgUrl', (done) => {
        agent        
          .post('/admin/update')
          .send(_.pick(newRanking, ['site','imgUrl']))
          .expect(200)
          .expect((res) => {
              expect(res.body.imgUrl).toBe(newRanking.imgUrl);
          }).end(async (err, res) => {
              if (err) return done(err);
              try {
                let doc = await Ranking.getSite(newRanking.site);
                expect(doc.ranking).not.toBe(newRanking.ranking);
                expect(doc.imgUrl).toBe(newRanking.imgUrl);
                done();  
              } catch (e) {
                  done(e);
              }
          });
    });

    it('should correctly update stats', (done) => {
        agent        
          .post('/admin/update')
          .send(_.pick(newRanking, ['site','stats']))
          .expect(200)
          .expect((res) => {
              newRanking.stats.forEach((stat) => {
                let obj = _.find(res.body.stats, (curStat) => curStat.name === stat.name);
                expect(obj.value).toBe(stat.value);
              });
          }).end(async (err, res) => {
              if (err) return done(err);
              try {
                let doc = await Ranking.getSite(newRanking.site);
                expect(doc.ranking).not.toBe(newRanking.ranking);
                expect(doc.imgUrl).not.toBe(newRanking.imgUrl);
                newRanking.stats.forEach((stat) => {
                    let obj = _.find(doc.stats, (curStat) => curStat.name === stat.name);
                    expect(obj.value).toBe(stat.value);
                });
                done();
              } catch (e) {
                  done(e);
              }
          });
    });

    it('should correctly update all 3', (done) => {
        agent        
          .post('/admin/update')
          .send(newRanking)
          .expect(200)
          .expect((res) => {
              expect(res.body.imgUrl).toBe(newRanking.imgUrl);
              expect(res.body.ranking).toBe(newRanking.ranking);
              newRanking.stats.forEach((stat) => {
                let obj = _.find(res.body.stats, (curStat) => curStat.name === stat.name);
                expect(obj.value).toBe(stat.value);
              });
          }).end(async (err, res) => {
              if (err) return done(err);
              try {
                let doc = await Ranking.getSite(newRanking.site);
                expect(doc.ranking).toBe(newRanking.ranking);
                expect(doc.imgUrl).toBe(newRanking.imgUrl);
                newRanking.stats.forEach((stat) => {
                    let obj = _.find(doc.stats, (curStat) => curStat.name === stat.name);
                    expect(obj.value).toBe(stat.value);
                });
                done();
              } catch (e) {
                  done(e);
              }
          });
    });

    it('should correctly create if not found', (done) => {
        newRanking.site = 'niche';
        agent        
          .post('/admin/update')
          .send(newRanking)
          .expect(200)
          .expect((res) => {
              expect(res.body.imgUrl).toBe(newRanking.imgUrl);
              expect(res.body.ranking).toBe(newRanking.ranking);
              newRanking.stats.forEach((stat) => {
                let obj = _.find(res.body.stats, (curStat) => curStat.name === stat.name);
                expect(obj.value).toBe(stat.value);
              });
          }).end(async (err, res) => {
              if (err) return done(err);
              try {
                let doc = await Ranking.getSite(newRanking.site);
                expect(doc.ranking).toBe(newRanking.ranking);
                expect(doc.imgUrl).toBe(newRanking.imgUrl);
                newRanking.stats.forEach((stat) => {
                    let obj = _.find(doc.stats, (curStat) => curStat.name === stat.name);
                    expect(obj.value).toBe(stat.value);
                });
                done();
              } catch (e) {
                  done(e);
              }
          });
    });
});

describe('POST /admin/remove', () => {
    it('should remove somebody', async () => {
        await Ranking.removeSite('QS');
        var doc = await Ranking.getSite('QS');
        expect(doc).toBeFalsy();
    })
})