import { create } from 'zustand';

export const useStore = create((set) => ({
  // Authentication state
  user: null,
  setUser: (user) => set({ user }),
  
  // Missing persons reports
  missingPersons: [],
  addMissingPerson: (person) => 
    set((state) => ({ 
      missingPersons: [...state.missingPersons, person] 
    })),
  
  // Sightings reports
  sightings: [],
  addSighting: (sighting) =>
    set((state) => ({
      sightings: [...state.sightings, sighting]
    })),
  
  // Aadhar data (fake)
  aadharData: [],
  setAadharData: (data) => set({ aadharData: data }),
}));