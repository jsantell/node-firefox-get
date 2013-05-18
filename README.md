firefox-get
=====
Grab specific firefox package URLs

## Installation

`npm install firefox-get`

## Method

### get(version, [options], [callback])

`version` can be a number (`20`) or a string (`'18.0b2'`), or a channel version such as `'release'`, `'beta'`, `'aurora'` and `'nightly'`. Returns a promise, or can pass in a callback, which has an `err` and `value` argument signature.

There are some OS/version/language combinations that don't exist. Be sure to check the [Firefox FTP](http://ftp.mozilla.org/pub/mozilla.org/firefox/) to see if it exists when debugging any issues.

#### options

* `os`: Operating system. Available are the following:
  * `'linux-x86_64'` (default);
  * `'linux-i686'`
  * '`'mac'`'
  * '`'win32'`
  * '`'win64-x86_64'` (Only works with aurora/nightly channels)
* `language`: Any of the supported language codes. [Here's a list of languages](http://ftp.mozilla.org/pub/mozilla.org/firefox/releases/latest/linux-x86_64/). `'en-US'` is default.

## Examples

```javascript
var get = require('firefox-get');

get('16.0.2').then(function (url) {
  console.log(url); // http://ftp.mozilla.org/pub/mozilla.org/firefox/releases/16.0.2/linux-x86_64/en-US/firefox-16.0.2.tar.bz2
});

get('nightly').then(function (url) {
  console.log(url); // http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-trunk/firefox-24.0a1.en-US.linux-x86_64.tar.bz2
})

// Using options
get('release', { os: 'linux-i686', language: 'es-ES' }).then(function (url) {
  console.log(url); // http://ftp.mozilla.org/pub/mozilla.org/firefox/releases/linux-i686/es-ES/firefox-21.0.tar.bz2
});

// Using callbacks
get('notaversion', function (err) {
  // err on response
});

get('18.0b2', function (err, url) {
  // URL returned
});
```

## Development

Run tests with `npm test`

## License

MIT License
