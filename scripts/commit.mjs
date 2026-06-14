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
const commit = run('git', [
  'commit-tree',
  tree,
  '-m',
  'Deploy WC26 Hub with predictions and Render config',
]);
run('git', ['update-ref', 'refs/heads/main', commit]);
run('git', ['symbolic-ref', 'HEAD', 'refs/heads/main']);
console.log(run('git', ['log', '-1', '--oneline']));
