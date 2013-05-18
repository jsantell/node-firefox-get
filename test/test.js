var get = require('../');
var when = require('when');
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var prefix = 'http://ftp.mozilla.org/pub/mozilla.org/firefox/';

describe('versions', function () {
  var versions = {};
  it('Handles older versions (3.6)', function (done) {
    get('3.6', { os: 'linux-i686' }).then(function (url) {
      expect(url).to.be.equal(
        prefix + 'releases/3.6/linux-i686/en-US/firefox-3.6.tar.bz2'
      );
      done();
    });
  });
  it('Handles several digits in version (16.0.2)', function (done) {
    get('16.0.2').then(function (url) {
      expect(url).to.be.equal(
        prefix + 'releases/16.0.2/linux-x86_64/en-US/firefox-16.0.2.tar.bz2'
      );
      done();
    });
  });
  it('Handles versions with letters (18.0b2)', function (done) {
    get('18.0b2').then(function (url) {
      expect(url).to.be.equal(
        prefix + 'releases/18.0b2/linux-x86_64/en-US/firefox-18.0b2.tar.bz2'
      );
      done();
    });
  });
  it('gets release version', function (done) {
    get('release').then(function (url) {
      var v = url.match(/firefox-(.*).tar.bz2/)[1];
      versions.release = v;
      expect(url).to.be.equal(
        prefix + 'releases/latest/linux-x86_64/en-US/firefox-'+v+'.tar.bz2'
      );
      done();
    });
  });
  it('gets beta version', function (done) {
    get('beta').then(function (url) {
      var v = url.match(/firefox-(.*).tar.bz2/)[1];
      versions.beta = v;
      expect(url).to.be.equal(
        prefix + 'releases/latest-beta/linux-x86_64/en-US/firefox-'+v+'.tar.bz2'
      );
      expect(parseInt(versions.beta)).to.be.greaterThan(parseInt(versions.release));
      done();
    });
  });
  it('gets aurora version', function (done) {
    get('aurora').then(function (url) {
      var v = url.match(/firefox-(.*).en-US.linux-x86_64.tar.bz2/)[1];
      versions.aurora = v;
      expect(url).to.be.equal(
        prefix + 'nightly/latest-mozilla-aurora/firefox-'+v+'.en-US.linux-x86_64.tar.bz2'
      );
      expect(parseInt(versions.aurora)).to.be.greaterThan(parseInt(versions.beta));
      done();
    });
  });
  it('gets nightly version', function (done) {
    get('nightly').then(function (url) {
      var v = url.match(/firefox-(.*).en-US.linux-x86_64.tar.bz2/)[1];
      versions.nightly = v;
      expect(url).to.be.equal(
        prefix + 'nightly/latest-trunk/firefox-'+v+'.en-US.linux-x86_64.tar.bz2'
      );
      expect(parseInt(versions.nightly)).to.be.greaterThan(parseInt(versions.aurora));
      done();
    });
  });
  it('rejects when invalid version', function (done) {
    get('abc', function () {}, function (reason) {
      expect(reason).to.be.ok;
      done();
    });
  });
  it('rejects when invalid combination', function (done) {
    // 3.6 does not have 64 bit build
    get('3.6', function () {}, function (reason) {
      expect(reason).to.be.ok;
      done();
    });
  });
});

describe('OS', function () {
  ['linux-x86_64', 'linux-i686', 'mac', 'win32'].forEach(function (os) {
    it('should work for OS: ' + os, function (done) {
      when.all([
        get('16.0.2', { os: os }),
        get('18.0b2', { os: os }),
        get('release', { os: os }),
        get('beta', { os: os }),
        get('aurora', { os: os }),
        get('nightly', { os: os })
      ]).then(function (urls) {
        urls.forEach(function (url) {
          expect(url).to.be.ok;
        });
        done();
      });
    });
  });
});

describe('callbacks', function () {
  it('passes url into callback if specified', function (done) {
    get('16.0.2', function (err, url) {
      expect(url).to.be.equal(
        prefix + 'releases/16.0.2/linux-x86_64/en-US/firefox-16.0.2.tar.bz2'
      );
      expect(err).to.not.be.ok;
      done();
    });
  });
  it('passes error into callback if specified and failed', function (done) {
    get('2xk40', function (err, url) {
      expect(url).to.be.not.ok;
      expect(err).to.be.ok;
      done();
    });
  });
});
