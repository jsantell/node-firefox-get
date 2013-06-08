var request = require('request');
var when = require('when');

// root of all firefox product releases...
var FTP_ROOT = 'http://ftp.mozilla.org/pub/mozilla.org/';

/**
 * locations where releases for specific products can be found.
 */
var channels = {
  firefox: {
    'release': 'releases/latest/',
    'beta': 'releases/latest-beta/',
    'aurora': 'nightly/latest-mozilla-aurora/',
    'nightly': 'nightly/latest-trunk/'
  },
  b2g: {
    'release': 'nightly/latest-mozilla-b2g18/',
    'nightly': 'nightly/latest-mozilla-central/'
  }
};

/*
 * OS suffix mapping per product
 */
var osData = {
  firefox: {
    'linux-x86_64': { ext: '.tar.bz2', prefix: 'firefox-' },
    'linux-i686':   { ext: '.tar.bz2', prefix: 'firefox-' },
    'mac':          { ext: '.dmg',     prefix: 'Firefox ' },
    'win32':        { ext: '.exe',     prefix: 'Firefox Setup ' },
    'win64-x86_64': { ext: '.installer.exe', prefix: 'firefox-' }
  },
  b2g: {
    'linux-x86_64': { ext: '.tar.bz2', prefix: 'b2g-' },
    'linux-i686':   { ext: '.tar.bz2', prefix: 'b2g-' },
    'mac':          { ext: '.dmg',     prefix: 'b2g-' },
    'mac64':        { ext: '.dmg',     prefix: 'b2g-' },
    'win32':        { ext: '.zip',     prefix: 'b2g-' }
  }
};

function createRegex (product, version, os, language) {
  var regex = '';
  var osProduct = osData[product];
  if (product === 'b2g') {
    // prefix + version params
    regex += osProduct[os].prefix + '[0-9]+(\\.[0-9a-zA-Z]+)*';
    // specific OS version
    regex += '\\.' + os;
    // file ending
    regex += escapeExt(osProduct[os].ext);
  } else if (version === 'aurora' || version === 'nightly') {
    // In aurora/nightly channels, all files use the same prefix
    regex += product + '-[0-9]*\\.[^\\.]*\\.';
    regex += language + '\\.' + os;
    // Windows builds in aurora/nightly channels all have .installer.exe
    regex += escapeExt(os === 'win32' ?
      osProduct['win64-x86_64'].ext :
      osProduct[os].ext);
  } else {
    regex += osProduct[os].prefix + '[0-9]+(\\.[0-9a-zA-Z]+)*';
    regex += escapeExt(osProduct[os].ext);
  }
  return new RegExp(regex);
}

function escapeExt (ext) {
  return (ext || '').replace(/\./g, '\\\.');
}

/**
 * Find the channel path for a given product / version.
 *
 *    channelPath('linux-x86_64', 'en-US', 'firefox', 'beta');
 *    // => ftp://...
 *
 */
function channelPath(os, language, product, version) {
  var url = FTP_ROOT + product + '/';
  var productChannel = channels[product];

  if (productChannel[version])
    url += productChannel[version];
  else
    url += 'releases/' + version + '/';

  if (
    product === 'firefox' &&
    version !== 'aurora' &&
    version !== 'nightly'
  ) {
    url += os + '/' + language + '/';
  }

  return url;
}

function locateVersionInChannel(url, regex, callback) {
  var deferred = when.defer();

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
}

function getProductUrl(product, version, options, callback) {
  callback = callback ? callback : typeof options === 'function' ? options : null;
  options = typeof options === 'function' || !options ? {} : options;
  version = typeof version === 'number' ? version.toFixed(1) : version;
  var os = options.os || 'linux-x86_64';
  var language = options.language || 'en-US';
  var regex = createRegex(product, version, os, language);
  var url = channelPath(os, language, product, version);

  return locateVersionInChannel(url, regex, callback);
}

function firefox(version, options, callback) {
  return getProductUrl('firefox', version, options, callback);

}

function b2g(version, options, callback) {
  return getProductUrl('b2g', version, options, callback);
}

// preserve the original single function signature
function defaultGet() {
  return firefox.apply(this, arguments);
}

defaultGet.firefox = firefox;
defaultGet.b2g = b2g;

module.exports = defaultGet;
