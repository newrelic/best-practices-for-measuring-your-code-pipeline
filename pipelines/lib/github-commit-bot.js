// this is a utility function that is used to simulate user SCM activity.  It is not required to measure any parts
// of the code pipeline.

const http = require('https');

const committers = [
    {
        name: 'Developer One',
        email: 'developerone@example.com'
    },
    {
        name: 'Developer Two',
        email: 'developertwo@example.com'
    },
    {
        name: 'Developer Three',
        email: 'developerthree@example.com'
    },
    {
        name: 'Developer Four',
        email: 'developerfour@example.com'
    }
];

/**
 * @param {string} githubToken api token for the github repo
 * @param {string} owner github username
 * @param {string} repo github repo name (will be used to construct the url)
 * @param {string} filePath path from the repo root to the file we are going to overwrite
 * @param {float} shouldFail a float between 0 and 1 representing the percent of commits that will cause failing unit tests.
 */
function commit(githubToken, owner, repo, filePath, shouldFail) {

    const getContentsOptions = {
        hostname: 'api.github.com',
        path: `/repos/${owner}/${repo}/contents/${filePath}`,
        method: 'GET',
        headers: {
            'Authorization': `token ${githubToken}`,
            'User-Agent': 'Autocommit'
        }
    }

    const updateContentsOptions = {
        hostname: 'api.github.com',
        path: `/repos/${owner}/${repo}/contents/${filePath}`,
        method: 'PUT',
        headers: {
            'Authorization': `token ${githubToken}`,
            'User-Agent': 'Autocommit'
        }
    }

    return new Promise((resolve, reject) => {

        const req = http.request(getContentsOptions, (res) => {
            var responseBody = '';
            res.on('data',(chunk) => responseBody = responseBody += chunk);
            res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        body: responseBody
                    });
            });
        });

        req.on('error', (e) => {
          reject(`Github get content request for ${getContentsOptions.path} failed: ${e}`);
        });

        req.end();
        
    })
    .then((getContentsResult) => {
        if (getContentsResult.statusCode != 200) {
            throw new Error(`Error returned from GitHub when getting ${getContentsOptions.path}, code: ${getContentsResult.statusCode}, body: ${getContentsResult.body}`);
        }
        
        const jsonBody = JSON.parse(getContentsResult.body);

        const fileContents = new Buffer(jsonBody.content, 'base64').toString('ascii');
        const parsedContents = JSON.parse(fileContents);

        const newContents = {};

        var commitMessage = 'auto commit';

        if (parsedContents.failMode == true) {
            // tests are failing, use the same committer to fix them
            commitMessage = 'fixing tests';
            newContents.failMode = false;
            newContents.failRate = 0.0;
            newContents.commit = {
                committer: {
                    date: new Date().toISOString(),
                    name: parsedContents.commit.committer.name,
                    email: parsedContents.commit.committer.email
                }
            };
        } else {
            const newCommitter = committers[Math.floor(Math.random() * committers.length)];
            
            newContents.commit = {
                committer: {
                    date: new Date().toISOString(),
                    name: newCommitter.name,
                    email: newCommitter.email
                }
            };

            // will this committer introduce failing tests?
            if (Math.random() < shouldFail) {
                commitMessage = 'committing some failing tests'
                newContents.failMode = true;
                newContents.failRate = Math.random();
            } else {
                newContents.failMode = false;
                newContents.failRate = 0.0
            }

        }

        return new Promise((resolve, reject) => {

            const payload = {
                message: commitMessage,
                committer: {
                    name: newContents.commit.committer.name,
                    email: newContents.commit.committer.email
                },
                content: new Buffer(JSON.stringify(newContents, null, 4)).toString('base64'),
                sha: jsonBody.sha
            }

            const req = http.request(updateContentsOptions, (res) => {
                var responseBody = '';
                res.on('data',(chunk) => responseBody = responseBody += chunk);
                res.on('end', () => {
                        resolve({
                            statusCode: res.statusCode,
                            body: responseBody
                        });
                });
            });
    
            req.on('error', (e) => {
              reject(`Github PUT content request for ${updateContentsOptions.path} failed: ${e}`);
            });
    
            req.write(JSON.stringify(payload));
            req.end();
            
        }) 
    });   

}

module.exports = commit;