'use strict';

var pathCwd = require('path-here');
var pathHere = pathCwd.dir(__dirname);
var parseAuthor = require('parse-author');
var parseRepo = require('repo-path-parse');

var exec = require('child_process').exec;

module.exports = publishLatest;

function publishLatest(options, cb) {
  var script = pathHere('..', 'scripts', 'publish-latest.sh');
  var args = getArgs(options);
  exec(script + ' ' + args.join(' '), { shell: '/bin/bash' }, function (error, stdout, stderr) {
    stdout = hideToken(stdout);
    stderr = hideToken(stderr);
    error = cleanError(error);
    var result = !!error ? null : { type: 'Success', stdout: stdout, stderr: stderr };
    if (stderr) {
      console.error('stderr:', stderr); // eslint-disable-line no-console
    }
    if (stdout) {
      console.log('stdout:', stdout); // eslint-disable-line no-console
    }
    cb && cb(error, result);
  });
}

function getArgs(options) {
  /* eslint complexity:[2, 8] */
  var packageJson = require(pathCwd('package.json'));
  var author = parseAuthor(getAuthorData(packageJson));
  var gitUrl = options.url || getGitUrl(packageJson, process.env.BOT_GH_TOKEN || process.env.GH_TOKEN);

  return [options.releaseVersion || packageJson.version, // version
  options.userEmail || author.email, // email
  quote(options.userName || author.name), // name
  options.branch || 'latest', // latest branch
  quote(getFilesToAdd(options.add)), // files to add
  gitUrl, // git remote url
  options.tempBranch || 'travis/temp'];
}

// tmp branch
function quote(string) {
  return '"' + string + '"';
}

function getFilesToAdd(filesToAdd) {
  if (filesToAdd) {
    if (Array.isArray(filesToAdd)) {
      return filesToAdd.join(' ');
    } else if (typeof filesToAdd === 'string') {
      return filesToAdd;
    }
  } else {
    return 'dist package.json';
  }
}

function getAuthorData(pkg) {
  if (pkg.author) {
    return pkg.author;
  } else if (pkg.contributors && pkg.contributors.length) {
    return pkg.contributors.length;
  } else {
    return '';
  }
}

function getGitUrl(pkg, token) {
  var url = pkg.repository;
  if (url.url) {
    url = url.url;
  }
  var parsed = parseRepo(url);
  var owner = parsed.owner;
  var repo = parsed.repo;
  if (!owner || !repo) {
    throw new Error('I couldn\'t parse your repository url: ' + hideToken(url));
  }
  var tokenInsertion = token ? token + '@' : '';
  return 'https://' + tokenInsertion + 'github.com/' + owner + '/' + repo;
}

function cleanError(error) {
  if (!error) {
    return error;
  }
  if (typeof error === 'string') {
    error = hideToken(error);
  } else {
    ['details', 'message', 'stack'].forEach(function (item) {
      if (error[item]) {
        error[item] = hideToken(error[item]);
      }
    });
  }
  return error;
}

function hideToken(string) {
  return string.replace(/https\:\/\/.*?@/g, 'https://token-hidden@');
}