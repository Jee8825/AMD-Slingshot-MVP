"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "@/lib/api";
import { RefreshCw, AlertCircle, MapPin } from "lucide-react";

// Fix for default marker icons in React Leaflet with Next.js
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Only run this on the client side
if (typeof window !== "undefined") {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconUrl: markerIcon.src,
        iconRetinaUrl: markerIcon2x.src,
        shadowUrl: markerShadow.src,
    });
}

interface Grievance {
    id: number;
    title: string;
    description: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    status: string;
    created_at: string;
}

// A simple component to change view dynamically when needed
function MapEffect({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

export default function GrievanceMap() {
    const [grievances, setGrievances] = useState<Grievance[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadGrievances = async () => {
        setLoading(true);
        setError("");
        try {
            // Fetch only pending grievances as requested
            const data = await api.get<Grievance[]>("/api/v1/grievances?status=pending");
            setGrievances(data);
        } catch (err: any) {
            setError(err.message || "Failed to load map data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGrievances();
    }, []);

    // Filter out grievances without valid coordinates
    const mappedGrievances = grievances.filter(
        (g) => g.latitude !== undefined && g.latitude !== null && g.longitude !== undefined && g.longitude !== null
    );

    // Default center (can be adjusted to India or gram panchayat center)
    const defaultCenter: [number, number] = [20.5937, 78.9629]; // India center
    const center = mappedGrievances.length > 0
        ? [mappedGrievances[0].latitude!, mappedGrievances[0].longitude!] as [number, number]
        : defaultCenter;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-neutral-900/50 rounded-lg border border-red-900/30 text-red-400">
                <AlertCircle className="h-8 w-8 mb-4" />
                <p>{error}</p>
                <button
                    onClick={loadGrievances}
                    className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] bg-neutral-900/20 rounded-lg border border-neutral-800">
                <RefreshCw className="h-8 w-8 animate-spin text-teal-500 mb-4" />
                <p className="text-neutral-400">Loading map data...</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-neutral-800 shadow-xl">
            {mappedGrievances.length === 0 ? (
                <div className="absolute inset-0 z-[400] flex flex-col items-center justify-center bg-neutral-900/80 backdrop-blur-sm">
                    <MapPin className="h-12 w-12 text-neutral-500 mb-4 opacity-50" />
                    <p className="text-neutral-300 font-medium">No Pending Geotagged Grievances</p>
                    <p className="text-neutral-500 text-sm mt-2 max-w-sm text-center">
                        There are currently no pending grievances with associated location data to display on the map.
                    </p>
                </div>
            ) : null}

            <MapContainer
                center={center}
                zoom={5}
                scrollWheelZoom={true}
                className="w-full h-full z-0"
                style={{ background: "#171717" }} // neutral-900
            >
                {mappedGrievances.length > 0 && <MapEffect center={center} />}

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {mappedGrievances.map((grievance) => (
                    <Marker
                        key={grievance.id}
                        position={[grievance.latitude!, grievance.longitude!]}
                    >
                        <Popup className="custom-popup">
                            <div className="p-1 min-w-[200px]">
                                <h3 className="font-bold text-sm mb-1 text-slate-800">{grievance.title}</h3>
                                <p className="text-xs text-slate-600 mb-2 line-clamp-2">{grievance.description}</p>
                                {grievance.location && (
                                    <p className="text-xs text-slate-500 flex items-start gap-1">
                                        <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                                        <span>{grievance.location}</span>
                                    </p>
                                )}
                                <div className="mt-3 text-[10px] text-slate-400 flex justify-between">
                                    <span>ID: #{grievance.id}</span>
                                    <span>{new Date(grievance.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* A small style override for leaflet popup text to be readable on dark map but light popup bg */}
            <style jsx global>{`
                .leaflet-popup-content-wrapper {
                    background-color: #f8fafc;
                    color: #0f172a;
                    border-radius: 8px;
                }
                .leaflet-popup-tip {
                    background-color: #f8fafc;
                }
                .leaflet-container {
                    font-family: inherit;
                }
            `}</style>
        </div>
    );
}
