import { ApiError } from '@/helpers/api-error';

export default function(context, inject) {
  class Http {
    get ssrToken() {
      return context.app?.ssrToken;
    }

    get baseUrl() {
      return context.$config.siteUrl;
    }

    get defaultOptions() {
      return {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.ssrToken
            ? `Bearer ${this.ssrToken}`
            : undefined,
        },
      };
    }

    async request(method, path, options = {}) {
      const url = new URL(path, this.baseUrl).toString();

      const response = await fetch(url, {
        method,
        ...this.defaultOptions,
        ...options,
      });

      const json = await response.json();

      if (json?.error) {
        throw new ApiError(json.error);
      }

      return json;
    }

    get(path, options = {}) {
      return this.request('GET', path, options);
    }

    post(path, body = {}) {
      return this.request('POST', path, {
        body: JSON.stringify(body),
      });
    }

    put(path, body = {}) {
      return this.request('PUT', path, {
        body: JSON.stringify(body),
      });
    }

    delete(path) {
      return this.request('DELETE', path);
    }
  }

  inject('http', new Http());
}
