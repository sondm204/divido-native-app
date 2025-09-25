import * as SecureStore from 'expo-secure-store';

// Store token
export const storeToken = async (token: string) => {
  try {
    await SecureStore.setItemAsync('accessToken', token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

// Retrieve token
export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync('accessToken');
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

// Remove token
export const removeToken = async () => {
  try {
    await SecureStore.deleteItemAsync('accessToken');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};