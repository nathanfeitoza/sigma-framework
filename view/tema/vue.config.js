module.exports = {
    publicPath: process.env.NODE_ENV === 'production'
      ? '/'/*'/view/teste/'*/
      : '/',
    indexPath: process.env.NODE_ENV === 'production'
    ? 'index.twig'
    : 'index.html'
  }