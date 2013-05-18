var request = require('request');
var when = require('when');
var URL = 'http://ftp.mozilla.org/pub/mozilla.org/firefox/';

var fluxVersions = {
  'release': 'releases/latest/',
  'beta': 'releases/latest-beta/',
  'aurora': 'nightly/latest-mozilla-aurora/',
  'nightly': 'nightly/latest-trunk/'
};

module.exports = function (version, options, callback) {
  callback = callback ? callback : typeof options === 'function' ? options : null;
  options = typeof options === 'function' || !options ? {} : options;
  version = typeof version === 'number' ? version.toFixed(1) : version;
  var deferred = when.defer();
  var os = options.os || 'linux-x86_64';
  var language = options.language || 'en-US';
  var url = URL;
  var regex = version === 'aurora' || version === 'nightly' ?
    new RegExp('firefox-[0-9]*\\.[^\\.]*\\.' + language + '\\.' + os + '\\.tar\\.bz2') :
    /firefox-[0-9]+(\.[0-9a-zA-Z]+)*\.tar\.bz2/;

  if (fluxVersions[version])
    url += fluxVersions[version];
  else
    url += 'releases/' + version + '/';

  if (version !== 'aurora' && version !== 'nightly')
    url += os + '/' + language + '/';

  if (callback)
    deferred.promise.then(callback.bind(null, null), callback.bind(null));

  request(url, function (err, res, body) {
    var matches = [];
    body.split('\n').forEach(function (line) {
      var match = line.match(regex);
      if (match)
        matches.push(match[0]);
    });

    if (matches.length) {
      // Take the latest match since flux versions
      // can have several versions in their directory
      deferred.resolve(url + matches[matches.length - 1]);
    } else
      deferred.reject('No packages found');
  });

  return deferred.promise;
};
