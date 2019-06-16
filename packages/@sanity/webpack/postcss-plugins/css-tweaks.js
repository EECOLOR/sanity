const postcss = require('postcss')

// TODO: DISCUSS
// this module should probably produce a warning and only exist for a short period of time during
// which developers can update their css
module.exports = postcss.plugin(
  'css-tweaks',
  ({ removeImports }) => {
    return async styles => {
      styles.walkAtRules('import', atRule => {
        if (removeImports.some(x => atRule.params.includes(x))) {
          atRule.remove()
        }
      })
      styles.walkRules(rule => {
        rule.selector = rule.selector.replace(/::/g, ':')
      })
      styles.walkDecls(decl => {
        decl.value = decl.value.replace(/\bcolor\(/g, 'color-mod(') // color became color-mod which is also deprecated (without replacement)
        decl.value = decl.value.replace(/\blightness\(([+-]) /g, 'lightness\($1') // remove the space after + or -
      })
    }
  }
)
