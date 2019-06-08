import config from 'config:sanity'
import debug from 'sanity:debug'
import defaultLoginConfig from 'config:@sanity/default-login'
import rawBaseDocuments from '-!raw-loader!all:part:@sanity/base/document'
import versions from 'sanity:versions'

console.log('Compatibility:')
console.log(SANITY_PARTS_COMPATIBILITY)
console.log('')
console.log('sanity.json')
console.log(config)
console.log('')
console.log('config/@sanity/default-login')
console.log(defaultLoginConfig)
console.log('')
console.log('Debug')
console.log('- definitions:', Object.keys(debug.definitions).length)
console.log('- implementations:', Object.keys(debug.implementations).length)
console.log('- plugins:', Object.keys(debug.plugins).length)
console.log('')
console.log('Versions')
console.log(versions)
console.log('')
console.log('A few lines of `all:part:@sanity/base/document`')
rawBaseDocuments.forEach(x => console.log(x.split('\n').slice(38, 53).join('\n')))