const commitBot = require('../lib/github-commit-bot');

const githubToken = process.env['GITHUB_TOKEN'];
const owner = process.env['OWNER'];
const repo = process.env['REPO'];
const filePath = process.env['FILE_PATH'];
const shouldFail = parseFloat(process.env['SHOULD_FAIL'])

commitBot(githubToken, owner, repo, filePath, shouldFail)
.catch((e) => {
    console.error(e);
    process.exit(1);
});