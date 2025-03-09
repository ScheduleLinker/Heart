import { create } from "zustand";

type UploadStore = {
  uploadedData: any; 
  setUploadedData: (data: any) => void;
};

export const useUploadStore = create<UploadStore>((set) => ({
  uploadedData: null,
  setUploadedData: (data) => set({ uploadedData: data }),
}));