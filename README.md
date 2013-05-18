firefox-get
=====
Grab specific firefox packages

* Only supports linux at the moment
* Needs more tests

## Method

### get(version, [options], [callback])

`version` can be a number (`20`) or a string (`18.0b2`), or a channel version such as `release`, `beta`, `aurora` and `nightly`. Returns a promise, or can pass in a callback, which has an `err` and `value` argument signature.

#### options

* `os`: Operating system. Currently only `linux-x86_64` (default) and `linux-i686`
* `language`: Any of the supported language codes. `en-US` is default.

## Examples

```javascript
var get = require('firefox-get');

get('16.0.2').then(function (url) {
  console.log(url); // http://ftp.mozilla.org/pub/mozilla.org/firefox/releases/16.0.2/linux-x86_64/en-US/firefox-16.0.2.tar.bz2
});

get('nightly').then(function (url) {
  console.log(url); // http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-trunk-firefox-24.0a.en-US.linux-x86_64.tar.bz2
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
