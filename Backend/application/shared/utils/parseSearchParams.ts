import { AppError } from "../../../shared/errors/AppError";

/** Default page when not provided or invalid */
const DEFAULT_PAGE = 1;

/** Default limit when not provided or invalid */
const DEFAULT_LIMIT = 10;

/** Maximum allowed limit to prevent excessive data fetching */
const MAX_LIMIT = 100;

/** Minimum valid page number */
const MIN_PAGE = 1;

/** Minimum valid limit */
const MIN_LIMIT = 1;

export interface SearchParamsInput {
  page?: string | null;
  limit?: string | null;
}

export interface ParsedSearchParams {
  page: number;
  limit: number;
}

/**
 * Parses and validates pagination query parameters from HTTP request.
 * Converts string values to numbers, applies defaults, and validates ranges.
 *
 * @param input - Raw query params (page and limit as strings)
 * @returns Validated { page, limit } as numbers
 * @throws AppError with BAD_REQUEST if values are invalid
 */
export function parseSearchParams(input: SearchParamsInput): ParsedSearchParams {
  const pageValue = parsePage(input.page);
  const limitValue = parseLimit(input.limit);

  return { page: pageValue, limit: limitValue };
}

function parsePage(rawPage: string | null | undefined): number {
  if (rawPage == null || rawPage === "") {
    return DEFAULT_PAGE;
  }

  const parsed = parseInt(rawPage, 10);

  if (Number.isNaN(parsed)) {
    throw AppError.badRequest("Page must be a valid number");
  }

  if (parsed < MIN_PAGE) {
    throw AppError.badRequest(`Page must be at least ${MIN_PAGE}`);
  }

  return parsed;
}

function parseLimit(rawLimit: string | null | undefined): number {
  if (rawLimit == null || rawLimit === "") {
    return DEFAULT_LIMIT;
  }

  const parsed = parseInt(rawLimit, 10);

  if (Number.isNaN(parsed)) {
    throw AppError.badRequest("Limit must be a valid number");
  }

  if (parsed < MIN_LIMIT) {
    throw AppError.badRequest(`Limit must be at least ${MIN_LIMIT}`);
  }

  if (parsed > MAX_LIMIT) {
    throw AppError.badRequest(`Limit cannot exceed ${MAX_LIMIT}`);
  }

  return parsed;
}
