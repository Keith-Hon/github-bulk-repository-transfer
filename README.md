# github-bulk-repository-transfer

Node.js implementation of automating bulk repository transfer with github's api
https://docs.github.com/en/rest/reference/repos#transfer-a-repository

Steps
1. npm install
2. copy .env.template into .env and put values inside .env
3. node index.js

TODOs:
1. auto detect user account type (user/ organization)
2. error handling

After bulk transfer, github will send invitation to the new owner's email.
I used a script to automate the acceptance of all invitations.

Open https://gmail.com in chrome, and type

setInterval(() => {
  document.getElementsByClassName('adk')[0].click()
  document.getElementsByClassName('adn ads')[0].getElementsByTagName('a')[0].click()
}, 1000);

this script clicks the url from github emails and open the next email for you. 
