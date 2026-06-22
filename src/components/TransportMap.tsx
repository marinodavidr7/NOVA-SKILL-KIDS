'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from './ui/button';
import { Upload } from 'lucide-react';
import { kml } from '@tmcw/togeojson';

// Fix for default markers in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapCenterer({ geoData }: { geoData: any }) {
  const map = useMap();
  useEffect(() => {
    if (geoData) {
      try {
        const bounds = L.geoJSON(geoData).getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [30, 30] });
        }
      } catch(e) {
        console.error("Error calculating bounds:", e);
      }
    }
  }, [geoData, map]);
  return null;
}

export default function TransportMap() {
  const [geoData, setGeoData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    try {
      const text = await file.text();
      // We parse the XML directly
      const parser = new DOMParser();
      const dom = parser.parseFromString(text, 'text/xml');
      
      if (dom.documentElement.nodeName === 'parsererror') {
        throw new Error('El archivo no es un XML o KML válido.');
      }

      const converted = kml(dom);
      
      if (!converted || !converted.features || converted.features.length === 0) {
        throw new Error('No se encontraron rutas o puntos en el archivo KML.');
      }
      
      setGeoData(converted);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al procesar el archivo KML.');
      setGeoData(null);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800">Visualizador de Rutas Geográficas</h3>
          <p className="text-sm text-slate-500">Sube un archivo KML exportado de Google Earth o Maps.</p>
        </div>
        <div>
          <input 
            type="file" 
            accept=".kml" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            Cargar archivo .KML
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm border border-rose-200">
          <p className="font-bold mb-1">Error al procesar el mapa</p>
          {error}
        </div>
      )}

      <div className="w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner relative" style={{ height: '500px' }}>
        <MapContainer 
          center={[18.4861, -69.9312]} // SDQ default center
          zoom={12} 
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {geoData && (
            <>
              <GeoJSON 
                key={JSON.stringify(geoData)} 
                data={geoData} 
                style={(feature) => {
                  return {
                    color: feature?.properties?.stroke || '#4f46e5',
                    weight: feature?.properties?.['stroke-width'] || 5,
                    opacity: feature?.properties?.['stroke-opacity'] || 0.8,
                    fillColor: feature?.properties?.fill || '#4f46e5',
                    fillOpacity: feature?.properties?.['fill-opacity'] || 0.2
                  };
                }}
              />
              <MapCenterer geoData={geoData} />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
