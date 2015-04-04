var express = require('express');
var webhook = require('express-ifttt-webhook');
var urlParse = require('url-parse');
var resolver = require("resolver");
var GitHubAPI = require('github');

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
  var twitterUser = pathParts[1];
  var tweetID = pathParts[3];

  var re = /\s+(\S+)\/(\S+)\s+(.*)/;
  var match = re.exec(text);
  if (match !== null) {
    var githubUser = match[1]
    var repo = match[2];
    var problem = match[3];
    console.log('@' + twitterUser + ' filed an issue in ' + repo + ': ' + problem);
    postOnGithub(githubUser, repo, twitterUser, problem, url, done);
  } else {
    console.log('Invalid tweet: ' + text);
    done();
  }
}

var github = new GitHubAPI({
  version: '3.0.0',
});
github.authenticate({
  type: 'basic',
  username: 'githubissue',
  password: process.env.GITHUB_PASSWORD,
});

function postOnGithub(githubUser, repo, twitterUser, problem, twitterUrl, done) {
  github.issues.create({
    user: githubUser,
    repo: repo,
    title: problem,
    body: '@' + twitterUser + ' filed this issue from ' + twitterUrl,
    labels: [],
  }, function(err, res) {
    if (err) {
      console.log('Github error trying to do ' + twitterUrl);
    } else {
      var issueUrl = res.html_url;
      console.log('Posted issue: ' + issueUrl);
      postOnTwitter();
    }
    done();
  });
}

function postOnTwitter() {
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
