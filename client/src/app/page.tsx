'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DOMPurify from 'dompurify';
import {
  AlertTriangle,
  ChevronDown,
  Coffee,
  Copy,
  ExternalLink,
  Loader2,
  MapPin,
  RefreshCw,
  Trees as Tree,
  Utensils,
} from 'lucide-react';
import { marked } from 'marked';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

const API_URL = 'https://raghacks-api.vercel.app';

const coordinatesSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

const poiSchema = z.object({
  query: z.string(),
  nearest_place: z.string(),
  address: z.string(),
});

export default function ProximityFinder() {
  const [poiType, setPoiType] = useState<string>('cafe');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
          toast.error("Failed to get your location. Using default location.");
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      toast.error("Geolocation is not supported. Using default location.");
    }
  }, []);

  const {
    data: poi,
    error: poiError,
    isLoading: isLoadingPoi,
  } = useQuery({
    queryKey: ['poi', poiType, userLocation],
    queryFn: async () => {
      if (!userLocation) return null;
      const response = await fetch(
        `${API_URL}/poi/?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&poi_type=${poiType}`,
      );
      const data = await response.json();
      return poiSchema.parse(data);
    },
    enabled: !!userLocation,
  });

  const isLoading = !userLocation || isLoadingPoi;
  const error = poiError;

  const getPoiIcon = (type: string) => {
    switch (type) {
      case 'restaurant':
        return <Utensils className="w-5 h-5 mr-2" />;
      case 'cafe':
        return <Coffee className="w-5 h-5 mr-2" />;
      case 'park':
        return <Tree className="w-5 h-5 mr-2" />;
      default:
        return <MapPin className="w-5 h-5 mr-2" />;
    }
  };

  const handlePoiTypeChange = (value: string) => {
    setPoiType(value);
    queryClient.invalidateQueries({ queryKey: ['poi'] });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success('Copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        toast.error('Failed to copy');
      });
  };

  const getBingMapsLink = (latitude: number, longitude: number) => {
    return `https://www.bing.com/maps?cp=${latitude}~${longitude}&lvl=15&style=r`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#07073A] text-white">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-4xl font-bold text-center text-[#32A8C3]">ProximityFinder</h1>
        <p className="mb-6 text-center text-gray-300">
          Discover nearby points of interest
        </p>
        <Select value={poiType} onValueChange={handlePoiTypeChange}>
          <SelectTrigger className="flex items-center justify-between w-full h-12 px-4 bg-[#32A8C3] text-white border-none rounded-md [&>span]:text-white ">
            <SelectValue placeholder="Select a POI type" />
          </SelectTrigger>
          <SelectContent className="bg-[#07073A] border border-[#32A8C3] text-white">
            <SelectItem value="restaurant">
              <div className="flex items-center">
                {getPoiIcon('restaurant')}
                Restaurant
              </div>
            </SelectItem>
            <SelectItem value="cafe">
              <div className="flex items-center">
                {getPoiIcon('cafe')}
                Cafe
              </div>
            </SelectItem>
            <SelectItem value="park">
              <div className="flex items-center">
                {getPoiIcon('park')}
                Park
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Alert variant="destructive" className="w-full max-w-md mt-4">
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{(error as Error).message}</AlertDescription>
          <Button variant="outline" size="sm" onClick={() => {
            setUserLocation(null);
            queryClient.invalidateQueries({ queryKey: ['poi'] });
          }} className="mt-2">
            <RefreshCw className="w-4 h-4 mr-2" /> Retry
          </Button>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-[#32A8C3] animate-spin" />
        </div>
      ) : (
        <>
          {userLocation && (
            <div className="w-full max-w-md mt-6">
              <h2 className="flex items-center mb-2 text-xl font-semibold text-[#32A8C3]">
                <MapPin className="w-5 h-5 mr-2" />
                Your Location
              </h2>
              <p className="flex items-center justify-between text-lg">
                <span>
                  {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                </span>
                <span className="flex">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`,
                      )
                    }
                    className="mr-2 text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      window.open(
                        getBingMapsLink(userLocation.latitude, userLocation.longitude),
                        '_blank',
                      )
                    }
                    className="text-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </span>
              </p>
            </div>
          )}

          {poi && (
            <div className="w-full max-w-md mt-6">
              <h2 className="flex items-center mb-2 text-xl font-semibold text-[#32A8C3]">
                {getPoiIcon(poiType)}
                Nearest {poiType.charAt(0).toUpperCase() + poiType.slice(1)}
              </h2>
              <p className="mb-2 text-2xl font-bold text-white">{poi.nearest_place}</p>
              <p className="mb-2 text-gray-300">{poi.address}</p>
              <p className="text-sm text-gray-400">
                Query:{' '}
                <span
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(poi.query)) }}
                />
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}