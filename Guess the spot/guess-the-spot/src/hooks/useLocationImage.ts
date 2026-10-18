import { useEffect, useState } from 'react'

// Originals can be 10,000+ px wide and many MB; a 1280px thumbnail looks the same in the modal.
const MAX_WIDTH = 1280
const API = 'https://en.wikipedia.org/api/rest_v1/page'

type WikiImage = { source: string; width: number; height: number }

type WikiSummary = {
  originalimage?: WikiImage
  thumbnail?: WikiImage
}

type WikiMediaList = {
  items: { type: string; title: string; leadImage: boolean; srcset?: { src: string }[] }[]
}

type ImageState = {
  title: string | null
  url: string | null
  error: boolean
}

// Some articles lead with a logo or diagram rather than a photo of the place.
const isNotAPhoto = (url: string) => /\.svg|logo/i.test(url)

function pickSummaryImage({ originalimage, thumbnail }: WikiSummary): string | null {
  if (originalimage && thumbnail && originalimage.width > MAX_WIDTH && /\/\d+px-/.test(thumbnail.source)) {
    return thumbnail.source.replace(/\/\d+px-/, `/${MAX_WIDTH}px-`)
  }
  return originalimage?.source ?? thumbnail?.source ?? null
}

/** The article's lead photo (or first photo), skipping logos and diagrams. */
function pickMediaListImage({ items }: WikiMediaList): string | null {
  const photos = items.filter((item) => item.type === 'image' && !isNotAPhoto(item.title) && item.srcset?.length)
  const photo = photos.find((item) => item.leadImage) ?? photos[0]
  const src = photo?.srcset?.at(-1)?.src
  return src ? new URL(src, 'https:').href : null
}

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<T>
}

async function fetchImageUrl(wikiTitle: string, signal: AbortSignal): Promise<string | null> {
  const title = encodeURIComponent(wikiTitle)
  const url = pickSummaryImage(await fetchJson<WikiSummary>(`${API}/summary/${title}`, signal))
  // e.g. Eiffel Tower and CN Tower lead with their logos — look for a real photo instead.
  if (url && !isNotAPhoto(url)) return url
  return pickMediaListImage(await fetchJson<WikiMediaList>(`${API}/media-list/${title}`, signal))
}

export function useLocationImage(wikiTitle: string) {
  const [state, setState] = useState<ImageState>({ title: null, url: null, error: false })

  useEffect(() => {
    const controller = new AbortController()

    fetchImageUrl(wikiTitle, controller.signal)
      .then((url) => setState({ title: wikiTitle, url, error: url === null }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ title: wikiTitle, url: null, error: true })
      })

    return () => controller.abort()
  }, [wikiTitle])

  // Still loading until the result we hold belongs to the title being asked for.
  const loading = state.title !== wikiTitle
  return {
    url: loading ? null : state.url,
    loading,
    error: !loading && state.error,
  }
}
