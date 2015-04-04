var express = require('express');
var webhook = require('express-ifttt-webhook');

var app = express();
app.use(webhook(function (json, done) {
  console.log('Got', json);
}));

app.get('/', function (req, res) {
  res.send('Herro');
});

var port = process.env.PORT || 3000;
var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
