import { getToken } from "./utils";

interface RequestOptions extends RequestInit {
  url: string;
  data?: any;
  headers?: HeadersInit;
}

export const request = async <T>(options: RequestOptions): Promise<{ data: T; status: number }> => {
  const headers = new Headers({
    "Content-Type": "application/json",
    ...options.headers, // Merge custom headers if provided
  });

  const token = await getToken();
  if (token) {
    headers.append("Authorization", "Bearer " + token);
  }

  const finalOptions: RequestInit = {
    ...options,
    headers: headers,
    body: options.data instanceof FormData ? options.data : JSON.stringify(options.data),
  };

  const response = await fetch(options.url, finalOptions);

  let data: T | null = null;
  try {
    data = await response.json();
  } catch (error) {
    if (response.status !== 204 && response.status !== 200) {
      throw { error: "Invalid JSON response", status: response.status };
    }
  }

  if (!response.ok) {
    throw { data, status: response.status };
  }

  return { data: data as T, status: response.status };
};