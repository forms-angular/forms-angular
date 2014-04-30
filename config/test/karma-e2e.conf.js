module.exports = function(config) {
    config.set({
        basePath: '../../',
        frameworks: ['ng-scenario'],
        files : [
          'test/e2e/**/*.js'
        ],
        autoWatch : true,
        browsers : ['PhantomJS'],
        urlRoot : '/__karma/', // Stop Testacular server serving it's own page rather than proxing the request.
        proxies : {
          '/': 'http://localhost:3002/'
        },
        junitReporter : {
          outputFile:
              'test_out/e2e.xml',
          suite: 'e2e'
        }
    });
};