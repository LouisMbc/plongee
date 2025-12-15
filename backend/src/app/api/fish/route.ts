import { NextResponse } from 'next/server'

// GET /api/fish?q=<query>
export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = url.searchParams.get('q') || ''
  const base = process.env.RFISHBASE_URL || 'http://rfishbase:8000'

  try {
    // call rfishbase species endpoint
    const res = await fetch(`${base}/species?name=${encodeURIComponent(q)}`, { cache: 'no-store' })
    if (!res.ok) {
      return NextResponse.json({ error: 'rfishbase error' }, { status: 502 })
    }
    const data = await res.json()

    // rfishbase::species() returns a data.frame-like structure - map to JS objects
    // We'll extract: SciName (Genus + Species), FBname (common name) and maybe an image URL if present (e.g., 'PicPreferredName')
    const list = []
    if (Array.isArray(data)) {
      for (const row of data) {
        const sci = [row.Genus, row.Species].filter(Boolean).join(' ')
        const common = row.FBname || row.ComName || null
        // rfishbase doesn't guarantee an image field; try several candidates
        const image = row.PicPreferredName || row.Picture || null
        list.push({ scientific_name: sci || row.SpecCode || null, common_name: common, image })
      }
    } else if (data && typeof data === 'object') {
      // single object
      const row = data
      const sci = [row.Genus, row.Species].filter(Boolean).join(' ')
      const common = row.FBname || row.ComName || null
      const image = row.PicPreferredName || row.Picture || null
      list.push({ scientific_name: sci || row.SpecCode || null, common_name: common, image })
    }

    return NextResponse.json(list)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
