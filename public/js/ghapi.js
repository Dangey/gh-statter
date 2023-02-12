async function ghGet(repo, route)
{
    const { Octokit } = require('@octokit/core');
    const octokit = new Octokit();

    route = "GET " + route;

    return await octokit.request(route, {
        repo: repo
      });
}

module.exports = {
  req: ghGet
};
