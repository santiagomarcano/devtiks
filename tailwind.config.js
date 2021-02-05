module.exports = {
  purge: [
    './src/templates/*.ejs',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      'montse': 'Monsterrat',
      'montse': 'Monsterrat Sub',

      'open-sans': 'Open Sans',
    },
    extend: {
      backgroundColor: {
        'canobo': "#FF9588",
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
