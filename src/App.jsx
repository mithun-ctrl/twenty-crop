import { useEffect, useRef, useState } from 'react'
import ImageUploader from './components/ImageUploader'
import SliceControls from './components/SliceControls'
import SlicePreview from './components/SlicePreview'
import { ACCEPTED, loadImage, sliceImage } from './lib/slicer'

export default function App() {
  const [image, setImage] = useState(null)
  const [count, setCount] = useState(20)
  const [format, setFormat] = useState('png')
  const [slices, setSlices] = useState([])
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const live = useRef({ image: null, slices: [] })
  live.current = { image, slices }

  const revoke = (list) => list.forEach((s) => URL.revokeObjectURL(s.url))
  const clearSlices = () => { revoke(slices); setSlices([]); setSuccess('') }
  useEffect(() => () => { revoke(live.current.slices); live.current.image && URL.revokeObjectURL(live.current.image.url) }, [])

  useEffect(() => {
    if (!image) {
      setBusy(false)
      setProgress('')
      return
    }

    let cancelled = false
    setBusy(true)
    setError('')
    setSuccess('')
    setProgress('')

    const createSlices = async () => {
      try {
        const out = await sliceImage(image.img, count, format, (done, total) => {
          if (!cancelled) setProgress(`${done}/${total}`)
        })
        if (cancelled) {
          revoke(out)
          return
        }
        setSlices(out)
        setSuccess(`Success! Generated ${out.length} images.`)
      } catch (e) {
        if (!cancelled) setError(e.message || 'Something went wrong while slicing. The image may be too large.')
      } finally {
        if (!cancelled) {
          setBusy(false)
          setProgress('')
        }
      }
    }

    createSlices()
    return () => { cancelled = true }
  }, [image, count, format])

  const onFile = async (file) => {
    setError('')
    if (!ACCEPTED.includes(file.type)) return setError('Unsupported file. Please upload a JPG, PNG or WebP image.')
    try {
      const { img, url } = await loadImage(file)
      image && URL.revokeObjectURL(image.url)
      clearSlices()
      setImage({ img, url, name: file.name, width: img.naturalWidth, height: img.naturalHeight })
    } catch (e) { setError(e.message) }
  }

  const reset = () => {
    image && URL.revokeObjectURL(image.url)
    clearSlices(); setImage(null); setError('')
  }

  const onCount = (n) => { setCount(n); if (slices.length) clearSlices() }
  const onFormat = (value) => { setFormat(value); if (slices.length) clearSlices() }

  return (
    <div className="app-shell">
      <div className="ambient ambient--top" aria-hidden="true" />
      <div className="ambient ambient--side" aria-hidden="true" />
      <header className="app-header page-width">
        <a className="brand" href="#" aria-label="Twenty Crop home">
          <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
          <span>twenty<span className="brand-light">crop</span></span>
        </a>
        <div className="header-note"><span className="live-dot" /> A little tool for big images</div>
      </header>

      <main className="page-width workspace">
        <div aria-live="polite" className="status-stack">
          {error && <p role="alert" className="status-message status-error"><span className="status-icon">!</span>{error}</p>}
          {success && <p className="status-message status-success"><span className="status-icon">✓</span>{success}</p>}
        </div>

        <section className="editor-grid" aria-label="Image slicing workspace">
          <div className="panel upload-panel">
            <div className="panel-heading">
              <span className="step-number">01</span>
              <div><h2>Start with an image</h2><p>Choose the canvas you want to split.</p></div>
            </div>
            <ImageUploader image={image} count={count} onFile={onFile} onRemove={reset} disabled={busy} />
          </div>

          <div className="panel settings-panel">
            <div className="panel-heading">
              <span className="step-number">02</span>
              <div><h2>Tune your slices</h2><p>Preview updates automatically as you edit.</p></div>
            </div>
            <SliceControls count={count} format={format} onCount={onCount} onFormat={onFormat}
              onReset={reset} hasImage={!!image} busy={busy} progress={progress}
              hasAnything={!!image || slices.length > 0} />
          </div>
        </section>

        {slices.length > 0 && (
          <SlicePreview slices={slices} image={image} count={count} imageName={image.name} onError={setError} />
        )}
      </main>

      <footer className="app-footer page-width">
        <span className="footer-lock" aria-hidden="true">✳</span>
        <span>Your images stay yours. Everything is processed locally on your device.</span>
        <span className="footer-version">NO UPLOADS · NO ACCOUNT</span>
      </footer>
    </div>
  )
}
