// eslint-disable-next-line
const micromatch = require('micromatch')

module.exports = {
  '*.ts': (files) => {
    const match = micromatch.not(files, ['**/.*.ts', '**/*.config.ts'])
    return [].concat(...match.map(file => [`prettier --write ${file}`, `tslint ${file}`, `git add ${file}`]))
  }
}
