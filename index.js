var request = require('request');
var when = require('when');
var URL = 'http://ftp.mozilla.org/pub/mozilla.org/firefox/';

var channels = {
  'release': 'releases/latest/',
  'beta': 'releases/latest-beta/',
  'aurora': 'nightly/latest-mozilla-aurora/',
  'nightly': 'nightly/latest-trunk/'
};

var osData = {
  'linux-x86_64': { ext: '.tar.bz2', prefix: 'firefox-' },
  'linux-i686':   { ext: '.tar.bz2', prefix: 'firefox-' },
  'mac':          { ext: '.dmg',     prefix: 'Firefox ' },
  'win32':        { ext: '.exe',     prefix: 'Firefox Setup ' },
  'win64-x86_64': { ext: '.installer.exe', prefix: 'firefox-' }
};

function createRegex (version, os, language) {
  var regex = '';
  if (version === 'aurora' || version === 'nightly') {
    // In aurora/nightly channels, all files use the same prefix
    regex += 'firefox-[0-9]*\\.[^\\.]*\\.';
    regex += language + '\\.' + os;
    // Windows builds in aurora/nightly channels all have .installer.exe
    regex += escapeExt(os === 'win32' ?
      osData['win64-x86_64'].ext :
      osData[os].ext);
  } else {
    regex += osData[os].prefix + '[0-9]+(\\.[0-9a-zA-Z]+)*';
    regex += escapeExt(osData[os].ext);
  }
  return new RegExp(regex);
}

function escapeExt (ext) {
  return (ext || '').replace(/\./g, '\\\.');
}

module.exports = function (version, options, callback) {
  callback = callback ? callback : typeof options === 'function' ? options : null;
  options = typeof options === 'function' || !options ? {} : options;
  version = typeof version === 'number' ? version.toFixed(1) : version;
  var deferred = when.defer();
  var os = options.os || 'linux-x86_64';
  var language = options.language || 'en-US';
  var url = URL;
  var regex = createRegex(version, os, language);

  if (channels[version])
    url += channels[version];
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
