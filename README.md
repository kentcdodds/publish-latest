# publish-latest (UNMAINTAINED)

Status:
[![npm version](https://img.shields.io/npm/v/publish-latest.svg?style=flat-square)](https://www.npmjs.org/package/publish-latest)
[![npm downloads](https://img.shields.io/npm/dm/publish-latest.svg?style=flat-square)](http://npm-stat.com/charts.html?package=publish-latest&from=2015-09-01)
[![Build Status](https://img.shields.io/travis/kentcdodds/publish-latest.svg?style=flat-square)](https://travis-ci.org/kentcdodds/publish-latest)
[![Code Coverage](https://img.shields.io/codecov/c/github/kentcdodds/publish-latest.svg?style=flat-square)](https://codecov.io/github/kentcdodds/publish-latest)

A script to allow you to publish the generated built files of your project to a specific branch in your repository.

I use this as part of my travis build with `semantic-release`. I run the build as a `prepublish` script, then as a
`postpublish` script, I run this script which commits the built files and pushes them to my `latest` branch.
Then `semantic-release post` will create a release on github with that commit.

## Usage

```javascript
{
  "scripts": {
    "build": "echo 'building project'",
    "prepublish": "npm run build",
    "postpublish": "publish-latest",
    "semantic-release": "semantic-release pre && npm publish && semantic-release post"
  }
}
```

### CLI Options

You can pass several options to `publish-latest` to override the defaults. Here's the output of `--help`

```
$ publish-latest --help

  Usage: publish-latest [options]

  Options:

    -h, --help                       output usage information
    -V, --version                    output the version number
    -e, --user-email [email]         User email to use for the release commit (defaults to author/first contributor email)
    -n, --user-name [name]           User name to use for the release commit (defaults to author/first contributor name)
    -b, --branch [name]              The branch to push the latest to (defaults to `latest`)
    -u, --url [url]                  The git URL to publish to (defaults to project git url)
    -r, --release-version [version]  Version to release (defaults to package.json version)
    -a, --add "[file1 dir1 file2]"   Files to add (defaults to `package.json dist`)
    -t, --temp-branch [name]         Temp branch used for preparing the release (defaults to tmp/travis)
```

### ENV variables

If you do not specify a `url` then the script will derive one from your `package.json` and then the script will add a
token to the GitHub URL so the commit can be pushed. This token comes from either `BOT_GH_TOKEN` or `GH_TOKEN`.

## UNMAINTAINED

I created this tool to solve issues mentioned in my blogpost [Why I don't commit generated files to master](https://medium.com/@kentcdodds/why-i-don-t-commit-generated-files-to-master-a4d76382564), however there is a service called [npmcdn.com](https://npmcdn.com) which mostly solves the problems I've mentioned in that blogpost. So I no longer need this tool and will not plan on maintaining it. If you're personally seriously interested in taking it on, please let me know!

## LICENSE

MIT

