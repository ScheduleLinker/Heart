import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to handle the file upload and returns the data to what components needs it
export const FileUploadHandler = async (isFileArray:File | File[]) => {
  const API_URL = import.meta.env.VITE_BACKEND_URL;
  
  
  if(!isFileArray) {
    alert('No File(s) Provided');
    return;
  }
 
  const formData = new FormData();
  if (Array.isArray(isFileArray)) {
    //handle the array 
    for (let fileIndex = 0; fileIndex < isFileArray.length; fileIndex++) {
      formData.append("ics_file", isFileArray[fileIndex]);
    }
  }else {
    formData.append("ics_file", isFileArray);
  }
  try {
    const response = await fetch(`${API_URL}/api/ics-upload`, { 
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    alert(`${data.message}`);
    return data;
  } catch (error) {
    console.error("Upload Error: ", error);
    alert("Failed to upload the file. Please try again.");
  }
};
