'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { STORE_LOCATION_CONSTANTS } from '@/constants/location-constants';
import { Map, Layers, ExternalLink, Globe, Navigation, Truck } from 'lucide-react';

import { subscribeLogisticsProgress } from '@/utils/logistics-sync';

interface LogisticsMapProps {
  orderId?: number;
  orderCode?: string;
  originLat?: number;
  originLng?: number;
  originName?: string;
  originAddress?: string;
  destLat?: number | null;
  destLng?: number | null;
  destName?: string;
  destAddress?: string;
  stationLat?: number | null;
  stationLng?: number | null;
  stationName?: string;
  orderStatus?: string;
  progressPercentage?: number; // 0 - 100
  trackingCode?: string;
  height?: string;
}

// Haversine formula fallback
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function LogisticsMap({
  orderId,
  orderCode,
  originLat = STORE_LOCATION_CONSTANTS.STORE_GPS_LATITUDE,
  originLng = STORE_LOCATION_CONSTANTS.STORE_GPS_LONGITUDE,
  originName = STORE_LOCATION_CONSTANTS.STORE_NAME,
  originAddress = STORE_LOCATION_CONSTANTS.STORE_ADDRESS,
  destLat,
  destLng,
  destName = 'Địa chỉ nhận hàng',
  destAddress = 'Chưa cập nhật địa chỉ GPS',
  stationLat,
  stationLng,
  stationName = 'Bưu cục trung chuyển GHN',
  orderStatus = 'pending',
  progressPercentage = 0,
  trackingCode,
  height = '380px',
}: LogisticsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const activeTileLayerRef = useRef<L.TileLayer | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const shipperMarkerRef = useRef<L.Marker | null>(null);
  const roadPathRef = useRef<[number, number][]>([]);

  const [liveProgress, setLiveProgress] = useState<number>(progressPercentage);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [durationText, setDurationText] = useState<string>('1-2 ngày');
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>('street');
  const [isRoutingOSRM, setIsRoutingOSRM] = useState<boolean>(false);

  // Sync prop changes into liveProgress
  useEffect(() => {
    setLiveProgress(progressPercentage);
  }, [progressPercentage]);

  // Subscribe to real-time BroadcastChannel updates from Portals
  useEffect(() => {
    const unsubscribe = subscribeLogisticsProgress((payload) => {
      const matchId = orderId && payload.orderId === orderId;
      const matchCode = orderCode && payload.orderCode === orderCode;
      const matchTracking = trackingCode && payload.trackingCode === trackingCode;

      if (matchId || matchCode || matchTracking || (!orderId && !orderCode && !trackingCode)) {
        if (typeof payload.progressPercentage === 'number') {
          setLiveProgress(payload.progressPercentage);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [orderId, orderCode, trackingCode]);

  const validDestLat = destLat || originLat + 0.05;
  const validDestLng = destLng || originLng + 0.05;

  // 1. Initialize Map & Base Tile Layers (Runs ONCE)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        scrollWheelZoom: true,
      });

      L.control.zoom({ position: 'bottomleft' }).addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const invalidateTimeout = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(invalidateTimeout);
    };
  }, []);

  // 2. Tile Layer Switcher
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (activeTileLayerRef.current) {
      map.removeLayer(activeTileLayerRef.current);
    }

    let newTileLayer: L.TileLayer;
    if (mapStyle === 'satellite') {
      newTileLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          attribution: 'Tiles &copy; Esri World Imagery | AP Sports',
        }
      );
    } else {
      newTileLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: 'Tiles &copy; Esri Street Map | AP Sports',
        }
      );

      const osmFallback = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }
      );

      newTileLayer.on('tileerror', () => {
        if (!map.hasLayer(osmFallback)) {
          osmFallback.addTo(map);
        }
      });
    }

    newTileLayer.addTo(map);
    activeTileLayerRef.current = newTileLayer;
  }, [mapStyle]);

  // 3. Static Markers & OSRM Route Fetching (Runs ONLY when coordinates change)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const fallbackDist = calculateHaversineDistance(
      originLat,
      originLng,
      validDestLat,
      validDestLng
    );
    setDistanceKm(fallbackDist);

    // Remove existing markers & polylines (EXCEPT tile layer)
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    const createCustomIcon = (
      bgColor: string,
      borderColor: string,
      iconSvg: string,
      label: string
    ) => {
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            gap: 6px;
            background: white;
            padding: 4px 10px;
            border-radius: 9999px;
            border: 2px solid ${borderColor};
            box-shadow: 0 4px 14px rgba(0,0,0,0.22);
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 11px;
            font-weight: 800;
            white-space: nowrap;
          ">
            <div style="
              width: 22px;
              height: 22px;
              border-radius: 50%;
              background: ${bgColor};
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
            ">
              ${iconSvg}
            </div>
            <span style="color: #0f172a; padding-right: 2px;">${label}</span>
          </div>
        `,
        iconSize: [120, 36],
        iconAnchor: [20, 36],
      });
    };

    const storeIconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`;
    const storeIcon = createCustomIcon('#f97316', '#f97316', storeIconSvg, 'Kho AP Sports');

    const customerIconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
    const customerIcon = createCustomIcon('#10b981', '#10b981', customerIconSvg, 'Điểm Nhận Hàng');

    const stationIconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="16" height="16" x="4" y="4" rx="2"/></svg>`;
    const stationIcon = createCustomIcon('#06b6d4', '#06b6d4', stationIconSvg, 'Trạm GHN');

    const shipperIconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`;
    const shipperIcon = L.divIcon({
      className: 'shipper-animated-marker',
      html: `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            position: absolute;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: rgba(37, 99, 235, 0.35);
            animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          "></div>
          <div style="
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: #2563eb;
            border: 2px solid white;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            z-index: 10;
          ">
            ${shipperIconSvg}
          </div>
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 21],
    });

    // Add Store & Customer Markers
    L.marker([originLat, originLng], { icon: storeIcon })
      .addTo(map)
      .bindPopup(`<b>${originName}</b><br/><span style="font-size:11px;color:#64748b;">${originAddress}</span>`);

    L.marker([validDestLat, validDestLng], { icon: customerIcon })
      .addTo(map)
      .bindPopup(`<b>${destName}</b><br/><span style="font-size:11px;color:#64748b;">${destAddress}</span>`);

    if (stationLat && stationLng) {
      L.marker([stationLat, stationLng], { icon: stationIcon })
        .addTo(map)
        .bindPopup(`<b>${stationName}</b>`);
    }

    // Always create Shipper Marker on map (Initialized at Origin Store)
    const initialShipperMarker = L.marker([originLat, originLng], {
      icon: shipperIcon,
      zIndexOffset: 1000,
    })
      .addTo(map)
      .bindPopup(
        `<b>Xe Tải / Shipper GHN</b><br/>Vận đơn: <code>${trackingCode || 'GHN-LOGISTICS'}</code>`
      );
    shipperMarkerRef.current = initialShipperMarker;

    let isCancelled = false;

    const loadOSRMRoute = async () => {
      try {
        setIsRoutingOSRM(true);
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${validDestLng},${validDestLat}?overview=full&geometries=geojson`;
        const response = await fetch(osrmUrl);
        const data = await response.json();

        if (!isCancelled && data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const roadPath: [number, number][] = route.geometry.coordinates.map(
            (pt: [number, number]) => [pt[1], pt[0]]
          );

          roadPathRef.current = roadPath;

          const realDistKm = Math.round((route.distance / 1000) * 10) / 10;
          const realMins = Math.round(route.duration / 60);
          const realHours = Math.ceil(realMins / 60);

          setDistanceKm(realDistKm);
          setDurationText(realHours > 1 ? `${realHours} giờ (${realMins} phút)` : `${realMins} phút`);

          const polyline = L.polyline(roadPath, {
            color: '#ea580c',
            weight: 5,
            opacity: 0.9,
          }).addTo(map);

          polylineRef.current = polyline;

          map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
          setIsRoutingOSRM(false);
          return;
        }
      } catch (err) {
        console.warn('OSRM routing unavailable, using linear fallback:', err);
      }

      if (!isCancelled) {
        const fallbackPath: [number, number][] = [
          [originLat, originLng],
          ...(stationLat && stationLng ? ([[stationLat, stationLng]] as [number, number][]) : []),
          [validDestLat, validDestLng],
        ];

        roadPathRef.current = fallbackPath;

        const polyline = L.polyline(fallbackPath, {
          color: '#ea580c',
          weight: 5,
          dashArray: '8, 8',
          opacity: 0.9,
        }).addTo(map);

        polylineRef.current = polyline;

        const bounds = L.latLngBounds([
          [originLat, originLng],
          [validDestLat, validDestLng],
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });
        setIsRoutingOSRM(false);
      }
    };

    loadOSRMRoute();

    return () => {
      isCancelled = true;
    };
  }, [
    originLat,
    originLng,
    originName,
    originAddress,
    validDestLat,
    validDestLng,
    destName,
    destAddress,
    stationLat,
    stationLng,
    stationName,
    trackingCode,
  ]);

  // 4. Smooth Vehicle Movement Update (Runs whenever liveProgress changes with ZERO flickering!)
  useEffect(() => {
    if (!shipperMarkerRef.current) return;

    const path = roadPathRef.current;
    if (path.length === 0) {
      // Fallback linear interpolation
      const ratio = Math.max(0, Math.min(100, liveProgress)) / 100;
      const curLat = originLat + (validDestLat - originLat) * ratio;
      const curLng = originLng + (validDestLng - originLng) * ratio;
      shipperMarkerRef.current.setLatLng([curLat, curLng]);
      return;
    }

    const ratio = Math.max(0, Math.min(100, liveProgress)) / 100;
    const targetIdx = Math.min(
      path.length - 1,
      Math.floor(ratio * (path.length - 1))
    );
    const targetCoords = path[targetIdx];

    // Smoothly update marker position without removing/re-creating any DOM element!
    shipperMarkerRef.current.setLatLng(targetCoords);
  }, [liveProgress, originLat, originLng, validDestLat, validDestLng]);

  const openGoogleMapsDirections = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${validDestLat},${validDestLng}&travelmode=driving`;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-900 transition-colors">
      {/* Map Style Switcher & Google Directions Link (Top Right) */}
      <div className="absolute top-3 right-3 z-[400] flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md">
        <button
          type="button"
          onClick={() => setMapStyle('street')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
            mapStyle === 'street'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Đường Phố OSRM</span>
        </button>

        <button
          type="button"
          onClick={() => setMapStyle('satellite')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
            mapStyle === 'satellite'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Vệ Tinh HD</span>
        </button>

        <a
          href={openGoogleMapsDirections}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition-all ml-1 cursor-pointer"
          title="Mở chỉ đường trực tiếp trên ứng dụng Google Maps"
        >
          <Map className="w-3.5 h-3.5 text-emerald-600" />
          <span>Google Maps</span>
          <ExternalLink className="w-3 h-3 text-emerald-500" />
        </a>
      </div>

      {/* Map Leaflet Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height }} />

      {/* Floating Info Overlay Badge (Top Left) */}
      <div className="absolute top-3 left-3 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-md text-xs space-y-1 max-w-[320px]">
        <div className="flex items-center gap-2 font-black text-slate-900 dark:text-slate-100">
          <Truck className="w-4 h-4 text-orange-500" />
          <span>Lộ Trình Xe Vận Chuyển 60km/h</span>
          {trackingCode && (
            <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
              {trackingCode}
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <span>
            Quãng đường:{' '}
            <strong className="text-orange-600 dark:text-orange-400 font-black">
              {distanceKm !== null ? `${distanceKm} km` : '---'}
            </strong>
          </span>
          <span>•</span>
          <span>
            Thời gian lái (60km/h):{' '}
            <strong className="text-slate-800 dark:text-slate-200 font-bold">{durationText}</strong>
          </span>
        </div>
        {isRoutingOSRM && (
          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 pt-0.5">
            <Navigation className="w-3 h-3 animate-spin" /> Đang tính toán tuyến đường giao thông OSRM...
          </div>
        )}
      </div>

      {/* Legend Overlay Bottom Right */}
      <div className="absolute bottom-3 right-3 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Kho AP Sports
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Người Nhận
        </div>
        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-extrabold">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" /> Xe Xe Tải / Shipper
        </div>
      </div>

      {/* Inject Leaflet marker pulse animation CSS */}
      <style jsx global>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(0.6);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.35;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
