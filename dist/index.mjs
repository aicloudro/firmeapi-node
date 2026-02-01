// src/errors/index.ts
var FirmeApiError = class _FirmeApiError extends Error {
  code;
  statusCode;
  constructor(message, code, statusCode = 500) {
    super(message);
    this.name = "FirmeApiError";
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, _FirmeApiError.prototype);
  }
};
var AuthenticationError = class _AuthenticationError extends FirmeApiError {
  constructor(message, code = "AUTH_ERROR") {
    super(message, code, 401);
    this.name = "AuthenticationError";
    Object.setPrototypeOf(this, _AuthenticationError.prototype);
  }
};
var NotFoundError = class _NotFoundError extends FirmeApiError {
  constructor(message, code = "NOT_FOUND") {
    super(message, code, 404);
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, _NotFoundError.prototype);
  }
};
var RateLimitError = class _RateLimitError extends FirmeApiError {
  retryAfter;
  currentUsage;
  limit;
  constructor(message, code = "RATE_LIMIT_EXCEEDED", retryAfter = 1, currentUsage = 0, limit = 0) {
    super(message, code, 429);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
    this.currentUsage = currentUsage;
    this.limit = limit;
    Object.setPrototypeOf(this, _RateLimitError.prototype);
  }
};
var InsufficientCreditsError = class _InsufficientCreditsError extends FirmeApiError {
  availableCredits;
  requiredCredits;
  constructor(message, code = "CREDITS_EXHAUSTED", availableCredits = 0, requiredCredits = 1) {
    super(message, code, 403);
    this.name = "InsufficientCreditsError";
    this.availableCredits = availableCredits;
    this.requiredCredits = requiredCredits;
    Object.setPrototypeOf(this, _InsufficientCreditsError.prototype);
  }
};
var ValidationError = class _ValidationError extends FirmeApiError {
  constructor(message, code = "VALIDATION_ERROR") {
    super(message, code, 400);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, _ValidationError.prototype);
  }
};
var ApiError = class _ApiError extends FirmeApiError {
  constructor(message, code = "API_ERROR", statusCode = 500) {
    super(message, code, statusCode);
    this.name = "ApiError";
    Object.setPrototypeOf(this, _ApiError.prototype);
  }
};
var NetworkError = class _NetworkError extends FirmeApiError {
  constructor(message = "Network request failed") {
    super(message, "NETWORK_ERROR", 0);
    this.name = "NetworkError";
    Object.setPrototypeOf(this, _NetworkError.prototype);
  }
};
var TimeoutError = class _TimeoutError extends FirmeApiError {
  constructor(message = "Request timed out") {
    super(message, "TIMEOUT", 0);
    this.name = "TimeoutError";
    Object.setPrototypeOf(this, _TimeoutError.prototype);
  }
};

// src/client.ts
var DEFAULT_BASE_URL = "https://www.firmeapi.ro/api";
var DEFAULT_TIMEOUT = 3e4;
var FirmeApi = class {
  apiKey;
  sandbox;
  baseUrl;
  timeout;
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
  constructor(config) {
    if (!config.apiKey) {
      throw new ValidationError("API key is required", "MISSING_API_KEY");
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
  async getCompany(cui) {
    const cleanCui = this.cleanCui(cui);
    const response = await this.request(`/v1/firma/${cleanCui}`);
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
  async getBilant(cui) {
    const cleanCui = this.cleanCui(cui);
    const response = await this.request(`/v1/bilant/${cleanCui}`);
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
  async getRestante(cui) {
    const cleanCui = this.cleanCui(cui);
    const response = await this.request(`/v1/restante/${cleanCui}`);
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
  async getMof(cui) {
    const cleanCui = this.cleanCui(cui);
    const response = await this.request(`/v1/mof/${cleanCui}`);
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
  async searchCompanies(filters = {}) {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.judet) params.set("judet", filters.judet);
    if (filters.localitate) params.set("localitate", filters.localitate);
    if (filters.caen) params.set("caen", filters.caen);
    if (filters.stare) params.set("stare", filters.stare);
    if (filters.data) params.set("data", filters.data);
    if (filters.data_start) params.set("data_start", filters.data_start);
    if (filters.data_end) params.set("data_end", filters.data_end);
    if (filters.tva !== void 0) params.set("tva", filters.tva ? "1" : "0");
    if (filters.telefon !== void 0) params.set("telefon", filters.telefon ? "1" : "0");
    if (filters.page) params.set("page", String(filters.page));
    const queryString = params.toString();
    const url = `/v1/firme${queryString ? `?${queryString}` : ""}`;
    const response = await this.request(url);
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
  async getFreeCompany(cui) {
    const cleanCui = this.cleanCui(cui);
    const response = await this.request(
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
  async getFreeApiUsage() {
    const response = await this.request(
      "/free/usage",
      { isFreeApi: true }
    );
    return response.data;
  }
  /**
   * Clean and validate CUI
   */
  cleanCui(cui) {
    const cleaned = cui.replace(/[^0-9]/g, "");
    if (cleaned.length < 2 || cleaned.length > 10) {
      throw new ValidationError(
        "CUI must contain between 2 and 10 digits",
        "INVALID_CUI_FORMAT"
      );
    }
    return cleaned;
  }
  /**
   * Make HTTP request to the API
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "firmeapi-node/1.0.0"
    };
    headers["X-API-KEY"] = this.apiKey;
    if (this.sandbox && !options.isFreeApi) {
      headers["X-Sandbox"] = "true";
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) {
        this.handleErrorResponse(response.status, data);
      }
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof FirmeApiError) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new TimeoutError(`Request timed out after ${this.timeout}ms`);
        }
        throw new NetworkError(error.message);
      }
      throw new NetworkError("An unknown error occurred");
    }
  }
  /**
   * Handle error response from API
   */
  handleErrorResponse(statusCode, data) {
    const message = data.message || data.error || "Unknown error";
    const code = data.code || "UNKNOWN_ERROR";
    switch (statusCode) {
      case 401:
        throw new AuthenticationError(message, code);
      case 403:
        if (code === "CREDITS_EXHAUSTED" || code === "MOF_INSUFFICIENT_CREDITS") {
          throw new InsufficientCreditsError(
            message,
            code,
            data.available_credits ?? 0,
            data.required_credits ?? 1
          );
        }
        throw new AuthenticationError(message, code);
      case 404:
        throw new NotFoundError(message, code);
      case 429:
        throw new RateLimitError(
          message,
          code,
          data.retry_after ?? 1,
          data.current_usage ?? 0,
          data.limit ?? 0
        );
      case 400:
        throw new ValidationError(message, code);
      default:
        throw new ApiError(message, code, statusCode);
    }
  }
};
export {
  ApiError,
  AuthenticationError,
  FirmeApi,
  FirmeApiError,
  InsufficientCreditsError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  TimeoutError,
  ValidationError,
  FirmeApi as default
};
//# sourceMappingURL=index.mjs.map