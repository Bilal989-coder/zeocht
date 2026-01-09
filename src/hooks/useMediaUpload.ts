import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useMediaUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFiles = async (
    files: File[],
    guideId: string,
    serviceId: string
  ): Promise<string[]> => {
    setUploading(true);
    setUploadProgress(0);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${guideId}/${serviceId}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('service-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error("Upload error:", error);
          throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('service-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);

        // Update progress
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      return uploadedUrls;
    } catch (error) {
      console.error("Error uploading files:", error);
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteFile = async (filePath: string): Promise<void> => {
    try {
      const { error } = await supabase.storage
        .from('service-images')
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  };

  const getPublicUrl = (filePath: string): string => {
    const { data: { publicUrl } } = supabase.storage
      .from('service-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  return {
    uploadFiles,
    deleteFile,
    getPublicUrl,
    uploading,
    uploadProgress,
  };
};
