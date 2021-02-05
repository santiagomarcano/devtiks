import"../styles/main.css"
console.log('what do you mean?')
const nav = document.querySelector('nav')
document.addEventListener('scroll', () => {
  if (window.pageYOffset > 0 && !nav.getAttribute('stuck')) {
    console.log('entro')
    nav.setAttribute('stuck', true)
    return
  } else if (window.pageYOffset === 0) {
    console.log('entro')
    nav.removeAttribute('stuck')
  }
})
