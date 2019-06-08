These are things I need to discuss with the sanity team. These are just notes for myself.

- Remove babel compilation for node. With node 8 we have async/await and the only thing that is
  different is that `import x from 'y'` is written as `const x = require('y')`. It however saves
  all the hassle that comes with compiling. On top of that, the babel / register stuff complicates
  debugging with async / await calls.
- Remove as much default arguments as possible. I noticed inconsistent defaults in method chains
  (`function a(x = 1) { b(x) }; function b(x = 2) { ... };`) where both methods were exported.
- Limit the use of `process.env` to the cli code and pass it down if some code requires the value.
- Split `basePath` into `context` and `publicPath`
- Distinguish between sanity server target and project configuration env. I imagine `SANITY_ENV` and
  `CONFIG_ENV`, do not use `NODE_ENV` for configuration but only for performance:
  `NODE_ENV === 'production'` and `NODE_ENV !== 'production'` should be the only checks present. We
  want to use `NODE_ENV production`, `SANITY_ENV production` and `CONFIG_ENV acceptance`.
- Clear package separation: public packages, public sanity plugins packages, internal packages (I
  don't think these should be published at all)
- Specify a clear interface to the outside world in packages (a main file that exposes the interface)
- Do not use babelrc style files, it complicates things. It's in most cases better to supply the
  config directly to the babel loader / plugin.
