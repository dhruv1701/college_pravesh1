const jwt = require('jsonwebtoken');
var express = require('express');
var studentRouter = express.Router();
var _ = require('lodash');
var {Admin} = require('./../models/admin');
var {Ranking} = require('./../models/ranking');

var router = () => {

    studentRouter.route('/signUp')
        .post(async (req, res) => {
            let body = _.pick(req.body,['username','password']);
            let newAdmin = Admin(body);
            try {
                let user = await newAdmin.save();
                res.send(user);
            } catch (e) {
                res.send(e);
            }
        });
    
    studentRouter.route('/login')

        // Get /admin/login
        // renders login page login.ejs
        .get((req, res) => {
            res.render('login');
        })
        .post(async (req, res) => {
            // get username and password from body
            let {username, password} = req.body;
            try {
                // log user in and get session token
                let token = await Admin.login(username, password);
                req.session.token = token;
                // remove this header when in production
                res.header('token', token).send();
            } catch (e) {
                res.sendStatus(401);
            }
        });

    // authenticate user
    studentRouter.use(async (req, res, next) => {
        try {
            // if successfully decoded, move on
            var decoded = await jwt.verify(req.session.token, process.env.JWT_SECRET);
            // if it's expired, error
            if (Date.now() > decoded.expiry) throw new Error();
            next();
        } catch (e) {
            // if error in verification, redirect to /admin/login
            res.redirect('/admin/login');
        }
    });

    studentRouter.route('/')
        .get(async (req, res) => {
            res.render('admin', {docs: await Ranking.getAll()});
        })

    studentRouter.route('/check')
        .get((req, res) => {
            if (req.session && req.session.token) {
                res.send('session token exists!');
            }
            res.send(404);
        });

    studentRouter.post('/create', async (req, res) => {
        let body = _.pick(req.body, ['site', 'stats', 'imgUrl', 'ranking', 'description']);
        let newDoc = Ranking(body);
        try {
            let newRanking = await newDoc.save();
            res.send(newRanking);
        } catch (e) {
            res.status(400).send();
        }
    });

    studentRouter.post('/remove', async (req, res) => {
        try {
            // console.log(req.body.site.trim());
            Ranking.removeSite(req.body.site.trim());
            res.send();
        } catch (e) {
            res.status(404).send();
        }
    });


    studentRouter.post('/update', async (req, res) => {
        var {site, stats, imgUrl, ranking, description} = req.body;
        console.log(req.body);
        if (!site) return res.status(400).send();

        try {
            let doc = await Ranking.findOne({site});
            if (!doc) {
                let newDoc = await Ranking(_.pick(req.body, ['site', 'stats','imgUrl','ranking', 'description'])).save();
                return res.send(newDoc);
            }
            if (stats) {
                stats.forEach((stat) => {
                    let obj = _.find(doc.stats, (curStat) => curStat.name === stat.name);
                    if (obj) obj.value = stat.value;
                    else doc.stats.push(stat);
                });
            }
            if (imgUrl) doc.imgUrl = imgUrl;
            if (ranking) doc.ranking = ranking;
            let newDoc = await doc.save();
            res.send(newDoc);
        } catch (e) {
            res.sendStatus(400);
        }
    });
    return studentRouter;
};

module.exports = router;