"""
Reverse geocoding helper (uses free Nominatim API for MVP).
"""
import httpx


async def reverse_geocode(lat: float, lng: float) -> str | None:
    """Convert lat/lng to a human-readable address via Nominatim."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                "https://nominatim.openstreetmap.org/reverse",
                params={"lat": lat, "lon": lng, "format": "json"},
                headers={"User-Agent": "DigiGramPro/0.1"},
            )
            resp.raise_for_status()
            data = resp.json()
            return data.get("display_name")
    except Exception:
        return None
