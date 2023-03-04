const express = require('express');
const app = express();

const port = 3001;

app.use(express.static('public'));

//global vars
const fs = require('fs');
const common = JSON.parse(fs.readFileSync('./public/common.json'));
//

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});

app.get('/examples', async (req, res) => {
    res.send( await generateExamples() );
});

function convertToHTML(data)
{
    let html = ``;

    for (column in data)
    {
        const order = column;
        column = data[column];

        if (order == 0) //how to parse specific data - 0 for repo get
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

    return repoEntry;
}

async function generateExamples()
{
    const repos = common.repos;

    const apiRetries = 3;
    let dataHTML = '';

    for (let repo in repos)
    {
        repo = repos[repo];
        dataHTML += convertToHTML( await requestData(repo, apiRetries) );
    }

    return dataHTML;
}
