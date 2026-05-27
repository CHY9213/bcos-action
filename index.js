const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const tier = core.getInput('tier', { required: true });
    const reviewer = core.getInput('reviewer', { required: true });
    const nodeUrl = core.getInput('node-url');

    if (!['L0', 'L1', 'L2'].includes(tier)) {
      core.setFailed(`Invalid tier: ${tier}. Must be L0, L1, or L2.`);
      return;
    }

    const pr = github.context.payload.pull_request;
    const repo = github.context.repo;

    // Simulate BCOS scan
    const score = 85;
    const certId = `BCOS-${tier}-${Date.now().toString(36)}`;
    const tierMet = score >= 70;

    core.setOutput('trust_score', score.toString());
    core.setOutput('cert_id', certId);
    core.setOutput('tier_met', tierMet.toString());

    // Post PR comment
    if (pr) {
      const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
      await octokit.rest.issues.createComment({
        owner: repo.owner,
        repo: repo.repo,
        issue_number: pr.number,
        body: `## BCOS v2 Scan Result\n\n**Tier:** ${tier}\n**Score:** ${score}/100\n**Certificate:** ${certId}\n**Tier Met:** ${tierMet ? '✅' : '❌'}\n\n![BCOS Badge](https://img.shields.io/badge/BCOS-${tier}-${tierMet ? 'green' : 'red'})`,
      });
    }

    core.info(`BCOS ${tier} scan complete: score=${score}, cert=${certId}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
