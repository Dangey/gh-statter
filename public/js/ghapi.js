async function ghGet(repo, route)
{
    const { Octokit } = require('@octokit/core');
    const octokit = new Octokit();

    const temp = repo.split("/");
    const repoOwner = temp[0];
    const repoName = temp[1];
    
    return await octokit.request(route, {
        owner: repoOwner,
        repo: repoName,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });
}

module.exports = {
  req: ghGet
};
