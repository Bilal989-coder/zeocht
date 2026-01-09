import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Guide {
  id: string;
  full_name: string;
  avatar_url?: string;
  location: string;
  coordinates_lat: number;
  coordinates_lng: number;
  guide_title?: string;
  total_bookings?: number;
}

interface GuideMapProps {
  guides: Guide[];
  hoveredGuideId: string | null;
  onMarkerClick: (id: string) => void;
  center?: [number, number];
}

const GuideMap = ({ guides, hoveredGuideId, onMarkerClick, center }: GuideMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map
      const defaultCenter = center || [24.8607, 67.0011]; // Karachi as default
      const defaultZoom = center ? 11 : 2;

      const map = L.map('guide-map', {
        center: defaultCenter,
        zoom: defaultZoom,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    }

    // Update center if changed
    if (center && mapRef.current) {
      mapRef.current.setView(center, mapRef.current.getZoom());
    }

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add markers for each guide
    guides.forEach((guide) => {
      if (guide.coordinates_lat && guide.coordinates_lng) {
        const isHovered = hoveredGuideId === guide.id;
        const initial = guide.full_name?.charAt(0).toUpperCase() || "G";
        const avatarUrl = guide.avatar_url || "";

        // Create custom icon with guide avatar or initial
        const iconHtml = `
          <div class="guide-marker ${isHovered ? 'hovered' : ''}" style="
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: 3px solid ${isHovered ? 'hsl(var(--primary))' : '#e5e7eb'};
            background: ${avatarUrl ? `url(${avatarUrl})` : 'hsl(var(--muted))'};
            background-size: cover;
            background-position: center;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,${isHovered ? '0.3' : '0.2'});
            transition: all 0.2s ease;
            font-weight: 600;
            font-size: 18px;
            color: hsl(var(--foreground));
            transform: ${isHovered ? 'scale(1.1)' : 'scale(1)'};
          ">
            ${!avatarUrl ? initial : ''}
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-guide-marker',
          iconSize: [48, 48],
          iconAnchor: [24, 24],
        });

        const marker = L.marker([guide.coordinates_lat, guide.coordinates_lng], {
          icon: customIcon,
        }).addTo(mapRef.current!);

        // Add popup
        const popupContent = `
          <div style="text-align: center; min-width: 150px;">
            <p style="font-weight: 600; margin-bottom: 4px;">${guide.full_name}</p>
            ${guide.guide_title ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">${guide.guide_title}</p>` : ''}
            <p style="font-size: 12px; color: #6b7280; margin-top: 4px;">${guide.location}</p>
            ${guide.total_bookings !== undefined ? `<p style="font-size: 12px; font-weight: 500; margin-top: 4px;">${guide.total_bookings} bookings</p>` : ''}
          </div>
        `;
        marker.bindPopup(popupContent);

        marker.on('click', () => {
          onMarkerClick(guide.id);
        });

        markersRef.current[guide.id] = marker;
      }
    });

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [guides, hoveredGuideId, onMarkerClick, center]);

  if (guides.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/20 rounded-xl">
        <p className="text-muted-foreground">No guide locations available</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div id="guide-map" className="h-full w-full rounded-xl" />
      <style>{`
        .leaflet-container {
          font-family: inherit;
        }
        .custom-guide-marker {
          background: transparent !important;
          border: none !important;
        }
        .guide-marker:hover {
          border-color: hsl(var(--primary)) !important;
          transform: scale(1.1) !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
        }
        .leaflet-control-zoom a {
          border: none !important;
          font-size: 18px !important;
          line-height: 30px !important;
          width: 30px !important;
          height: 30px !important;
        }
      `}</style>
    </div>
  );
};

export default GuideMap;
