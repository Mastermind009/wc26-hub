import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const cwd = 'C:\\Users\\Sayan\\Projects\\wc26-hub';

function run(cmd, args) {
  return execFileSync(cmd, args, { cwd, encoding: 'utf8' }).trim();
}

run('git', ['add', '.']);
const tree = run('git', ['write-tree']);
const user = JSON.parse(run('gh', ['api', 'user']));
const email = user.email || `${user.login}@users.noreply.github.com`;
const name = user.name || user.login;
process.env.GIT_AUTHOR_NAME = name;
process.env.GIT_AUTHOR_EMAIL = email;
process.env.GIT_COMMITTER_NAME = name;
process.env.GIT_COMMITTER_EMAIL = email;

let parent = '';
try {
  parent = run('git', ['rev-parse', 'HEAD']);
} catch {
  parent = '';
}

const args = ['commit-tree', tree, '-m', 'Fix API 502/404 with cached bundle endpoint and retries'];
if (parent) args.push('-p', parent);

const commit = run('git', args);
run('git', ['update-ref', 'refs/heads/main', commit]);
console.log(run('git', ['log', '-1', '--oneline']));
