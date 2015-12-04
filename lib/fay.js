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
  /**
   * Fetch a repo from GitHub, unzip it to a specific folder.
   *
   * The MIT License (MIT)
   *
   * Copyright (c) 2013 Drifty
   * https://github.com/driftyco/ionic-cli
   */

  run: function () {
    console.log("init repo");
    var that = this;
    prompt.message = "Question!".rainbow;
    prompt.delimiter = "><".green;

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
      if (result.mobile === "y" || result.mobile === "yes") {
        console.log("fetch mobile .. ");
        that.fetchRepo('mobile', 'mobile', 'https://github.com/phodal-archive/echeveria-mobile/archive/master.zip');
      }
      if (result.editor === "y" || result.editor === "yes") {
        console.log("fetch editor .. ");
        that.fetchRepo('editor', 'editor', 'https://github.com/phodal/echeveria-editor/archive/master.zip');
      }
      that.fetchRepo('content', 'content', 'https://github.com/phodal-archive/echeveria-content/archive/master.zip');
      that.fetchRepo('builder', 'deploy', 'https://github.com/phodal-archive/echeveria-deploy/archive/master.zip');
    });
  },

  // https://github.com/driftyco/ionic-cli/blob/ce33bcc26336538d86f16b2fcd400dfbce5c73a7/lib/ionic/templates.js
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

      var writeStream = unzip.Extract({path: targetPath});
      writeStream.on('close', function () {
        q.resolve(repoName);
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
