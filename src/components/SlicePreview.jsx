import { useState } from 'react'
import SliceCard from './SliceCard'
import { downloadBlob, zipSlices } from '../lib/slicer'

export default function SlicePreview({ slices, image, count, imageName, onError }) {
  const [mode, setMode] = useState('continuous')
  const [zipping, setZipping] = useState(false)

  const downloadZip = async () => {
    setZipping(true)
    const fileName = imageName.split(/[\\/]/).pop()
    const extensionIndex = fileName.lastIndexOf('.')
    const baseName = extensionIndex > 0 ? fileName.slice(0, extensionIndex) : fileName
    try { downloadBlob(await zipSlices(slices), `${baseName}.zip`) }
    catch (e) { onError(e.message || 'Could not create the ZIP file.') }
    finally { setZipping(false) }
  }

  const tab = (id, label) => (
    <button role="tab" aria-selected={mode === id} onClick={() => setMode(id)}
      className={`results-tab${mode === id ? ' is-active' : ''}`}>{label}</button>
  )

  return (
    <section aria-label="Results" className="results-section">
      <div className="results-heading">
        <div className="results-title-wrap">
          <span className="step-number">03</span>
          <div><h2>Your slices are ready</h2><p>{slices.length} images, lined up and good to go.</p></div>
        </div>
        <button className="btn btn-download-all" onClick={downloadZip} disabled={!slices.length || zipping}>
          <span className="download-icon" aria-hidden="true">↓</span>{zipping ? 'Preparing ZIP…' : 'Download all (ZIP)'}
        </button>
      </div>
      <div role="tablist" aria-label="Slice preview layout" className="results-tabs">{tab('continuous', 'Seamless strip')}{tab('grid', 'Individual slices')}</div>
      {mode === 'continuous' ? (
        <div className="strip-frame">
          <div className="strip-hint"><span className="live-dot" /> SEAMLESS PREVIEW · {count} SLICES</div>
          <div className="strip-scroll">
            <div className="slice-strip-preview">
              <img src={image.url} alt={`Image preview divided into ${count} vertical slices`} />
              <div className="preview-slice-guides" aria-hidden="true">
                {Array.from({ length: count - 1 }, (_, index) => (
                  <span key={index} style={{ left: `${((index + 1) / count) * 100}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ul className="slice-grid">
          {slices.map((s) => <SliceCard key={s.name} slice={s} />)}
        </ul>
      )}
    </section>
  )
}
