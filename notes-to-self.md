- check all removed lines and also remove dependencies or references to see if you broke something
  and to remove unneeded files
- check https://webpack.js.org/api/loaders#thisvalue and see if can improve performance in some places
- performance of postcss-import is horrible. While the application of this plugin is questionable
  it is still used in a lot of places, so we need to introduce some form of caching, maybe even our
  own version. As it stands every imported file is parsed by postcss. This is done again and again
  for each import, even if it has been parsed before.
- Check dependencies, in the pull request you removed some code, it might be that they are still listed
  as dependencies.