import type { Directive } from 'vue'

interface LazyImageElement extends HTMLImageElement {
  _lazySrc?: string
}

const vLazy: Directive<LazyImageElement> = {
  mounted(el, binding) {
    el._lazySrc = binding.value
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.src = el._lazySrc || ''
            observer.unobserve(el)
          }
        })
      },
      {
        rootMargin: '100px',
        threshold: 0.1
      }
    )
    
    observer.observe(el)
  },
  
  updated(el, binding) {
    if (binding.value !== el._lazySrc) {
      el._lazySrc = binding.value
      el.src = ''
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              el.src = el._lazySrc || ''
              observer.unobserve(el)
            }
          })
        },
        {
          rootMargin: '100px',
          threshold: 0.1
        }
      )
      
      observer.observe(el)
    }
  }
}

export default vLazy