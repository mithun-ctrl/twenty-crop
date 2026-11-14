import { useEffect, useState } from 'react'

const MIN_CROPS = 2
const MAX_CROPS = 40

export default function SliceControls({ count, format, onCount, onFormat, onReset, hasImage, busy, progress, hasAnything }) {
  const [cropDraft, setCropDraft] = useState(String(count))

  useEffect(() => setCropDraft(String(count)), [count])

  const updateCropCount = (value) => {
    setCropDraft(value)
    const nextCount = Number(value)
    if (Number.isInteger(nextCount) && nextCount >= MIN_CROPS && nextCount <= MAX_CROPS) onCount(nextCount)
  }

  const normalizeCropCount = () => {
    const enteredCount = Math.round(Number(cropDraft) || MIN_CROPS)
    const nextCount = Math.max(MIN_CROPS, Math.min(MAX_CROPS, enteredCount))
    setCropDraft(String(nextCount))
    onCount(nextCount)
  }

  return (
    <section className="slice-controls" aria-label="Slicing controls">
      <div className="control-fields">
        <div className="control-field">
          <label htmlFor="count">Crops</label>
          <input id="count" type="number" min={MIN_CROPS} max={MAX_CROPS} step="1" value={cropDraft}
            onChange={(event) => updateCropCount(event.target.value)} onBlur={normalizeCropCount}
            aria-describedby="crop-help" />
          <span id="crop-help" className="field-help">Choose 2–40 slices</span>
        </div>
        <div className="control-field">
          <label htmlFor="format">Format</label>
          <select id="format" value={format} onChange={(event) => onFormat(event.target.value)}>
            <option value="png">PNG</option>
            <option value="jpeg">JPG</option>
            <option value="webp">WebP</option>
          </select>
          <span className="field-help">Output image type</span>
        </div>
      </div>
      <div className="controls-divider" />
      <div className="controls-note" aria-live="polite">
        <span className={`note-spark${busy ? ' is-processing' : ''}`}>{busy ? '◌' : '✳'}</span>
        <span>{busy ? `Slicing image… ${progress}` : hasImage ? 'Slices update automatically.' : 'Add an image to preview your slices.'}</span>
      </div>
      <div className="control-actions">
        <button className="btn btn-reset" onClick={onReset} disabled={!hasAnything}>Reset</button>
      </div>
    </section>
  )
}
