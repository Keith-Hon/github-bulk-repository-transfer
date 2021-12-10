require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const isReadFromLocaleFile = true;
const isOldOwnerOrganization = false;

async function transfer({ repo }) {
    var data = JSON.stringify({
        "new_owner": process.env.NEW_GITHUB_ACCOUNT_ID,
    });

    var config = {
        method: 'post',
        url: `https://api.github.com/repos/${process.env.OLD_GITHUB_ACCOUNT_ID}/${repo}/transfer`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(process.env.OLD_GITHUB_ACCOUNT_ID + ":" + process.env.GITHUB_PERSONAL_ACCESS_TOKEN).toString('base64')}`
        },
        data: data
    };
    return axios(config);

}

async function getAllOrgRepos({ org }) {

    let repos = [];
    let limit = 100;
    let shouldContinue = true;
    let page = 1;

    while (shouldContinue) {
        console.log(`Getting data from page ${page}`);
        var config = {
            method: 'get',
            url: `https://api.github.com/orgs/${org}/repos?per_page=${limit}&page=${page}`,
            headers: {
                'Authorization': `Basic ${Buffer.from(process.env.OLD_GITHUB_ACCOUNT_ID + ":" + process.env.GITHUB_PERSONAL_ACCESS_TOKEN).toString('base64')}`
            }
        };
        let response = await axios(config);
        let list = response.data;
        repos.push(...list.map(repo => repo.name));
        page++;
        if (list.length < limit) {
            shouldContinue = false;
        }
    }

    return repos;
}

(async () => {

    let repos;
    if (isReadFromLocaleFile) {
        repos = fs.readFileSync('./repos.txt', 'utf8').split('\n');
    } else if (isOldOwnerOrganization) {
        repos = await getAllOrgRepos({ org: process.env.OLD_GITHUB_ACCOUNT_ID });
    }

    for (const [_, repo] of repos.entries()) {
        try {
            await transfer({ repo });
            console.log(`${repo} successfully transferred from ${process.env.OLD_GITHUB_ACCOUNT_ID} to ${process.env.NEW_GITHUB_ACCOUNT_ID}`);
        } catch (err) {
            console.log(`${repo} failed: ${err}`);
        }
    }

})();
