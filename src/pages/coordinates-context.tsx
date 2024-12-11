import React, { createContext, useState, useContext } from 'react';
import { LatLngExpression } from 'leaflet';

type CoordinatesContextType = {
  coordinates: LatLngExpression;
  setCoordinates: (coords: LatLngExpression) => void;
};

const CoordinatesContext = createContext<CoordinatesContextType | undefined>(undefined);

export const CoordinatesProvider = ({ children }: { children: React.ReactNode }) => {
  const [coordinates, setCoordinates] = useState<LatLngExpression>([52.633331, -1.133333]);

  return (
    <CoordinatesContext.Provider value={{ coordinates, setCoordinates }}>
      {children}
    </CoordinatesContext.Provider>
  );
};

export const useCoordinates = () => {
  const context = useContext(CoordinatesContext);
  if (context === undefined) {
    throw new Error('useCoordinates must be used within a CoordinatesProvider');
  }
  return context;
};