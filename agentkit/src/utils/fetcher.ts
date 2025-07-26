import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { OneInchError } from '../core/types';

/**
 * HTTP client for 1inch API calls with retry logic and error handling
 */
export class OneInchFetcher {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string, baseURL: string = 'https://api.1inch.dev') {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.data) {
          const oneInchError: OneInchError = {
            statusCode: error.response.status,
            error: error.response.data.error || 'Unknown error',
            description: error.response.data.description || 'No description provided',
            requestId: error.response.data.requestId || 'No request ID',
          };
          throw new Error(`1inch API Error: ${oneInchError.error} - ${oneInchError.description} (Request ID: ${oneInchError.requestId})`);
        }
        throw error;
      }
    );
  }

  /**
   * Make a GET request to the 1inch API
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make a POST request to the 1inch API
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle and format errors
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return new Error('Invalid 1inch API key');
      }
      if (error.response?.status === 429) {
        return new Error('Rate limit exceeded. Please try again later.');
      }
      if (error.response?.status && error.response.status >= 500) {
        return new Error('1inch API server error. Please try again later.');
      }
      return new Error(`HTTP Error: ${error.response?.status} - ${error.message}`);
    }
    return error;
  }

  /**
   * Get the underlying axios instance for advanced usage
   */
  getClient(): AxiosInstance {
    return this.client;
  }
} 