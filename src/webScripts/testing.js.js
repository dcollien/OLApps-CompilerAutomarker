include('testing.js');

response.setHeader('Content-Type', 'application/javascript');
response.writeData('var runTests = ' + runTests.toString());
