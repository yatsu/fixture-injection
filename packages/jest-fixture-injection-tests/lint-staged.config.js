// eslint-disable-next-line
const micromatch = require('micromatch')

module.exports = {
  '*.js': (files) => {
    const match = micromatch.not(files, ['**/.*.js', '**/*.config.js'])
    return match.map(file => [`prettier-eslint --write ${file}`, `eslint ${file}`, `git add ${file}`])
  }
}
