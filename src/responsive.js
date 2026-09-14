const estilosResponsive = `
.pc-product-image img,.pc-detail-image img{width:100%;height:100%;object-fit:contain;padding:14px}.pc-product-image{min-height:190px}.pc-product-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
@media(max-width:1000px){.pc-container{width:min(calc(100% - 28px),920px)}.pc-product-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.pc-admin-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.pc-hero-grid{grid-template-columns:1fr;gap:28px}}
@media(max-width:760px){.pc-container{width:min(calc(100% - 20px),680px)}.pc-page{padding:26px 0 44px}.pc-navbar-inner{min-height:auto;padding-top:10px;padding-bottom:10px;flex-wrap:wrap;gap:10px}.pc-nav-links{order:3;width:100%;justify-content:center;gap:14px;flex-wrap:wrap;padding-top:4px;font-size:.9rem}.pc-nav-actions{margin-left:auto}.pc-user-email{display:none}.pc-toolbar{grid-template-columns:1fr}.pc-product-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.pc-product-image{height:170px}.pc-product-body{padding:14px}.pc-product-name{font-size:1rem}.pc-product-description{min-height:0}.pc-product-actions{grid-template-columns:1fr}.pc-form-grid,.pc-admin-grid{grid-template-columns:1fr}.pc-hero{padding:54px 0}.pc-hero-panel{padding:20px}.pc-section{padding:42px 0}.pc-product-detail{grid-template-columns:1fr;gap:24px}.pc-detail-image{min-height:280px}.pc-buy-row{grid-template-columns:100px 1fr}}
@media(max-width:480px){.pc-container{width:calc(100% - 16px)}.pc-brand{font-size:1rem}.pc-brand-badge{width:34px;height:34px}.pc-nav-actions .pc-cart-button span{display:none}.pc-product-grid{grid-template-columns:1fr}.pc-product-image{height:210px}.pc-product-actions{grid-template-columns:1fr 1fr}.pc-buy-row{grid-template-columns:1fr}.pc-btn{width:100%}.pc-hero-actions{flex-direction:column}.pc-hero-actions .pc-btn{width:100%}.pc-table-wrapper{margin-left:-8px;margin-right:-8px}}
`

if (typeof document !== 'undefined' && !document.getElementById('pc-store-responsive-styles')) {
  const style = document.createElement('style')
  style.id = 'pc-store-responsive-styles'
  style.textContent = estilosResponsive
  document.head.appendChild(style)
}
