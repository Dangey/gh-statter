const express = require('express');
const app = express();

const port = 3001;

app.use(express.static('public'));

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});

app.get('/', (req, res) => {
    res.sendFile('public/index.html');
    res.send(setExamples());
});

function setExamples()
{
    const fs = require('fs');
    const repos = JSON.parse(fs.readFileSync('./common.json')).repos;
    const routes = JSON.parse(fs.readFileSync('./common.json')).routes;

    const ghapi = require('./public/js/ghapi');

    const results = [];
    const len = routes.length;
    let sub = 0;

    for (let repo in repos)
    {
        let index = len - (len - sub);
        const entry = [];

        for (let route in routes)
        {
            entry.push( ghapi.req(repo, route) );
        }

        results.push(entry);
    }

    return results;
}
