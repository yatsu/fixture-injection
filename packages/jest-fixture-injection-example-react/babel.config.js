module.exports = {
  presets: [
    '@babel/typescript',
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current'
        }
      }
    ]
  ]
}
