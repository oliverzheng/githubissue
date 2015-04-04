var express = require('express');
var webhook = require('express-ifttt-webhook');
var urlParse = require('url-parse');
var resolver = require("resolver");

var app = express();
app.use(webhook(function (json, done) {
  console.log('Got request: ' + json.description);
  resolver.resolve(json.description, function(err, url) {
    if (err) {
      console.log('Got error trying to resolve: ', json.description);
      done();
    } else {
      processTweet(url, json.title, done);
    }
  });
}));

function processTweet(url, text, done) {
  var pathParts = urlParse(url).pathname.split('/');
  var author = pathParts[1];
  var tweetID = pathParts[3];

  var re = /\s+(\S+\/\S+)\s+(.*)/;
  var match = re.exec(text);
  if (match !== null) {
    var repo = match[1];
    var problem = match[2];
    console.log('@' + author + ' filed an issue in ' + repo + ': ' + problem);
  } else {
    console.log('Invalid tweet: ' + text);
  }

  done();
}

app.get('/', function (req, res) {
  res.send('Herro');
});

var port = process.env.PORT || 3000;
var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
