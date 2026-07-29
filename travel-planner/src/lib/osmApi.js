/**
 * POI that (khach san, nha hang) tu du lieu OpenStreetMap.
 * Khong dung LLM cho phan nay vi LLM bia ten va dia chi khong co that.
 *
 * Hai nguon, deu la OSM, deu mien phi va ho tro CORS:
 *
 * 1. Photon (photon.komoot.io) — NGUON CHINH.
 *    Geocoder chay tren OSM, nhanh, xep hang theo do noi bat nen ra dung
 *    cac co so lon/duoc biet den. Khong rate-limit gat.
 *    Han che: khong tra tag stars/cuisine/website.
 *
 * 2. Overpass — DU PHONG.
 *    Tag day du hon nhung la dich vu cong dong, rate-limit rat gat
 *    (429/504 thuong xuyen), nen chi dung khi Photon khong du ket qua.
 */

const PHOTON_URL = 'https://photon.komoot.io/api/'

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
]

const STAY_LABELS = {
  hotel: 'khách sạn',
  resort: 'resort',
  guest_house: 'homestay',
  hostel: 'hostel',
  motel: 'nhà nghỉ',
  apartment: 'căn hộ',
  chalet: 'bungalow',
}

const STAY_KINDS = Object.keys(STAY_LABELS)
const STAY_TAGS = STAY_KINDS.map((kind) => `tourism:${kind}`)

// Loai bo ket qua roi sang tinh khac.
const MAX_RADIUS_KM = 60

function distanceKm(center, lat, lon) {
  const R = 6371
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(lat - center.latitude)
  const dLon = toRad(lon - center.longitude)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(toRad(center.latitude)) * Math.cos(toRad(lat))
  return 2 * R * Math.asin(Math.sqrt(h))
}

function buildItem({ id, name, lat, lon, kind, parts, cuisine, stars, website, phone }, center) {
  if (!name || lat == null || lon == null) return null
  const distance = distanceKm(center, lat, lon)
  if (distance > MAX_RADIUS_KM) return null

  return {
    osmId: id,
    name,
    lat,
    lon,
    address: parts.filter(Boolean).join(', '),
    kind,
    kindLabel: STAY_LABELS[kind] ?? null,
    cuisine: cuisine ? cuisine.split(';')[0].replace(/_/g, ' ') : null,
    // stars la du lieu that trong OSM; khong co thi de null chu khong bia.
    rating: Number.isFinite(Number(stars)) ? Number(stars) : null,
    website: website ?? null,
    phone: phone ?? null,
    distanceKm: distance,
  }
}

function dedupe(items) {
  const seen = new Set()
  return items.filter((item) => {
    const key = item.name.trim().toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/* ------------------------------- Photon ------------------------------- */

async function photon(center, cityName, tags, limit) {
  const params = new URLSearchParams({
    q: cityName,
    lat: String(center.latitude),
    lon: String(center.longitude),
    limit: String(limit),
    lang: 'en',
  })
  for (const tag of tags) params.append('osm_tag', tag)

  const res = await fetch(`${PHOTON_URL}?${params}`)
  if (!res.ok) throw new Error(`Photon ${res.status}`)
  const data = await res.json()

  const items = (data.features ?? [])
    .map((feature) => {
      const p = feature.properties ?? {}
      const [lon, lat] = feature.geometry?.coordinates ?? []
      return buildItem(
        {
          id: `${p.osm_type ?? 'n'}/${p.osm_id}`,
          name: p.name,
          lat,
          lon,
          kind: p.osm_value,
          parts: [p.housenumber, p.street, p.district, p.city ?? p.county],
        },
        center,
      )
    })
    .filter(Boolean)

  return dedupe(items)
}

/* ------------------------------ Overpass ------------------------------ */

const RETRY_DELAYS_MS = [0, 1500, 4000]

const DETAIL_TAGS = [
  'addr:street',
  'addr:housenumber',
  'website',
  'contact:website',
  'phone',
  'contact:phone',
  'stars',
  'cuisine',
  'opening_hours',
  'brand',
]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function overpass(body) {
  let lastError = null

  for (const delay of RETRY_DELAYS_MS) {
    if (delay) await sleep(delay)

    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ data: body }),
        })
        if (res.ok) {
          const data = await res.json()
          return data.elements ?? []
        }
        lastError = new Error(`Overpass ${res.status}`)
      } catch (err) {
        lastError = err
      }
    }
  }

  throw lastError ?? new Error('Overpass không phản hồi')
}

