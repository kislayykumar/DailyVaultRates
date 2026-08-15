/**
 * GitHub Actions PR Comment Bot
 * Posts or updates a summary comment on Pull Requests.
 */
module.exports = async ({ github, context }) => {
  try {
    const prNumber = context.payload.pull_request?.number || context.issue.number;
    const author = context.payload.pull_request?.user?.login || context.actor;

    if (!prNumber) {
      console.log('No PR number found. Skipping comment script.');
      return;
    }

    const { data: files } = await github.rest.pulls.listFiles({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: prNumber,
    });

    const added = files.reduce((acc, f) => acc + f.additions, 0);
    const deleted = files.reduce((acc, f) => acc + f.deletions, 0);

    const maxFiles = 30;
    let fileList = files
      .slice(0, maxFiles)
      .map((f) => `- \`${f.filename}\` (${f.status}, +${f.additions}/-${f.deletions})`);

    if (files.length > maxFiles) {
      fileList.push(`- *... and ${files.length - maxFiles} more files.*`);
    }

    const prBody = `### 🤖 Automated PR Verification & Summary Bot

| Metric | Details |
| :--- | :--- |
| **PR Author** | @${author} |
| **Files Changed** | ${files.length} files (+${added} / -${deleted} lines) |
| **Code Owner Gate** | Required Review & Approval from **@kislayykumar** |
| **Automated Checks** | Next.js Build, ESLint, & Data Integrity Checks |

<details>
<summary>📂 <strong>Click to view modified files list (${files.length} files)</strong></summary>

${fileList.join('\n')}

</details>

---
*Generated automatically by DailyVaultRates Bot for @${context.repo.owner}/${context.repo.repo}*`;

    const { data: comments } = await github.rest.issues.listComments({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: prNumber,
    });

    const botComment = comments.find(
      (c) => c.body && c.body.includes('Automated PR Verification & Summary Bot')
    );

    if (botComment) {
      await github.rest.issues.updateComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        comment_id: botComment.id,
        body: prBody,
      });
      console.log('✅ Successfully updated PR summary comment.');
    } else {
      await github.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: prNumber,
        body: prBody,
      });
      console.log('✅ Successfully created new PR summary comment.');
    }
  } catch (err) {
    console.log('PR Comment Bot execution note:', err.message);
  }
};
