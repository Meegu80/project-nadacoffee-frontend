import api from "./axios.ts";
import type { UploadResponse } from "../types/upload.ts";

export const uploadImage = async (file: File, folder: string) => {
   const formData = new FormData();
   formData.append("file", file);
   formData.append("folder", folder);

   const response = await api.post<UploadResponse>("/uploads", formData, {
      headers: {
         "Content-Type": "multipart/form-data",
      },
   });
   return response.data.url;
};