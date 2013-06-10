require.config({
  paths: {
    mocha: '/js/libs/mocha',
    chai: '/js/libs/chai',
  }
});

require([
  'require', 'mocha'
],
function(require)  {

  mocha.setup('bdd');

  require([
    'test.sample',
  ], function() {
    mocha.run();
  });
});