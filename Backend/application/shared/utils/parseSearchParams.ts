import { AppError } from "../../../shared/errors/AppError";

const DEFAULT_PAGE = 1;

const DEFAULT_LIMIT = 10;

const MAX_LIMIT = 100;


const MIN_PAGE = 1;

const MIN_LIMIT = 1;

export interface ISearchParamsInput {
  page?: string | null;
  limit?: string | null;
}

export interface IParsedSearchParams {
  page: number;
  limit: number;
}


export function parseSearchParams(input: ISearchParamsInput): IParsedSearchParams {
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
