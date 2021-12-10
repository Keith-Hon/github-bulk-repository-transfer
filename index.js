require('dotenv').config();
const fs = require('fs');

const axios = require('axios');

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

(async () => {

    let repos = fs.readFileSync('./repos.txt', 'utf8').split('\n');

    for (const [_, repo] of repos.entries()) {

        try {
            await transfer({ repo });
            console.log(`${repo} successfully transferred from ${process.env.OLD_GITHUB_ACCOUNT_ID} to ${process.env.NEW_GITHUB_ACCOUNT_ID}`);
        } catch (err) {
            console.log(`${repo} failed: ${err}`);
        }
    }
    
})();
