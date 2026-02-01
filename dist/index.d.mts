/**
 * FirmeAPI TypeScript Type Definitions
 */
interface FirmeApiConfig {
    /** Your FirmeAPI API key */
    apiKey: string;
    /** Enable sandbox mode for testing (default: false) */
    sandbox?: boolean;
    /** Base URL override (default: https://www.firmeapi.ro/api) */
    baseUrl?: string;
    /** Request timeout in milliseconds (default: 30000) */
    timeout?: number;
}
interface Address {
    strada: string | null;
    numar: string | null;
    localitate: string | null;
    judet: string | null;
    cod_judet: string | null;
    cod_postal: string | null;
    detalii: string | null;
}
interface TvaPeriod {
    data_inceput: string | null;
    data_sfarsit: string | null;
    data_anul_fiscal: string | null;
    mesaj_scpTVA: string | null;
}
interface TvaInfo {
    platitor: boolean;
    perioade: TvaPeriod[];
}
interface StatusInactiv {
    inactiv: boolean;
    data_inactivare: string | null;
    data_reactivare: string | null;
    data_radiere: string | null;
}
interface Company {
    cui: number;
    denumire: string;
    data_inregistrare: string | null;
    stare: string | null;
    cod_caen: string | null;
    nr_reg_com: string | null;
    telefon: string | null;
    fax: string | null;
    cod_postal: string | null;
    adresa_sediu_social?: Address;
    adresa_domiciliu_fiscal?: Address | null;
    tva: TvaInfo;
    status_inactiv: StatusInactiv;
    organ_fiscal: string | null;
    forma_organizare: string | null;
}
interface BilantDetalii {
    I1?: number;
    I2?: number;
    I3?: number;
    I4?: number;
    I5?: number;
    I6?: number;
    I7?: number;
    I8?: number;
    I9?: number;
    I10?: number;
    [key: string]: number | undefined;
}
interface BilantYear {
    an: number;
    cui: number;
    denumire: string;
    caen: string;
    denumire_caen: string;
    detalii: BilantDetalii;
}
interface Bilant {
    cui: number;
    ani: BilantYear[];
}
interface Restanta {
    tip_obligatie: string;
    suma_restanta: number;
    data_obligatie: string;
    stare: string;
}
interface RestanteResponse {
    cui: number;
    restante: Restanta[];
}
interface MofPublication {
    denumire: string;
    publicatieNr: string;
    data: string;
    titlu_publicatie: string;
    continut: string;
}
interface MofResponse {
    cui: number;
    rezultate: MofPublication[];
}
interface SearchFilters {
    /** Search term (company name, CUI, registration number) */
    q?: string;
    /** County code (e.g., 'BV', 'CJ', 'B') */
    judet?: string;
    /** City/locality name */
    localitate?: string;
    /** CAEN code */
    caen?: string;
    /** Registration status (e.g., 'INREGISTRAT', 'RADIAT') */
    stare?: string;
    /** Exact registration date (YYYY-MM-DD) */
    data?: string;
    /** Registration date from (YYYY-MM-DD) */
    data_start?: string;
    /** Registration date to (YYYY-MM-DD) */
    data_end?: string;
    /** VAT payer filter (true/false) */
    tva?: boolean;
    /** Has phone number filter (true/false) */
    telefon?: boolean;
    /** Page number (default: 1) */
    page?: number;
}
interface Pagination {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}
interface SearchResponse {
    items: Company[];
    pagination: Pagination;
}
interface ApiResponse<T> {
    success: boolean;
    data: T;
    sandbox?: boolean;
}
interface ApiErrorResponse {
    success: false;
    error: string;
    code: string;
    message: string;
    sandbox?: boolean;
}
interface FreeCompany {
    cui: number;
    denumire: string;
    adresa: string | null;
    telefon: string | null;
    cod_caen: string | null;
    stare: string | null;
    judet: string | null;
    localitate: string | null;
}
interface FreeApiUsage {
    requests_today: number;
    requests_limit: number;
    reset_at: string;
}

/**
 * FirmeAPI Client
 *
 * Official Node.js client for FirmeAPI.ro
 */

declare class FirmeApi {
    private readonly apiKey;
    private readonly sandbox;
    private readonly baseUrl;
    private readonly timeout;
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
    constructor(config: FirmeApiConfig);
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
    getCompany(cui: string): Promise<Company>;
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
    getBilant(cui: string): Promise<Bilant>;
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
    getRestante(cui: string): Promise<RestanteResponse>;
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
    getMof(cui: string): Promise<MofResponse>;
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
    searchCompanies(filters?: SearchFilters): Promise<SearchResponse>;
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
    getFreeCompany(cui: string): Promise<FreeCompany>;
    /**
     * Get free API usage statistics
     *
     * Requires a Free API Key.
     *
     * @returns Usage information
     */
    getFreeApiUsage(): Promise<FreeApiUsage>;
    /**
     * Clean and validate CUI
     */
    private cleanCui;
    /**
     * Make HTTP request to the API
     */
    private request;
    /**
     * Handle error response from API
     */
    private handleErrorResponse;
}

/**
 * FirmeAPI Error Classes
 */
/**
 * Base error class for all FirmeAPI errors
 */
declare class FirmeApiError extends Error {
    readonly code: string;
    readonly statusCode: number;
    constructor(message: string, code: string, statusCode?: number);
}
/**
 * Thrown when authentication fails (invalid or missing API key)
 */
declare class AuthenticationError extends FirmeApiError {
    constructor(message: string, code?: string);
}
/**
 * Thrown when a resource is not found
 */
declare class NotFoundError extends FirmeApiError {
    constructor(message: string, code?: string);
}
/**
 * Thrown when rate limit is exceeded
 */
declare class RateLimitError extends FirmeApiError {
    readonly retryAfter: number;
    readonly currentUsage: number;
    readonly limit: number;
    constructor(message: string, code?: string, retryAfter?: number, currentUsage?: number, limit?: number);
}
/**
 * Thrown when credits are exhausted
 */
declare class InsufficientCreditsError extends FirmeApiError {
    readonly availableCredits: number;
    readonly requiredCredits: number;
    constructor(message: string, code?: string, availableCredits?: number, requiredCredits?: number);
}
/**
 * Thrown when request validation fails
 */
declare class ValidationError extends FirmeApiError {
    constructor(message: string, code?: string);
}
/**
 * Thrown when the API returns an unexpected error
 */
declare class ApiError extends FirmeApiError {
    constructor(message: string, code?: string, statusCode?: number);
}
/**
 * Thrown when a network error occurs
 */
declare class NetworkError extends FirmeApiError {
    constructor(message?: string);
}
/**
 * Thrown when request times out
 */
declare class TimeoutError extends FirmeApiError {
    constructor(message?: string);
}

export { type Address, ApiError, type ApiErrorResponse, type ApiResponse, AuthenticationError, type Bilant, type BilantDetalii, type BilantYear, type Company, FirmeApi, type FirmeApiConfig, FirmeApiError, type FreeApiUsage, type FreeCompany, InsufficientCreditsError, type MofPublication, type MofResponse, NetworkError, NotFoundError, type Pagination, RateLimitError, type Restanta, type RestanteResponse, type SearchFilters, type SearchResponse, type StatusInactiv, TimeoutError, type TvaInfo, type TvaPeriod, ValidationError, FirmeApi as default };