/** Mot query lay ca cho o lan nha hang de tiet kiem quota. */
function poiQuery({ latitude, longitude }, radiusM) {
  const at = `(around:${radiusM},${latitude},${longitude})`
  const stay = `["tourism"~"^(${STAY_KINDS.join('|')})$"]`
  return `[out:json][timeout:60];
(
  node${stay}["name"]${at};
  way${stay}["name"]${at};
  node["amenity"="restaurant"]["name"]${at};
  way["amenity"="restaurant"]["name"]${at};
);
out center 250;`
}

/** Tag cang day du => POI cang co kha nang la co so that su dang hoat dong. */
function overpassRank(a, b) {
  if (b.detail !== a.detail) return b.detail - a.detail
  return a.distanceKm - b.distanceKm
}

async function overpassPois(center) {
  const elements = await overpass(poiQuery(center, 15000))

  const items = elements
    .map((el) => {
      const t = el.tags ?? {}
      const item = buildItem(
        {
          id: `${el.type}/${el.id}`,
          name: t.name,
          lat: el.lat ?? el.center?.lat,
          lon: el.lon ?? el.center?.lon,
          kind: t.tourism ?? t.amenity,
          parts: [
            t['addr:housenumber'],
            t['addr:street'],
            t['addr:quarter'] ?? t['addr:suburb'],
            t['addr:city'] ?? t['addr:district'],
          ],
          cuisine: t.cuisine,
          stars: t.stars,
          website: t.website ?? t['contact:website'],
          phone: t.phone ?? t['contact:phone'],
        },
        center,
      )
      if (item) item.detail = DETAIL_TAGS.filter((key) => t[key]).length
      return item
    })
    .filter(Boolean)

  return {
    stays: dedupe(items.filter((i) => STAY_KINDS.includes(i.kind))).sort(overpassRank),
    restaurants: dedupe(items.filter((i) => i.kind === 'restaurant')).sort(overpassRank),
  }
}

/* -------------------------- Dieu phoi + cache ------------------------- */

const ENOUGH = 4

async function load(place) {
  const center = { latitude: place.latitude, longitude: place.longitude }
  const cityName = place.name

  let stays = []
  let restaurants = []

  try {
    ;[stays, restaurants] = await Promise.all([
      photon(center, cityName, STAY_TAGS, 15),
      photon(center, cityName, ['amenity:restaurant'], 15),
    ])
  } catch {
    /* roi xuong Overpass */
  }

  if (stays.length >= ENOUGH && restaurants.length >= ENOUGH) {
    return { stays, restaurants, source: 'photon' }
  }

  try {
    const fallback = await overpassPois(center)
    return {
      // Giu ben nao nhieu ket qua hon cho tung nhom.
      stays: fallback.stays.length > stays.length ? fallback.stays : stays,
      restaurants:
        fallback.restaurants.length > restaurants.length ? fallback.restaurants : restaurants,
      source: 'overpass',
    }
  } catch (err) {
    if (stays.length || restaurants.length) return { stays, restaurants, source: 'photon' }
    throw err
  }
}

const memory = new Map()

function cacheKey(place) {
  return `osm:${place.latitude.toFixed(3)},${place.longitude.toFixed(3)}`
}

function readSession(key) {
  try {
    const raw = globalThis.sessionStorage?.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeSession(key, value) {
  try {
    globalThis.sessionStorage?.setItem(key, JSON.stringify(value))
  } catch {
    /* quota day: bo qua, cache trong memory van chay */
  }
}

/**
 * POI quanh mot dia diem. Cache theo toa do nen getHotels va getPlaces
 * goi song song chi ton mot lan tai du lieu.
 */
export function fetchPois(place) {
  const key = cacheKey(place)

  if (!memory.has(key)) {
    const cached = readSession(key)
    if (cached) {
      memory.set(key, Promise.resolve(cached))
    } else {
      const pending = load(place)
        .then((result) => {
          writeSession(key, result)
          return result
        })
        .catch((err) => {
          memory.delete(key) // that bai thi lan sau duoc thu lai
          throw err
        })
      memory.set(key, pending)
    }
  }

  return memory.get(key)
}

export async function searchStays(place, limit = 6) {
  const { stays, source } = await fetchPois(place)
  return { items: stays.slice(0, limit), source }
}

export async function searchRestaurants(place, limit = 6) {
  const { restaurants, source } = await fetchPois(place)
  return { items: restaurants.slice(0, limit), source }
}
