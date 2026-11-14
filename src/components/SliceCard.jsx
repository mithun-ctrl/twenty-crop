import { downloadBlob } from '../lib/slicer'

export default function SliceCard({ slice }) {
  return (
    <li className="slice-card">
      <div className="slice-card-image">
        <img src={slice.url} alt={`Slice ${slice.index + 1}`} />
      </div>
      <div className="slice-card-footer">
        <div className="slice-card-info">
          <p>{String(slice.index + 1).padStart(2, '0')}</p>
          <span>{slice.width} × {slice.height}</span>
        </div>
        <button className="btn btn-card-download" onClick={() => downloadBlob(slice.blob, slice.name)} aria-label={`Download ${slice.name}`}>↓</button>
      </div>
    </li>
  )
}
