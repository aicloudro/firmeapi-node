/**
 * FirmeAPI Client
 *
 * Official Node.js client for FirmeAPI.ro
 */

import type {
  FirmeApiConfig,
  Company,
  Bilant,
  RestanteResponse,
  MofResponse,
  SearchFilters,
  SearchResponse,
  ApiResponse,
  ApiErrorResponse,
  FreeCompany,
  FreeApiUsage,
} from './types';

import {
  FirmeApiError,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  InsufficientCreditsError,
  ValidationError,
  ApiError,
  NetworkError,
  TimeoutError,
} from './errors';

const DEFAULT_BASE_URL = 'https://www.firmeapi.ro/api';
const DEFAULT_TIMEOUT = 30000;

export class FirmeApi {
  private readonly apiKey: string;
  private readonly sandbox: boolean;
  private readonly baseUrl: string;
  private readonly timeout: number;

  /**
   * Create a new FirmeAPI client
   *
   * @param config - Configuration options
   *
   * @example
   * ```typescript
   * const client = new FirmeApi({
   *   apiKey: 'your_api_key_here',
   *   sandbox: true // Enable sandbox mode for testing
   * });
   * ```
   */
  constructor(config: FirmeApiConfig) {
    if (!config.apiKey) {
      throw new ValidationError('API key is required', 'MISSING_API_KEY');
    }

    this.apiKey = config.apiKey;
    this.sandbox = config.sandbox ?? false;
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
  }

  /**
   * Get company details by CUI
   *
   * @param cui - The company's CUI (unique identification code)
   * @returns Company details
   *
   * @example
   * ```typescript
   * const company = await client.getCompany('12345678');
   * console.log(company.denumire);
   * ```
   */
  async getCompany(cui: string): Promise<Company> {
    const cleanCui = this.cleanCui(cui);
    const response = await this.request<ApiResponse<Company>>(`/v1/firma/${cleanCui}`);
    return response.data;
  }

  /**
   * Get company balance sheet (bilant) by CUI
   *
   * @param cui - The company's CUI
   * @returns Balance sheet data for multiple years
   *
   * @example
   * ```typescript
   * const bilant = await client.getBilant('12345678');
   * for (const year of bilant.ani) {
   *   console.log(`${year.an}: ${year.detalii.I1} RON cifra afaceri`);
   * }
   * ```
   */
  async getBilant(cui: string): Promise<Bilant> {
    const cleanCui = this.cleanCui(cui);
    const response = await this.request<ApiResponse<Bilant>>(`/v1/bilant/${cleanCui}`);
    return response.data;
  }

  /**
   * Get company ANAF debts (restante) by CUI
   *
   * @param cui - The company's CUI
   * @returns ANAF debt information
   *
   * @example
   * ```typescript
   * const restante = await client.getRestante('12345678');
   * if (restante.restante.length > 0) {
   *   console.log('Company has outstanding debts!');
   * }
   * ```
   */
  async getRestante(cui: string): Promise<RestanteResponse> {
    const cleanCui = this.cleanCui(cui);
    const response = await this.request<ApiResponse<RestanteResponse>>(`/v1/restante/${cleanCui}`);
    return response.data;
  }

  /**
   * Get company Monitorul Oficial publications by CUI
   *
   * @param cui - The company's CUI
   * @returns MOF publications
   *
   * @example
   * ```typescript
   * const mof = await client.getMof('12345678');
   * for (const pub of mof.rezultate) {
   *   console.log(`${pub.data}: ${pub.titlu_publicatie}`);
   * }
   * ```
   */
  async getMof(cui: string): Promise<MofResponse> {
    const cleanCui = this.cleanCui(cui);
    const response = await this.request<ApiResponse<MofResponse>>(`/v1/mof/${cleanCui}`);
    return response.data;
  }

