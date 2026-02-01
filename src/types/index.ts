/**
 * FirmeAPI TypeScript Type Definitions
 */

// ============================================
// Configuration Types
// ============================================

export interface FirmeApiConfig {
  /** Your FirmeAPI API key */
  apiKey: string;
  /** Enable sandbox mode for testing (default: false) */
  sandbox?: boolean;
  /** Base URL override (default: https://www.firmeapi.ro/api) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
}

// ============================================
// Address Types
// ============================================

export interface Address {
  strada: string | null;
  numar: string | null;
  localitate: string | null;
  judet: string | null;
  cod_judet: string | null;
  cod_postal: string | null;
  detalii: string | null;
}

// ============================================
// TVA (VAT) Types
// ============================================

export interface TvaPeriod {
  data_inceput: string | null;
  data_sfarsit: string | null;
  data_anul_fiscal: string | null;
  mesaj_scpTVA: string | null;
}

export interface TvaInfo {
  platitor: boolean;
  perioade: TvaPeriod[];
}

// ============================================
// Company Status Types
// ============================================

export interface StatusInactiv {
  inactiv: boolean;
  data_inactivare: string | null;
  data_reactivare: string | null;
  data_radiere: string | null;
}

// ============================================
// Company Types
// ============================================

export interface Company {
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

// ============================================
// Balance Sheet (Bilant) Types
// ============================================

export interface BilantDetalii {
  I1?: number; // Cifra de afaceri neta
  I2?: number; // Venituri totale
  I3?: number; // Cheltuieli totale
  I4?: number; // Profit brut
  I5?: number; // Profit net
  I6?: number; // Active imobilizate
  I7?: number; // Active circulante
  I8?: number; // Datorii
  I9?: number; // Capitaluri proprii
  I10?: number; // Numar mediu salariati
  [key: string]: number | undefined;
}

export interface BilantYear {
  an: number;
  cui: number;
  denumire: string;
  caen: string;
  denumire_caen: string;
  detalii: BilantDetalii;
}

export interface Bilant {
  cui: number;
  ani: BilantYear[];
}

// ============================================
// ANAF Debts (Restante) Types
// ============================================

export interface Restanta {
  tip_obligatie: string;
  suma_restanta: number;
  data_obligatie: string;
  stare: string;
}

export interface RestanteResponse {
  cui: number;
  restante: Restanta[];
}

// ============================================
// MOF (Monitorul Oficial) Types
// ============================================

export interface MofPublication {
  denumire: string;
  publicatieNr: string;
  data: string;
  titlu_publicatie: string;
  continut: string;
}

export interface MofResponse {
  cui: number;
  rezultate: MofPublication[];
}

// ============================================
// Search Types
// ============================================

export interface SearchFilters {
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

export interface Pagination {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface SearchResponse {
  items: Company[];
  pagination: Pagination;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  sandbox?: boolean;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  message: string;
  sandbox?: boolean;
}

// ============================================
// Free API Types
// ============================================

export interface FreeCompany {
  cui: number;
  denumire: string;
  adresa: string | null;
  telefon: string | null;
  cod_caen: string | null;
  stare: string | null;
  judet: string | null;
  localitate: string | null;
}

export interface FreeApiUsage {
  requests_today: number;
  requests_limit: number;
  reset_at: string;
}
