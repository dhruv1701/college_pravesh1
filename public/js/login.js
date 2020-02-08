$(document).ready(function() {
  var login = jQuery('#login');
  var username_jQ = jQuery('[name=username]');
  var password_jQ = jQuery('[name=password]');

  login.on('submit', function (e) {
      e.preventDefault();
      var username = username_jQ.val();
      var password = password_jQ.val();
      console.log(username, password);
      $.ajax({
            'url' : '/admin/login',
            'type' : 'POST',
            contentType: "application/json; charset=utf-8",
            'data' : JSON.stringify({
              'username' : username,
              'password' : password
            }),
          //The response from the server
            'success' : function() {
              window.location.href = '/admin/';
            }
          });
  });
});