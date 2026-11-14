export const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

export const OUTPUT_FORMATS = {
  png: { mimeType: 'image/png', extension: 'png' },
  jpeg: { mimeType: 'image/jpeg', extension: 'jpg' },
  webp: { mimeType: 'image/webp', extension: 'webp' },
}

/** Pixel boundaries for n slices across `width` px. n slices -> n-1 internal cuts.
 *  Leftover pixels are spread naturally by the floor formula; no gaps or overlaps. */
export function getBoundaries(width, n) {
  return Array.from({ length: n }, (_, i) => {
    const startX = Math.floor((i * width) / n)
    const endX = Math.floor(((i + 1) * width) / n)
    return { startX, endX, width: endX - startX }
  })
}

export const sliceName = (i, format = 'png') => `slice-${String(i + 1).padStart(2, '0')}.${OUTPUT_FORMATS[format].extension}`

export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => resolve({ img, url })
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read this image. The file may be corrupted.')) }
    img.src = url
  })
}

const toBlob = (canvas, format) =>
  new Promise((resolve, reject) => {
    const { mimeType } = OUTPUT_FORMATS[format]
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Canvas export failed (image may be too large for this browser).'))
      if (blob.type !== mimeType) return reject(new Error(`${format.toUpperCase()} export is not supported by this browser.`))
      resolve(blob)
    }, mimeType, format === 'png' ? undefined : 0.92)
  })

export async function sliceImage(img, n, format = 'png', onProgress) {
  const w = img.naturalWidth, h = img.naturalHeight
  if (w < n) throw new Error(`Image is only ${w}px wide, so it cannot be split into ${n} slices. Choose ${w} or fewer.`)
  if (!OUTPUT_FORMATS[format]) throw new Error('Unsupported output format.')
  const slices = []
  try {
    for (const [i, b] of getBoundaries(w, n).entries()) {
      const canvas = document.createElement('canvas')
      canvas.width = b.width
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not create a canvas. The browser may be out of memory.')
      if (format === 'jpeg') {
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, b.width, h)
      }
      ctx.drawImage(img, b.startX, 0, b.width, h, 0, 0, b.width, h)
      const blob = await toBlob(canvas, format)
      slices.push({ index: i, name: sliceName(i, format), width: b.width, height: h, blob, url: URL.createObjectURL(blob) })
      canvas.width = canvas.height = 0
      onProgress?.(i + 1, n)
      await new Promise((r) => setTimeout(r)) // let the UI breathe
    }
  } catch (e) {
    slices.forEach((s) => URL.revokeObjectURL(s.url))
    throw e
  }
  return slices
}

export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = name
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function zipSlices(slices) {
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  slices.forEach((s) => zip.file(s.name, s.blob))
  return zip.generateAsync({ type: 'blob' })
}
