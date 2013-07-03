var bin = __dirname + '/../bin/firefox-get';
var exec = require('child_process').exec;
var chai = require('chai');
var expect = chai.expect;
var prefix = 'http://ftp.mozilla.org/pub/mozilla.org/firefox/';

describe('CLI', function () {
  it('handles long arguments', function (done) {
    exec(bin + ' --version 3.6 --os linux-i686 --language es-ES', function (err, stdout) {
      if (err) return done(err);
      expect(stdout).to.be.equal(prefix + 'releases/3.6/linux-i686/es-ES/firefox-3.6.tar.bz2');
      done();
    });
  });
  it('handles short arguments', function (done) {
    exec(bin + ' -v 3.6 -o linux-i686 -l es-ES', function (err, stdout) {
      if (err) return done(err);
      expect(stdout).to.be.equal(prefix + 'releases/3.6/linux-i686/es-ES/firefox-3.6.tar.bz2');
      done();
    });
  });
  it('handles release versions', function (done) {
    exec(bin + ' --version beta', function (err, stdout) {
      if (err) return done(err);
      var v = stdout.match(/firefox-(.*).tar.bz2/)[1];
      expect(stdout).to.be.equal(
        prefix + 'releases/latest-beta/linux-x86_64/en-US/firefox-'+v+'.tar.bz2'
      );
      done();
    });
  });
  it('prints to stderr on fail and exits with an error code', function (done) {
    exec(bin + ' --v abc', function (err, stdout, stderr) {
      expect(stdout).to.not.be.ok;
      expect(err.code).to.be.equal(1);
      expect(stderr).to.be.equal('No packages found');
      done();
    });
  });
  it('gets a B2G build when specified', function (done) {
    exec(bin + ' --b2g', function (err, stdout) {
      if (err) return done(err);
      expect(stdout).to.match(/http:\/\/.*b2g/);
      done();
    });
  });
  it('gets a B2G build when specified with short option', function (done) {
    exec(bin + ' -b', function (err, stdout) {
      if (err) return done(err);
      expect(stdout).to.match(/http:\/\/.*b2g/);
      done();
    });
  });
});
