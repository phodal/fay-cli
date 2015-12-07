var os = require('os'),
  path = require('path'),
  unzip = require('unzip'),
  colors = require('colors'),
  fs = require('fs'),
  request = require('request'),
  prompt = require('prompt'),
  settings = require('../package.json'),
  shelljs = require('shelljs/global'),
  argv = require('optimist').argv,
  Q = require('q');

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  small: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'white',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});


var Fay = {
  printFay: function () {
    var w = function (s) {
      process.stdout.write(s);
    };

    w('  __ \n');
    w(' / _| __ _ _   _\n');
    w('| |_ / _` | | | |\n');
    w('|  _| (_| | |_| |\n');
    w('|_|  \__,_|\__, |\n');
    w('            |___/ CLI v' + settings.version + '\n');

  },

  run: function () {
    var that = this;
    if(argv.version || argv.v) {
      this.printFay();
      process.exit(0);
    }

    prompt.message = "Question!";
    prompt.delimiter = "".green;

    prompt.start();

    prompt.get({
      properties: {
        mobile: {
          description: "Do you need mobile app? y/N: "
        },
        editor: {
          description: "Do you need desktop editor source code? y/N: "
        }
      }
    }, function (err, result) {
      var withMobileApp = result.mobile === "y" || result.mobile === "yes";
      var withEditor = result.editor === "y" || result.editor === "yes";

      that.fetchWrapper('fay', 'deploy', 'https://github.com/phodal-archive/echeveria-deploy/archive/master.zip');
      that.fetchWrapper('fay', 'content', 'https://github.com/phodal-archive/echeveria-content/archive/master.zip');

      if (withMobileApp) {
        console.log("fetch mobile .. ");
        that.fetchWrapper('fay', 'mobile', 'https://github.com/phodal-archive/echeveria-mobile/archive/master.zip');
      }
      if (withEditor) {
        console.log("fetch editor .. ");
        that.fetchWrapper('fay', 'editor', 'https://github.com/phodal/echeveria-editor/archive/master.zip');
      }
    });
  },

  /**
   * Fetch a repo from GitHub, unzip it to a specific folder.
   *
   * The MIT License (MIT)
   *
   * Copyright (c) 2014 Drifty
   * https://github.com/driftyco/ionic-cli/blob/fd4a3433db7b727fde417c2e6bb177f99c52282d/lib/ionic.js
   */
  fetchWrapper: function (targetPath, repoName, repoUrl) {
    var q = Q.defer();
    var self = this;
    self.fetchRepo(targetPath, repoName, repoUrl).then(function (repoFolderName) {
      mv(targetPath + '/' + repoFolderName, targetPath + '/' + repoName);

      q.resolve(targetPath);
    }, function (err) {
      q.reject(err);
    });

    return q.promise;
  },

  fetchRepo: function (targetPath, repoName, repoUrl) {
    var q = Q.defer();

    var proxy = process.env.PROXY || null;

    // The folder name the project will be downloaded and extracted to
    console.log('\nDOWNLOADING:'.info.bold, repoUrl);

    var tmpFolder = os.tmpdir();
    var tempZipFilePath = path.join(tmpFolder, repoName + new Date().getTime() + '.zip');
    var tempZipFileStream = fs.createWriteStream(tempZipFilePath);
    var repoFolderName = 'echeveria-' + repoName + '-master';

    var unzipRepo = function (fileName) {
      var readStream = fs.createReadStream(fileName);
      readStream.on('error', function (err) {
        console.log(('unzipRepo readStream: ' + err).error);
        q.reject(err);
      });

      var writeStream = unzip.Extract({path: targetPath});
      writeStream.on('close', function () {
        q.resolve(repoFolderName);
      });
      writeStream.on('error', function (err) {
        console.log(('unzipRepo writeStream: ' + err).error);
        q.reject(err);
      });
      readStream.pipe(writeStream);
    };

    request({url: repoUrl, encoding: null, proxy: proxy}, function (err, res, body) {
      if (res.statusCode !== 200) {
        q.reject(res);
        return;
      }
      tempZipFileStream.write(body);
      tempZipFileStream.close();
      unzipRepo(tempZipFilePath);
    });

    return q.promise;
  }
};

exports.Fay = Fay;
