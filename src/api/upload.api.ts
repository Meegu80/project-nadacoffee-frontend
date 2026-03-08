import axios from 'axios';

/**
 * 이미지 업로드 API
 * - Endpoint: /api/uploads
 * - Method: POST
 * - Body: FormData (file, folder)
 * - Header: Authorization (Bearer token), x-client-key
 */
export const uploadImage = async (file: File, folder: string) => {
   const formData = new FormData();
   
   // [중요] 파일 이름에 한글/특수문자가 있을 경우 서버에서 파싱 에러(500)가 발생할 수 있음
   // 안전한 파일 이름으로 업로드 시도
   const extension = file.name.split('.').pop();
   const safeName = `upload_${Date.now()}.${extension}`;
   formData.append("file", file, safeName);
   formData.append("folder", folder);

   const storage = localStorage.getItem("auth-storage");
   let token = "";
   if (storage) {
      try {
         const parsed = JSON.parse(storage);
         token = parsed.state?.token;
      } catch (e) {
         console.error("Token access error:", e);
      }
   }

   const response = await axios.post("/api/uploads", formData, {
      headers: {
         "Authorization": `Bearer ${token}`,
         "x-client-key": import.meta.env.VITE_API_CLIENT_KEY, // 인증 키 추가
      },
   });

   console.log("📤 [Upload Success]", response.data);
   return response.data.url;
};