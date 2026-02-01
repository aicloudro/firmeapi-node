/**
 * FirmeAPI - Official Node.js SDK
 *
 * @packageDocumentation
 *
 * @example
 * ```typescript
 * import FirmeApi from 'firmeapi';
 *
 * const client = new FirmeApi({
 *   apiKey: 'your_api_key_here',
 *   sandbox: true // Enable sandbox mode for testing
 * });
 *
 * // Get company details
 * const company = await client.getCompany('12345678');
 * console.log(company.denumire);
 *
 * // Search companies
 * const results = await client.searchCompanies({
 *   judet: 'B',
 *   caen: '6201'
 * });
 * ```
 */

// Main client export
export { FirmeApi, FirmeApi as default } from './client';

// Type exports
export type {
  FirmeApiConfig,
  Address,
  TvaPeriod,
  TvaInfo,
  StatusInactiv,
  Company,
  BilantDetalii,
  BilantYear,
  Bilant,
  Restanta,
  RestanteResponse,
  MofPublication,
  MofResponse,
  SearchFilters,
  Pagination,
  SearchResponse,
  ApiResponse,
  ApiErrorResponse,
  FreeCompany,
  FreeApiUsage,
} from './types';

// Error exports
export {
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
