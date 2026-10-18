import { useState } from 'react'

type PhotoViewProps = {
  url: string | null
  loading: boolean
  error: boolean
  onReady: () => void
}

/** Shows the whole photo (never cropped), with a blurred copy filling any empty space. */
export default function PhotoView({ url, loading, error, onReady }: PhotoViewProps) {
  const [loaded, setLoaded] = useState(false)

  const handleLoad = () => {
    setLoaded(true)
    onReady()
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-800">
      {(loading || (url && !loaded)) && <div className="absolute inset-0 animate-pulse bg-slate-700" />}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-white/50">
          Photo unavailable
        </div>
      )}
      {url && (
        <>
          <img
            src={url}
            alt=""
            aria-hidden
            className={`absolute inset-0 h-full w-full scale-110 object-cover blur-xl transition-opacity ${loaded ? 'opacity-50' : 'opacity-0'}`}
          />
          <img
            src={url}
            alt="Mystery landmark"
            onLoad={handleLoad}
            onError={onReady}
            className={`relative h-full w-full object-contain transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </>
      )}
    </div>
  )
}
