const path = require('path')

function replaceRootDirInPath(rootDir, filePath) {
  if (!/^<rootDir>/.test(filePath)) {
    return filePath
  }
  return path.resolve(rootDir, path.normalize(`./${filePath.substr('<rootDir>'.length)}`))
}

module.exports = {
  replaceRootDirInPath
}
