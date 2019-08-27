// takes the test results to Insights

const http = require('https');


function sendTestResultsToInsights(newRelicAccountId, newRelicInsertKey, revision, buildId, repoUrl, testStats) {

    const options = {
        hostname: 'insights-collector.newrelic.com',
        path: `/v1/accounts/${newRelicAccountId}/events`,
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
            'X-Insert-Key': newRelicInsertKey
        }
    }

    const payload = Object.assign({}, testStats.stats, {
        eventType: 'TestResults',
        revision,
        buildId,
        repoUrl
    });

    console.log("SENDING PAYLOAD:", payload);
    const req = http.request(options, (res) => {
        var responseBody = '';
        res.on('data',(chunk) => responseBody = responseBody += chunk);
        res.on('end', () => {
            console.log('Insights Request Completed with code', res.statusCode);
            console.log('Body:')
            console.log(responseBody);
        });
    });

    req.on('error', (e) => {
        console.error(`Insights insert request failed: ${e}`);
    });

    // write data to request body
    req.write(JSON.stringify(payload));
    req.end();

}

module.exports = sendTestResultsToInsights;