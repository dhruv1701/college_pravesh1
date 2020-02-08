const {app} = require('./../server');
const expect = require('expect');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const {populateAdmins, populateRankings, rankings, admins} = require('./seed/seed');
const {Admin} = require('./../models/admin');
const {Ranking} = require('./../models/ranking');

beforeEach(populateAdmins);
beforeEach(populateRankings);

describe('Admin.findByUserAndPass', () => {
    it('should find correct admin', async () => {
        const user = await Admin.findByUserAndPass('username1', 'password1');
        expect(user.username).toBe('username1');
        expect(user.password).toBe('password1');
    });

    it('should not find incorrect admins', async () => {
        var error = false;
        try {
            const user = await Admin.findByUserAndPass('username1', 'password2');
        } catch (e) {
            error = true;
        }
        expect(error).toBe(true);
    });
});

describe('Admin.generateAuthToken', () => {
    it('should correctly login the user', async () => {
        const token = await Admin.login('username1', 'password1');
        const admin = await Admin.findByUserAndPass('username1', 'password1');
        expect(admin.tokens[1].token).toBe(token);
    });
});

describe('Ranking.getRank', () => {
    it('should correctly get #1', async () => {
        const number1 = await Ranking.getRank(1);
        expect(number1.length).toBe(1);
        expect(number1[0].site).toBe('QS');
    });

    it('should correctly get #2', async () => {
        const number1 = await Ranking.getRank(2);
        expect(number1.length).toBe(2);
        expect(number1[0].site).toBe('USNews');
        expect(number1[1].site).toBe('Times');
    });
})

describe('Ranking.getSite', () => {
    it('should correctly get USNews', async () => {
        const number1 = await Ranking.getSite('USNews');
        expect(number1.site).toBe('USNews');
    });
});

describe('Ranking.insertRankAdjusting', () => {
    it('should correctly adjust all other ranking' , async () => {
        let siteToAdd = {
            site: 'CoolSite',
            ranking: 1,
            description: "none",
            imgUrl: 'https://UsNews.com',
            stats: [{
                    name: 'Overall',
                    value: 7.88
                },
                {
                    name: 'Age', 
                    value: 34
                },
                {
                    name: 'Traffic',
                    value: 4.038461538
                }, {
                    name: 'reputation',
                    value: 10
                }]
        }
        let doc = await Ranking.insertRankAdjusting(siteToAdd);
        let newrank = await Ranking.getSite('USNews');
        expect(newrank.ranking).toBe(3);
    });
});

describe('Ranking.changeSiteRank', () => {
    it('should correctly increase rankings', async () => {
        let doc = await Ranking.getSite('Times');
        await doc.changeSiteRank(1);
        let usnews = await Ranking.getSite('USNews');
        expect(usnews.ranking).toBe(3);
        let qs = await Ranking.getSite('QS');
        expect(qs.ranking).toBe(1);
        let site4 = await Ranking.getSite('Site4');
        expect(site4.ranking).toBe(4);
    })

    it('should correctly lower rankings', async () => {
        let doc = await Ranking.getSite('Times');
        await doc.changeSiteRank(5);
        let usnews = await Ranking.getSite('USNews');
        expect(usnews.ranking).toBe(2);
        let qs = await Ranking.getSite('QS');
        expect(qs.ranking).toBe(1);
        let site5 = await Ranking.getSite('Site5');
        expect(site5.ranking).toBe(4);

    });
});

describe('Ranking.removeSite', () => {
    it('should correctly remove rankings', async () => {
        await Ranking.removeSite('QS');
        let doc = await Ranking.getSite('QS');
        expect(doc).toBeFalsy();
    });
})