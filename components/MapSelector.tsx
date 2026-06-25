"use client"

import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet's default icon path issues in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapSelectorProps {
    coords: { lat: number, lon: number }
    onChange: (coords: { lat: number, lon: number }) => void
}

function LocationMarker({ coords, onChange }: MapSelectorProps) {
    useMapEvents({
        click(e) {
            onChange({ lat: e.latlng.lat, lon: e.latlng.lng })
        },
    })

    return coords === null ? null : (
        <Marker position={[coords.lat, coords.lon]}></Marker>
    )
}

function MapController({ coords }: { coords: { lat: number, lon: number } }) {
    const map = useMapEvents({})
    useEffect(() => {
        map.flyTo([coords.lat, coords.lon], map.getZoom())
    }, [coords.lat, coords.lon, map])
    return null
}

export default function MapSelector({ coords, onChange }: MapSelectorProps) {
    return (
        <div className="w-full h-64 rounded-xl overflow-hidden border border-white/10 z-0 relative z-0">
            <MapContainer 
                center={[coords.lat, coords.lon]} 
                zoom={5} 
                scrollWheelZoom={true} 
                style={{ height: '100%', width: '100%', background: '#111', zIndex: 0 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <LocationMarker coords={coords} onChange={onChange} />
                <MapController coords={coords} />
            </MapContainer>
        </div>
    )
}
