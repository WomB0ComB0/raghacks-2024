import { z } from 'zod';
import { create } from 'zustand';

const CoordinatesSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

const POISchema = z.object({
  query: z.string(),
  nearest_place: z.string(),
  address: z.string(),
});

type Coordinates = z.infer<typeof CoordinatesSchema>;
type POI = z.infer<typeof POISchema>;

interface AppState {
  coordinates: Coordinates | null;
  poi: POI | null;
  poiType: string;
  setCoordinates: (coordinates: Coordinates) => void;
  setPoi: (poi: POI) => void;
  setPoiType: (poiType: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  coordinates: null,
  poi: null,
  poiType: 'restaurant',
  setCoordinates: (coordinates) => set({ coordinates }),
  setPoi: (poi) => set({ poi }),
  setPoiType: (poiType) => set({ poiType }),
}));
