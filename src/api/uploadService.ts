import { IMAGE_SERVICE_URL } from '../commons/constants';
import { getToken } from '../utils/utils';

export const uploadImage = async (uri: string, fileName: string, mimeType: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: fileName,
      type: mimeType,
    } as any);
    const token = await getToken();

    const response = await fetch(
      `${IMAGE_SERVICE_URL}/upload`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
        },
        body: formData,
      }
    );
  
    const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Upload failed: ${responseText}`);
  }

  return JSON.parse(responseText);
  };
  
  