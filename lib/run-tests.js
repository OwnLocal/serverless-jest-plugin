'use strict';

const runCLI = require('jest').runCLI;
const BbPromise = require('bluebird');

const runTests = (serverless, options) => new BbPromise((resolve, reject) => {
  const functionName = options.function;
  const allFunctions = serverless.service.getAllFunctions();
  const config = {
    testEnvironment: 'node',
  };

  const stage = options.stage;
  const region = options.region;

  serverless.service.load({
    stage,
    region,
  })
    .then((inited) => {
      Object.assign(serverless, { environment: inited.environment });
      const vars = new serverless.classes.Variables(serverless);
      vars.populateService(options);

      if (functionName) {
        if (allFunctions.indexOf(functionName) >= 0) {
          Object.assign(config, { testRegex: `${functionName}\\.test\\.js` });
        } else {
          return reject(`Function "${functionName}" not found`);
        }
      } else {
        const functionsRegex = allFunctions.map(name => `${name}\\.test\\.js`).join('|');
        Object.assign(config, { testRegex: functionsRegex });
      }

      return runCLI({ config },
        serverless.config.servicePath,
        success => resolve(success));
    });
});

module.exports = runTests;
