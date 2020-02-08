const mongoose = require('mongoose');

var RankingSchema = new mongoose.Schema( {
    site: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true
    },
    ranking: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imgUrl: {
        type: String
    },
    stats: [{
        name: {
            type: String,
            required: true
        },
        value: {
            type: Number,
            required: true
        }
    }]
},
{ usePushEach: true }
);

RankingSchema.methods.changeSiteRank = async function (newRank) {
    let doc = this;
    let oldRank = doc.ranking;
    doc.ranking = newRank;
    // if no rank to update, return and do nothing
    if(oldRank === newRank) return;
    await doc.save();
    if (oldRank > newRank) {
        // if we're increasing ranking ( 5 -> 1 ), increase everyone who is in between his new rank and his old rank
        // and everyone who was even with him
        await this.model('Ranking').where('ranking').gt(newRank).lte(oldRank).updateMany({ "$inc" : {ranking : 1}});
    } else {
        // if we're decreasing ranking ( 1 -> 5 ), decrease everyone
        await this.model('Ranking').where('ranking').gt(oldRank).lte(newRank).updateMany({ "$inc" : {ranking : -1}});
    }
}

RankingSchema.statics.getRank = function (ranking) {
    var Ranking = this;
    return Ranking.find({ranking});
}

RankingSchema.statics.removeSite = async function (site) {
    var Ranking = this;
    return Ranking.remove({site : {$regex : new RegExp(site, "i") }});
}

RankingSchema.statics.removeSiteAdjusting = async function (site) {
    var Ranking = this;
    var rank = await Ranking.findOne({site}).ranking;
    await Ranking.remove({site : {$regex : new RegExp(site, "i") }});
    return Ranking.where('ranking').gt(rank).updateMany({ "$inc" : {ranking : -1}});
}


RankingSchema.statics.getSite = function (site) {
    var Ranking = this;
    return Ranking.findOne({site});
}

RankingSchema.statics.getAll = function () {
    var Ranking = this;
    return Ranking.find({}).sort('ranking');
}

RankingSchema.statics.insertRankAdjusting = async function (user) {
    var Ranking = this;
    var doc = new Ranking(user);
    await doc.save();
    await Ranking.updateMany({ranking : {$gt : doc.ranking}}, { "$inc" : {ranking : 1}});
    return doc;
}

var Ranking = mongoose.model('Ranking', RankingSchema);

module.exports = {Ranking};