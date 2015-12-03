var os = require('os'),
    path = require('path'),
    unzip = require('unzip'),
    colors = require('colors'),
    fs = require('fs'),
    request = require('request'),
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
        this.fetchRepo('content', 'echeveria-content', 'https://github.com/phodal-archive/echeveria-content/archive/master.zip');
    },

    // https://github.com/driftyco/ionic-cli/blob/ce33bcc26336538d86f16b2fcd400dfbce5c73a7/lib/ionic/templates.js

    fetchRepo: function (targetPath, repoName, repoUrl) {
        var q = Q.defer();

        var proxy = process.env.PROXY || null;

        // The folder name the project will be downloaded and extracted to
        var repoFolderName = repoName + '-master';
        console.log('\nDOWNLOADING:'.info.bold, repoUrl);

        var tmpFolder = os.tmpdir();
        var tempZipFilePath = path.join(tmpFolder, repoName + new Date().getTime() + '.zip');
        var tempZipFileStream = fs.createWriteStream(tempZipFilePath);

        var unzipRepo = function (fileName) {
            var readStream = fs.createReadStream(fileName);

            var writeStream = unzip.Extract({path: targetPath});
            writeStream.on('close', function () {
                q.resolve(repoFolderName);
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

//FAY.fetchRepo('fay', 'echeveria-content', 'https://github.com/phodal-archive/echeveria-content/archive/master.zip');

exports.Fay = Fay;