export const flyToCart = (sourceEl: HTMLElement | null, imageUrl?: string | null) => {
    if (!sourceEl) return
  
    const cartTarget = document.getElementById('navbar-cart-button')
    if (!cartTarget) return
  
    const from = sourceEl.getBoundingClientRect()
    const to = cartTarget.getBoundingClientRect()
  
    const flyEl = document.createElement(imageUrl ? 'img' : 'div')
    if (imageUrl && flyEl instanceof HTMLImageElement) {
      flyEl.src = imageUrl
      flyEl.style.objectFit = 'cover'
    }
  
    flyEl.style.position = 'fixed'
    flyEl.style.left = `${from.left + from.width / 2 - 16}px`
    flyEl.style.top = `${from.top + from.height / 2 - 16}px`
    flyEl.style.width = '32px'
    flyEl.style.height = '32px'
    flyEl.style.borderRadius = '9999px'
    flyEl.style.background = imageUrl ? 'transparent' : '#10b981'
    flyEl.style.boxShadow = '0 8px 20px rgba(0,0,0,0.18)'
    flyEl.style.zIndex = '9999'
    flyEl.style.pointerEvents = 'none'
    flyEl.style.transition = 'transform 650ms cubic-bezier(.22,.61,.36,1), opacity 650ms ease'
  
    document.body.appendChild(flyEl)
  
    const dx = to.left + to.width / 2 - (from.left + from.width / 2)
    const dy = to.top + to.height / 2 - (from.top + from.height / 2)
  
    requestAnimationFrame(() => {
      flyEl.style.transform = `translate(${dx}px, ${dy}px) scale(0.35)`
      flyEl.style.opacity = '0.25'
    })
  
    window.setTimeout(() => {
      flyEl.remove()
    }, 700)
  }