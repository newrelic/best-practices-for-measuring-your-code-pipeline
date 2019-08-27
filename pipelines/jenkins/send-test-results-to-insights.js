// takes the test results written by mocha and sends them to insights

const sendTestResultstoInsigts = require('../lib/send-test-results-to-insights');
const testStats = require('../../testStats');

const newRelicAccountId = process.env['NEW_RELIC_ACCOUNT_ID'];
const newRelicInsertKey = process.env['NEW_RELIC_INSERT_KEY'];
const revision = process.env['GIT_COMMIT'];
const buildId = process.env['BUILD_ID'];
const repoUrl = process.env['GIT_URL'];

sendTestResultstoInsigts(newRelicAccountId, newRelicInsertKey, revision, buildId, repoUrl, testStats);