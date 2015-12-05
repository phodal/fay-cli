var os = require('os'),
  path = require('path'),
  unzip = require('unzip'),
  colors = require('colors'),
  fs = require('fs'),
  request = require('request'),
  prompt = require('prompt'),
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
  run: function () {
    var that = this;
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

      that.fetchRepo('fay', 'deploy', 'https://github.com/phodal-archive/echeveria-deploy/archive/master.zip');
      that.fetchRepo('fay', 'content', 'https://github.com/phodal-archive/echeveria-content/archive/master.zip');

      if (withMobileApp) {
        console.log("fetch mobile .. ");
        that.fetchRepo('fay', 'mobile', 'https://github.com/phodal-archive/echeveria-mobile/archive/master.zip');
      }
      if (withEditor) {
        console.log("fetch editor .. ");
        that.fetchRepo('fay', 'editor', 'https://github.com/phodal/echeveria-editor/archive/master.zip');
      }
    });
  },

  /**
   * Fetch a repo from GitHub, unzip it to a specific folder.
   *
   * The MIT License (MIT)
   *
   * Copyright (c) 2013 Drifty
   * https://github.com/driftyco/ionic-cli/blob/8103bc2e751ef7ce02c1aaa0fa9e624df8f1909d/lib/ionic.js
   */
  fetchRepo: function (targetPath, repoName, repoUrl) {
    var q = Q.defer();

    var proxy = process.env.PROXY || null;

    // The folder name the project will be downloaded and extracted to
    console.log('\nDOWNLOADING:'.info.bold, repoUrl);

    var tmpFolder = os.tmpdir();
    var tempZipFilePath = path.join(tmpFolder, repoName + new Date().getTime() + '.zip');
    var tempZipFileStream = fs.createWriteStream(tempZipFilePath);

    var unzipRepo = function (fileName) {
      var readStream = fs.createReadStream(fileName);
      readStream.on('error', function (err) {
        console.log(('unzipRepo readStream: ' + err).error);
        q.reject(err);
      });

      var writeStream = unzip.Extract({path: targetPath});
      writeStream.on('close', function () {
        q.resolve();
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
