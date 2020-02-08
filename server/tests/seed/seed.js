const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');
const {Admin} = require('./../../models/admin');
const {Ranking} = require('./../../models/ranking');

const userOneID = new ObjectID(); 
const userTwoID = new ObjectID(); 
const access = 'auth';
const admins = [{
    _id: userOneID,
    username: 'username1',
    password: 'password1',
    tokens: [{
        access: 'auth',
        token: jwt.sign({
                _id: userOneID.toHexString(),
                expiry: Date.now() + 2 * 60 * 60 * 1000 
        } ,process.env.JWT_SECRET,  { expiresIn: '1h' }).toString()
    }]
},
{
    _id: userTwoID,
    username: 'username2',
    password: 'password2',
    tokens: [{
        access: 'auth',
        token: jwt.sign({
            _id: userOneID.toHexString(),
            expiry: Date.now() + 2 * 60 * 60 * 1000 
    } ,process.env.JWT_SECRET,  { expiresIn: '1h' }).toString()
}]
}];

const rankings = [{
    site: 'USNews',
    ranking: 2,
    imgUrl: 'https://UsNews.com',
    description: "none", stats: [{
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
},{
    site: 'QS',
    ranking: 1,
    imgUrl: 'https://UsNews.com',
    description: "none", stats: [{
            name: 'Overall',
            value: 8.52
        },{
            name: 'Age', 
            value: 12
        },
        {
            name: 'Traffic',
            value: 21.73076923
        }, {
            name: 'reputation',
            value: 9
        }]
}, {
    site: 'Times',
    ranking: 2,
    imgUrl: 'https://UsNews.com',
    description: "none", stats: [{
            name: 'Overall',
            value: 6.82
        },{
            name: 'Age',
            value: 13
        },
        {
            name: 'Traffic',
            value: 5.615385
        }, {
            name: 'reputation',
            value: 6.5
        }]
}, {
    site: 'Site4',
    ranking: 4,
    imgUrl: 'https://UsNews.com',
    description: "none", stats: [{
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
} , {
    site: 'Site5',
    ranking: 5,
    description: "none"
}
]

const populateAdmins = async () => {
    await Admin.remove({});
    await Admin.insertMany(admins);
}

const populateRankings = async () => {
    await Ranking.remove({});
    await Ranking.insertMany(rankings);
}

module.exports = {
    populateAdmins,
    populateRankings,
    rankings,
    admins
};