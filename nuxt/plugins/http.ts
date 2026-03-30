import type { Plugin } from '@nuxt/types';

import { ApiError } from '@/helpers/api-error';
import type { ApiErrorPayload } from '@/helpers/api-error';

type ApiErrorEnvelope = {
  error: ApiErrorPayload;
};

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const plugin: Plugin = (context, inject) => {
  type AppWithSsrToken = {
    ssrToken?: string;
  };

  type ContextWithConfig = {
    $config: {
      siteUrl: string;
    };
  };

  class Http {
    private get ssrToken(): string | undefined {
      return (context.app as unknown as AppWithSsrToken).ssrToken;
    }

    private get baseUrl(): string {
      return (context as unknown as ContextWithConfig).$config.siteUrl;
    }

    private get defaultOptions(): RequestInit {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.ssrToken) {
        headers.Authorization = `Bearer ${this.ssrToken}`;
      }

      return {
        credentials: 'include',
        headers,
      };
    }

    async request<T = unknown>(method: HttpMethod, path: string, options: RequestInit = {}): Promise<T> {
      const url = new URL(path, this.baseUrl).toString();

      const response = await fetch(url, {
        method,
        ...this.defaultOptions,
        ...options,
      });

      const json = (await response.json()) as T | ApiErrorEnvelope;

      if ((json as ApiErrorEnvelope | undefined)?.error) {
        throw new ApiError((json as ApiErrorEnvelope).error);
      }

      return json as T;
    }

    get<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
      return this.request<T>('GET', path, options);
    }

    post<T = unknown>(path: string, body: unknown = {}): Promise<T> {
      return this.request<T>('POST', path, {
        body: JSON.stringify(body),
      });
    }

    put<T = unknown>(path: string, body: unknown = {}): Promise<T> {
      return this.request<T>('PUT', path, {
        body: JSON.stringify(body),
      });
    }

    delete<T = unknown>(path: string): Promise<T> {
      return this.request<T>('DELETE', path);
    }
  }

  inject('http', new Http());
};

export default plugin;
