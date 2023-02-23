const express = require('express');
const app = express();

const port = 3002;

app.use(express.static('public'));

//global vars
const fs = require('fs');
const common = JSON.parse(fs.readFileSync('./public/common.json'));

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
    if (setExamples())
    {
        console.log("Set Examples");
    }
    else
        console.log("Failed to set examples");
});

app.get('/', (req, res) => {
    res.sendFile('public/index.html');
});

function replaceTextInFile(fs, filename, replacement)
{
    fs.readFile(filename, 'utf8', function (err,data) {
        if (err) { return console.log(err); }

        var result = data.replace(/<!--REPLACE-->/g, replacement);

        fs.writeFile(filename, result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
}

function convertToHTML(data)
{
    let html = ``;
    for (row in data)
    {
        for (column in row)
        {
            const repoName = column[0];
            const ownerImage = column[1];
            const forkCount = column[2];
            const starCount = column[3];
            const watcherCount = column[4];
            const openIssueCount = column[5];

            html += `<tr>` +
            `<td><div>` +
            `<img src="${ownerImage}">` +
            `<a href="https://github.com/${repoName}">${repoName}</a>` +
            `</div></td>` +
            `<td>${forkCount}</td>` +
            `<td>${starCount}</td>` +
            `<td>${watcherCount}</td>` +
            `<td>${openIssueCount}</td>`;
        }
    }

    return html;
}

function filterResponse(repo, fields, data)
{
    const filteredData = [];
    filteredData.push(repo);

    for (field in fields)
    {
        let value = '-';
        field = fields[field];

        //parse multi-level JSON fields
        if (Array.isArray(field))
        {
            value = data;
            for (let subfield in field)
            {
                value = value[field[subfield]];
            }
        }
        else //parse just top-level field
        {
            value = data[field];
        }

        filteredData.push( value );
    }

    return filteredData;
}

async function requestData(repo, retryLimit)
{
    const routes = common.routes;
    const ghapi = require('./public/js/ghapi');

    const repoEntry = [];

    for (let route in routes)
    {
        route = routes[route];
        let reqTries = 0;
        while (reqTries < retryLimit)
        {
            let res = null;
            try { res = await ghapi.req(repo, route.path); }
            catch (err) { console.log(err); }

            if ( res.status == 200)
            {
                repoEntry.push( filterResponse(repo, route.fields, res.data) );
                break;
            }

            reqTries++;
        }
    }

    console.log(repoEntry);
    return repoEntry;
}

async function setExamples()
{
    const repos = common.repos;

    const retries = 3;
    const results = [];

    for (let repo in repos)
    {
        repo = repos[repo];
        results.push( await requestData(repo, retries) );
    }

    console.log(results);

    //const dataHtml = convertToHTML(results);
    //replaceTextInFile(fs, './public/index.html', dataHtml);

    return true;
}
