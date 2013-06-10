define([
  'chai'
], function(chai) { 
  var expect = chai.expect;

  describe('sample test', function() {
    it('async test', function(done) {
      expect(1).to.equal(1);
      done();
    });
  });
});