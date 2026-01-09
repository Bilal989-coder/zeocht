import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Experience {
  id: string;
  title: string;
  location: string;
  price: number;
  coordinates: { lat: number; lng: number };
}

interface ExperienceMapProps {
  experiences: Experience[];
  hoveredExperienceId: string | null;
  onMarkerClick: (id: string) => void;
  className?: string;
}

const ExperienceMap = ({ experiences, hoveredExperienceId, onMarkerClick }: ExperienceMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map
      const map = L.map('experience-map', {
        center: [25, 15],
        zoom: 2,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    }

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add markers for each experience
    experiences.forEach((exp) => {
      if (exp.coordinates) {
        // Create custom icon with price
        const isHovered = hoveredExperienceId === exp.id;
        const iconHtml = `
          <div class="price-marker ${isHovered ? 'hovered' : ''}" style="
            background: ${isHovered ? 'hsl(var(--primary))' : 'white'};
            color: ${isHovered ? 'white' : 'black'};
            padding: 8px 12px;
            border-radius: 24px;
            font-weight: 600;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            border: ${isHovered ? '2px solid hsl(var(--primary))' : '1px solid rgba(0,0,0,0.08)'};
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.2s ease;
            transform: ${isHovered ? 'scale(1.1)' : 'scale(1)'};
            z-index: ${isHovered ? '1000' : '500'};
          ">
            $${exp.price}
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-marker',
          iconSize: [60, 36],
          iconAnchor: [30, 18],
        });

        const marker = L.marker([exp.coordinates.lat, exp.coordinates.lng], {
          icon: customIcon,
        }).addTo(mapRef.current!);

        marker.on('click', () => {
          onMarkerClick(exp.id);
        });

        markersRef.current[exp.id] = marker;
      }
    });

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [experiences, hoveredExperienceId, onMarkerClick]);

  return (
    <div className="relative h-full w-full">
      <div id="experience-map" className="h-full w-full rounded-l-xl" />
      <style>{`
        .leaflet-container {
          font-family: inherit;
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .price-marker:hover {
          background: hsl(var(--primary)) !important;
          color: white !important;
          transform: scale(1.1) !important;
          z-index: 1000 !important;
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

export default ExperienceMap;
