require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const isReadFromLocaleFile = false;
const oldOwnerType = 'user'; // user or org

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
        data
    };
    return axios(config);

}

async function fetchAllRepos({ userType }) {

    let repos = [];
    let limit = 100;
    let shouldContinue = true;
    let page = 1;

    let url;

    while (shouldContinue) {

        if (userType === 'org') {
            url = `https://api.github.com/orgs/${process.env.OLD_GITHUB_ACCOUNT_ID}/repos?per_page=${limit}&page=${page}`;
        } else if (userType === 'user') {
            url = `https://api.github.com/search/repositories?q=user:${process.env.OLD_GITHUB_ACCOUNT_ID}&per_page=${limit}&page=${page}`;
        }

        console.log(`Getting data from page ${page}, with url ${url}`);
        var config = {
            method: 'get',
            url,
            headers: {
                'Authorization': `Basic ${Buffer.from(process.env.OLD_GITHUB_ACCOUNT_ID + ":" + process.env.GITHUB_PERSONAL_ACCESS_TOKEN).toString('base64')}`
            }
        };
        let response = await axios(config);

        let list = userType == 'org' ? response.data : response.data.items;
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
    } else {
        repos = await fetchAllRepos({ userType: oldOwnerType });
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
