# FirmeAPI Node.js SDK

Official Node.js/TypeScript SDK for [FirmeAPI.ro](https://www.firmeapi.ro) - Romanian company data API.

## Installation

```bash
npm install firmeapi
```

## Quick Start

```typescript
import FirmeApi from 'firmeapi';

const client = new FirmeApi({
  apiKey: 'your_api_key_here',
});

// Get company details
const company = await client.getCompany('12345678');
console.log(company.denumire);
```

## Sandbox Mode

Use sandbox mode to test your integration without consuming credits:

```typescript
const client = new FirmeApi({
  apiKey: 'your_api_key_here',
  sandbox: true,
});

// Test CUIs available in sandbox:
// 00000001 - Active company with all data
// 00000002 - Inactive/deleted company
// 00000003 - Company with multiple VAT periods
// 00000004 - Company with ANAF debts
// 00000005 - Company with MOF publications
// 99999999 - Returns 404 (for testing errors)
```

## API Methods

### `getCompany(cui: string): Promise<Company>`

Get detailed company information by CUI.

```typescript
const company = await client.getCompany('12345678');

console.log(company.denumire);           // Company name
console.log(company.stare);              // Registration status
console.log(company.tva.platitor);       // VAT payer status
console.log(company.adresa_sediu_social); // Headquarters address
```

### `getBilant(cui: string): Promise<Bilant>`

Get company balance sheet data.

```typescript
const bilant = await client.getBilant('12345678');

for (const year of bilant.ani) {
  console.log(`${year.an}:`);
  console.log(`  Revenue: ${year.detalii.I1} RON`);
  console.log(`  Profit: ${year.detalii.I5} RON`);
  console.log(`  Employees: ${year.detalii.I10}`);
}
```

### `getRestante(cui: string): Promise<RestanteResponse>`

Get company ANAF debts.

```typescript
const restante = await client.getRestante('12345678');

if (restante.restante.length > 0) {
  console.log('Company has outstanding debts:');
  for (const debt of restante.restante) {
    console.log(`  ${debt.tip_obligatie}: ${debt.suma_restanta} RON`);
  }
}
```

### `getMof(cui: string): Promise<MofResponse>`

Get company Monitorul Oficial publications.

```typescript
const mof = await client.getMof('12345678');

for (const publication of mof.rezultate) {
  console.log(`${publication.data}: ${publication.titlu_publicatie}`);
}
```

### `searchCompanies(filters: SearchFilters): Promise<SearchResponse>`

Search companies with filters.

```typescript
const results = await client.searchCompanies({
  judet: 'B',           // County code
  caen: '6201',         // CAEN code
  tva: true,            // VAT payer only
  telefon: true,        // Has phone number
  data_start: '2024-01-01',
  data_end: '2024-12-31',
  page: 1,
});

console.log(`Found ${results.pagination.total} companies`);

for (const company of results.items) {
  console.log(`${company.cui}: ${company.denumire}`);
}
```

### `getFreeCompany(cui: string): Promise<FreeCompany>`

Get basic company info using the free API (no API key required, rate limited).

```typescript
const company = await client.getFreeCompany('12345678');
console.log(company.denumire);
```

## Error Handling

The SDK throws typed errors for different scenarios:

```typescript
import FirmeApi, {
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  InsufficientCreditsError,
  ValidationError,
} from 'firmeapi';

try {
  const company = await client.getCompany('12345678');
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log('Company not found');
  } else if (error instanceof AuthenticationError) {
    console.log('Invalid API key');
  } else if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter} seconds`);
  } else if (error instanceof InsufficientCreditsError) {
    console.log(`Not enough credits. Have: ${error.availableCredits}, need: ${error.requiredCredits}`);
  } else if (error instanceof ValidationError) {
    console.log(`Invalid input: ${error.message}`);
  }
}
```

## Configuration Options

```typescript
const client = new FirmeApi({
  apiKey: 'your_api_key',     // Required
  sandbox: false,              // Enable sandbox mode (default: false)
  baseUrl: 'https://...',      // Custom base URL (default: https://www.firmeapi.ro/api)
  timeout: 30000,              // Request timeout in ms (default: 30000)
});
```

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type {
  Company,
  Bilant,
  RestanteResponse,
  MofResponse,
  SearchFilters,
  SearchResponse,
} from 'firmeapi';
```

## License

MIT
