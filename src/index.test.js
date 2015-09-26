process.env.DRY_RUN = true;
process.env.BOT_GH_TOKEN = 'super-secret-token';

const _ = require('lodash');
const expect = require('chai').expect;
const publishLatest = require('./index');


describe('publishLatest', () => {
  it('should run with good data without error', done => {
    const options = getTestOptions();
    publishLatest(options, (error, result) => {
      expect(error, 'there should be no error').to.not.exist;
      expect(result.stderr, 'there should have been nothing logged to standard error').to.equal('');
      expect(result.stdout, 'standard out should have the expected output').to.exist;

      const parts = [
        [`git config --global user.email ${options.userEmail}`, 'setting user email'],
        [`git config --global user.name "${options.userName}"`, 'setting user name'],
        [`git checkout -b ${options.tempBranch}`, 'checking out branch'],
        [`git add ${options.add} -f`, 'adding files'],
        [`git commit -m v${options.releaseVersion} --no-verify`, 'committing files'],
        [`git remote set-url origin ${options.url}`, 'setting remote'],
        [`git remote set-branches --add origin ${options.branch}`, 'adding remote branch'],
        [`git fetch origin`, 'fetching origin'],
        [`git checkout -b ${options.branch}`, 'checking out remote branch'],
        [`git merge ${options.tempBranch} -m v${options.releaseVersion} -X theirs`, 'merging into branch'],
        [`git push origin HEAD:${options.branch} -f`, 'force pushing HEAD to origin']
      ];
      expectStandardOutToHaveParts(result.stdout, parts);
      done(error);
    });
  });

  it('should infer data from the repo in which it is run and have good defaults', done => {
    publishLatest({}, (error, result) => {
      expect(error, 'there should be no error').to.not.exist;
      expect(result.stderr, 'there should have been nothing logged to standard error').to.equal('');
      expect(result.stdout, 'standard out should have the expected output').to.exist;
      const parts = [
        [`git config --global user.email kent@doddsfamily.us`, 'setting user email'],
        [`git config --global user.name "Kent C. Dodds"`, 'setting user name'],
        [`git checkout -b travis/temp`, 'checking out branch'],
        [`git add dist package.json -f`, 'adding files'],
        [/git commit -m v.*? --no-verify/, 'committing files'],
        [`git remote set-url origin https://token-hidden@github.com/kentcdodds/publish-latest`, 'setting remote'],
        [`git remote set-branches --add origin latest`, 'adding remote branch'],
        [`git fetch origin`, 'fetching origin'],
        [`git checkout -b latest`, 'checking out remote branch'],
        [/git merge travis\/temp -m v.*? -X theirs/, 'merging into branch'],
        [`git push origin HEAD:latest -f`, 'force pushing HEAD to origin']
      ];
      expectStandardOutToHaveParts(result.stdout, parts);
      done(error);
    });
  });
});

function expectStandardOutToHaveParts(out, parts) {
  let index = 0;
  parts.forEach(part => {
    let message;
    if (Array.isArray(part)) {
      message = `contains ${part[1]}`;
      part = part[0];
    }
    if (typeof part === 'string') {
      expect(out.substring(index), message || 'standard out should have specific part').to.contain(part);
      index = out.indexOf(part);
    } else {
      expect(out.substring(index), message || 'standard out should match a specific part').to.match(part);
      index = part.exec(out).index;
    }
  });
}

function getTestOptions(overrides) {
  return _.merge({
    userName: 'Luke Skywalker',
    userEmail: 'luke@skywalkerfamily.com',
    branch: 'release/latest',
    url: 'https://github.com/skywalker/awesome-dads',
    releaseVersion: '1.2.3',
    add: 'dist some-other-file.js package.json',
    tempBranch: 'tmp/travis-test'
  }, overrides);
}
