const pathCwd = require('path-here');
const pathHere = pathCwd.dir(__dirname);
const parseAuthor = require('parse-author');
const parseRepo = require('repo-path-parse');

const exec = require('child_process').exec;

module.exports = publishLatest;

function publishLatest(options, cb) {
  const script = pathHere('..', 'scripts', 'publish-latest.sh');
  const args = getArgs(options);
  exec(`${script} ${args.join(' ')}`, {shell: '/bin/bash'}, (error, stdout, stderr) => {
    stdout = hideToken(stdout);
    stderr = hideToken(stderr);
    error = cleanError(error);
    const result = !!error ? null : {type: 'Success', stdout, stderr};
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
  const packageJson = require(pathCwd('package.json'));
  const author = parseAuthor(getAuthorData(packageJson));
  const gitUrl = options.url || getGitUrl(packageJson, process.env.BOT_GH_TOKEN || process.env.GH_TOKEN);

  return [
    options.releaseVersion || packageJson.version, // version
    options.userEmail || author.email, // email
    quote(options.userName || author.name), // name
    options.branch || 'latest', // latest branch
    quote(getFilesToAdd(options.add)), // files to add
    gitUrl, // git remote url
    options.tempBranch || 'travis/temp', // tmp branch
  ];
}

function quote(string) {
  return `"${string}"`;
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
  let url = pkg.repository;
  if (url.url) {
    url = url.url;
  }
  const parsed = parseRepo(url);
  const owner = parsed.owner;
  const repo = parsed.repo;
  if (!owner || !repo) {
    throw new Error(`I couldn't parse your repository url: ${hideToken(url)}`);
  }
  const tokenInsertion = token ? token + '@' : '';
  return `https://${tokenInsertion}github.com/${owner}/${repo}`;
}

function cleanError(error) {
  if (!error) {
    return error;
  }
  if (typeof error === 'string') {
    error = hideToken(error);
  } else {
    ['details', 'message', 'stack'].forEach(item => {
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

