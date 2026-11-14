import { useRef, useState } from 'react'

export default function ImageUploader({ image, count, onFile, onRemove, disabled }) {
  const input = useRef(null)
  const [drag, setDrag] = useState(false)
  const pick = (files) => files?.[0] && onFile(files[0])

  return (
    <section className="uploader" aria-label="Upload image">
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
        onChange={(e) => { pick(e.target.files); e.target.value = '' }} />
      {!image ? (
        <div role="button" tabIndex={0}
          aria-label="Choose or drop an image"
          onClick={() => !disabled && input.current.click()}
          onKeyDown={(e) => !disabled && (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), input.current.click())}
          onDragOver={(e) => { e.preventDefault(); if (!disabled) setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); if (!disabled) pick(e.dataTransfer.files) }}
          className={`drop-zone${drag ? ' is-dragging' : ''}${disabled ? ' is-disabled' : ''}`}>
          <span className="upload-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14.5v3A2.5 2.5 0 0 0 7.5 20h9a2.5 2.5 0 0 0 2.5-2.5v-3" /></svg>
          </span>
          <span className="drop-title">Drop your image here</span>
          <span className="drop-subtitle">or <span className="text-link">browse files</span></span>
          <span className="file-types"><span>JPG</span><span>PNG</span><span>WEBP</span><span>UP TO 40 CROPS</span></span>
        </div>
      ) : (
        <div className="uploaded-image">
          <div className="image-canvas">
            <img src={image.url} alt="Original upload" />
            <span className="image-ready"><span className="live-dot" /> READY</span>
          </div>
          <div className="image-meta">
            <span className="file-icon" aria-hidden="true">▧</span>
            <div className="file-details">
              <p className="file-name" title={image.name}>{image.name}</p>
              <p className="file-dimensions">{image.width} × {image.height} px</p>
            </div>
            <div className="file-actions">
              <button className="btn btn-quiet" disabled={disabled} onClick={() => input.current.click()}>Replace</button>
              <button className="btn btn-quiet" disabled={disabled} onClick={onRemove}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
