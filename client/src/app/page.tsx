'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Trees as Tree } from 'lucide-react'
import { Loader2, MapPin, AlertTriangle, RefreshCw, Coffee, Utensils } from "lucide-react"

const API_URL = 'https://raghacks-api.vercel.app'

const coordinatesSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
})

const poiSchema = z.object({
  query: z.string(),
  nearest_place: z.string(),
  address: z.string(),
})

export default function ProximityFinder() {
  const [poiType, setPoiType] = useState<string>('restaurant')
  const queryClient = useQueryClient()

  const { data: coordinates, error: coordinatesError, isLoading: isLoadingCoordinates, refetch: refetchCoordinates } = useQuery({
    queryKey: ['coordinates'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/coordinates/`)
      const data = await response.json()
      return coordinatesSchema.parse(data)
    },
  })

  const { data: poi, error: poiError, isLoading: isLoadingPoi } = useQuery({
    queryKey: ['poi', poiType, coordinates],
    queryFn: async () => {
      if (!coordinates) return null
      const response = await fetch(`${API_URL}/poi/?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&poi_type=${poiType}`)
      const data = await response.json()
      return poiSchema.parse(data)
    },
    enabled: !!coordinates,
  })

  const isLoading = isLoadingCoordinates || isLoadingPoi
  const error = coordinatesError || poiError

  const getPoiIcon = (type: string) => {
    switch (type) {
      case 'restaurant':
        return <Utensils className="w-6 h-6 mr-2" />
      case 'cafe':
        return <Coffee className="w-6 h-6 mr-2" />
      case 'park':
        return <Tree className="w-6 h-6 mr-2" />
      default:
        return <MapPin className="w-6 h-6 mr-2" />
    }
  }

  const handlePoiTypeChange = (value: string) => {
    setPoiType(value)
    queryClient.invalidateQueries({ queryKey: ['poi'] })
  }

  return (
    <div className="container max-w-md px-4 py-8 mx-auto">
      <Card className="bg-secondary text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">ProximityFinder</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-center">Discover nearby points of interest</p>
          <Select value={poiType} onValueChange={handlePoiTypeChange}>
            <SelectTrigger className="w-full bg-primary text-primary-foreground">
              <SelectValue placeholder="Select a POI type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="restaurant">Restaurant</SelectItem>
              <SelectItem value="cafe">Cafe</SelectItem>
              <SelectItem value="park">Park</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{(error as Error).message}</AlertDescription>
          <Button variant="outline" size="sm" onClick={() => refetchCoordinates()} className="mt-2">
            <RefreshCw className="w-4 h-4 mr-2" /> Retry
          </Button>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          {coordinates && (
            <Card className="mt-4 bg-background text-foreground">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-primary" />
                  Your Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
                </p>
              </CardContent>
            </Card>
          )}

          {poi && (
            <Card className="mt-4 bg-background text-foreground">
              <CardHeader>
                <CardTitle className="flex items-center">
                  {getPoiIcon(poiType)}
                  Nearest {poiType.charAt(0).toUpperCase() + poiType.slice(1)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-xl font-semibold">{poi.nearest_place}</p>
                <p className="mb-2 text-sm text-muted-foreground">{poi.address}</p>
                <p className="text-sm text-muted-foreground">Query: {poi.query}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}