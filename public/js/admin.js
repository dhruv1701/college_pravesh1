function transformStats (stats) {
    var newStats = [];
    for (var i = 0; i < stats.length / 2; i++) {
      if(stats[i] != '' && stats[i + stats.length / 2]){
        newStats.push({name: stats[i], value: stats[i + stats.length / 2]});
      }
    }
    return newStats;
}

$(document).ready(function() {

    var addRank = $('#insertRanking');
    var addStat = $('#addStat');
    var statsForm = $('[name=stats-form');
    var siteElem = $('[name=site]');
    var rankingElem = $('[name=ranking]');
    var descriptionElem = $('[name=description]');
    var imgUrlElem = $('[name=imgUrl]');

    var removeRank = $('#removeRanking');
    var removeSiteElem = $('[name=siteRemove]');

    removeRank.on('submit', function(e) {
        e.preventDefault();
        var site = removeSiteElem.val();
        $.ajax({
            //The URL to process the request
              'url' : '/admin/remove',
            //The type of request, also known as the "method" in HTML forms
            //Can be 'GET' or 'POST'
              'type' : 'POST',
              contentType: "application/json; charset=utf-8",
              //Any post-data/get-data parameters
            //This is optional
              'data' : JSON.stringify({
                'site' : site
              }),
            //The response from the server
              'success' : function() {
                // removeSiteElem.val('');
                window.location.href = "/admin"
                },
              'error' : function() {
                alert('request not succesful');
              }
        });
    });

    addStat.on('click', function(e) {
        e.preventDefault();
        let elem = $('<input type="text" name="key" placeholder="name" style="width: 45%"><input type="number" name="value" placeholder="value" style="width: 45%"><br>');        
        statsForm.append(elem);
    });

    addRank.on('submit', function(e) {
        e.preventDefault();
        var site = siteElem.val();
        var ranking = rankingElem.val();
        var description = descriptionElem.val();
        var imgUrl = imgUrlElem.val();
        var stats = [];
        var statsElemsKey = $('[name=key]');
        var statsElemsValue = $('[name=value]');
        statsElemsKey.each(function () {
            stats.push(this.value);
        });
        statsElemsValue.each(function () {
          stats.push(parseInt(this.value));
      });
      stats = transformStats(stats);
      var edit = {site};
      if (ranking) edit.ranking = ranking;
      if (description) edit.description = description;
      if (imgUrl) edit.imgUrl = description;
      if (stats.length > 0) edit.stats = stats;

      console.log({
            'site' : site,
            'ranking' : ranking,
            'description' : description,
            'stats' : stats,
            'imgUrl' : imgUrl
          });
        $.ajax({
            //The URL to process the request
              'url' : '/admin/update',
            //The type of request, also known as the "method" in HTML forms
            //Can be 'GET' or 'POST'
              'type' : 'POST',
              contentType: "application/json; charset=utf-8",
              //Any post-data/get-data parameters
            //This is optional
              'data' : JSON.stringify(edit),
            //The response from the server
              'success' : function() {
              //You can use any jQuery/JavaScript here!!!
                // statsElemsKey.each( function () { 
                // this.value = '';});
                // statsElemsValue.each( function () { 
                // this.value = '';});
                // rankingElem.val('');
                // siteElem.val('');
                // descriptionElem.val('');
                // imgUrlElem.val('');
                window.location.href = "/admin"
              },
              'error' : function() {
                alert('request not succesful');
              }
            });
    });
});