  /**
   * Search companies with filters
   *
   * @param filters - Search filters
   * @returns Paginated list of companies
   *
   * @example
   * ```typescript
   * const results = await client.searchCompanies({
   *   judet: 'B',
   *   caen: '6201',
   *   tva: true,
   *   page: 1
   * });
   * console.log(`Found ${results.pagination.total} companies`);
   * ```
   */
  async searchCompanies(filters: SearchFilters = {}): Promise<SearchResponse> {
    const params = new URLSearchParams();

    if (filters.q) params.set('q', filters.q);
    if (filters.judet) params.set('judet', filters.judet);
    if (filters.localitate) params.set('localitate', filters.localitate);
    if (filters.caen) params.set('caen', filters.caen);
    if (filters.stare) params.set('stare', filters.stare);
    if (filters.data) params.set('data', filters.data);
    if (filters.data_start) params.set('data_start', filters.data_start);
    if (filters.data_end) params.set('data_end', filters.data_end);
    if (filters.tva !== undefined) params.set('tva', filters.tva ? '1' : '0');
    if (filters.telefon !== undefined) params.set('telefon', filters.telefon ? '1' : '0');
    if (filters.page) params.set('page', String(filters.page));

    const queryString = params.toString();
    const url = `/v1/firme${queryString ? `?${queryString}` : ''}`;

    const response = await this.request<ApiResponse<SearchResponse>>(url);
    return response.data;
  }

  /**
   * Get basic company info using the free API
   *
   * Requires a Free API Key (generated separately from dashboard).
   * Free API does not support sandbox mode.
   *
   * @param cui - The company's CUI
   * @returns Basic company information
   *
   * @example
   * ```typescript
   * const client = new FirmeApi({ apiKey: 'fa_xxxxxxxx' }); // Free API Key
   * const company = await client.getFreeCompany('12345678');
   * console.log(company.denumire);
   * ```
   */
  async getFreeCompany(cui: string): Promise<FreeCompany> {
    const cleanCui = this.cleanCui(cui);
    const response = await this.request<ApiResponse<FreeCompany>>(
      `/free/firma/${cleanCui}`,
      { isFreeApi: true }
    );
    return response.data;
  }

  /**
   * Get free API usage statistics
   *
   * Requires a Free API Key.
   *
   * @returns Usage information
   */
  async getFreeApiUsage(): Promise<FreeApiUsage> {
    const response = await this.request<ApiResponse<FreeApiUsage>>(
      '/free/usage',
      { isFreeApi: true }
    );
    return response.data;
  }

  /**
   * Clean and validate CUI
   */
  private cleanCui(cui: string): string {
    const cleaned = cui.replace(/[^0-9]/g, '');

    if (cleaned.length < 2 || cleaned.length > 10) {
      throw new ValidationError(
        'CUI must contain between 2 and 10 digits',
        'INVALID_CUI_FORMAT'
      );
    }

    return cleaned;
  }

  /**
   * Make HTTP request to the API
   */
  private async request<T>(
    endpoint: string,
    options: { isFreeApi?: boolean } = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'firmeapi-node/1.0.0',
    };

    // Always add auth header (both paid and free API require it)
    headers['X-API-KEY'] = this.apiKey;

    // Add sandbox header only for paid API (v1), not for free API
    if (this.sandbox && !options.isFreeApi) {
      headers['X-Sandbox'] = 'true';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        this.handleErrorResponse(response.status, data as ApiErrorResponse);
      }

      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof FirmeApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new TimeoutError(`Request timed out after ${this.timeout}ms`);
        }
        throw new NetworkError(error.message);
      }

      throw new NetworkError('An unknown error occurred');
    }
  }

  /**
   * Handle error response from API
   */
  private handleErrorResponse(statusCode: number, data: ApiErrorResponse): never {
    const message = data.message || data.error || 'Unknown error';
    const code = data.code || 'UNKNOWN_ERROR';

    switch (statusCode) {
      case 401:
        throw new AuthenticationError(message, code);

      case 403:
        if (code === 'CREDITS_EXHAUSTED' || code === 'MOF_INSUFFICIENT_CREDITS') {
          throw new InsufficientCreditsError(
            message,
            code,
            (data as any).available_credits ?? 0,
            (data as any).required_credits ?? 1
          );
        }
        throw new AuthenticationError(message, code);

      case 404:
        throw new NotFoundError(message, code);

      case 429:
        throw new RateLimitError(
          message,
          code,
          (data as any).retry_after ?? 1,
          (data as any).current_usage ?? 0,
          (data as any).limit ?? 0
        );

      case 400:
        throw new ValidationError(message, code);

      default:
        throw new ApiError(message, code, statusCode);
    }
  }
}

export default FirmeApi;
