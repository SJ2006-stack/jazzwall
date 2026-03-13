(() => {
  const existing = document.getElementById('jazzwall-overlay-root')
  if (existing) return

  const root = document.createElement('div')
  root.id = 'jazzwall-overlay-root'

  root.innerHTML = `
    <div id="jazzwall-translation-overlay" style="
      position: fixed;
      right: 20px;
      bottom: 20px;
      width: 320px;
      background: rgba(16, 24, 40, 0.92);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 14px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.25);
      backdrop-filter: blur(8px);
      z-index: 999999;
      font-family: Inter, system-ui, -apple-system, sans-serif;
    ">
      <div style="padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.12); display:flex; align-items:center; justify-content:space-between;">
        <strong style="font-size: 13px;">JazzWall Live Translation</strong>
        <span style="font-size:11px; opacity:.8;">Phase 2</span>
      </div>
      <div id="jazzwall-live-text" style="padding: 12px 14px; font-size: 12px; line-height: 1.45; min-height: 56px; opacity:.95;">
        Waiting for live transcript…
      </div>
    </div>

    <aside id="jazzwall-action-sidebar" style="
      position: fixed;
      left: 16px;
      top: 80px;
      width: 260px;
      max-height: calc(100vh - 100px);
      overflow: auto;
      background: rgba(255, 255, 255, 0.96);
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 14px;
      box-shadow: 0 10px 28px rgba(0,0,0,0.12);
      z-index: 999998;
      font-family: Inter, system-ui, -apple-system, sans-serif;
    ">
      <div style="padding: 12px 14px; border-bottom: 1px solid rgba(0,0,0,0.08); display:flex; align-items:center; justify-content:space-between;">
        <strong style="font-size: 13px; color:#111827;">Action Items</strong>
        <span style="font-size:11px; color:#6b7280;">Live</span>
      </div>
      <ul id="jazzwall-action-list" style="margin: 0; padding: 10px 16px 14px; list-style: disc; color:#374151; font-size:12px; line-height:1.5;">
        <li>AI detection starts once recording begins.</li>
      </ul>
    </aside>
  `

  document.body.appendChild(root)

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === 'JAZZWALL_OVERLAY_TEXT') {
      const el = document.getElementById('jazzwall-live-text')
      if (el) el.textContent = message.payload?.text || '…'
    }

    if (message?.type === 'JAZZWALL_ACTION_ITEMS') {
      const ul = document.getElementById('jazzwall-action-list')
      if (!ul) return
      ul.innerHTML = ''
      const items = message.payload?.items || []
      if (!items.length) {
        const li = document.createElement('li')
        li.textContent = 'No action items detected yet.'
        ul.appendChild(li)
        return
      }
      for (const item of items) {
        const li = document.createElement('li')
        li.textContent = item
        ul.appendChild(li)
      }
    }
  })
})()
