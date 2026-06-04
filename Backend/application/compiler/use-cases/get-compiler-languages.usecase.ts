import { injectable } from 'inversify';
import { env } from '../../../infrastructure/config/env.js';
import { AppError } from '../../../shared/errors/AppError.js';
import type { CompilerLanguage } from '../dtos/CompilerDTO.js';
import type { IGetCompilerLanguagesUseCase } from '../ports/usecase/IGetCompilerLanguagesUseCase.js';
import { normalizeLanguagesPayload } from '../mappers/compiler.mapper.js';

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h
let cached: CompilerLanguage[] | null = null;
let cachedAt = 0;

async function compilerFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = env.COMPILER_URL.replace(/\/$/, '');
  const url = `${base}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };

  if (env.COMPILER_AUTH_TOKEN) {
    headers['X-Auth-Token'] = env.COMPILER_AUTH_TOKEN;
  }

  try {
    const res = await fetch(url, { ...init, headers, signal: controller.signal });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw AppError.internal(`Compiler API ${res.status}: ${text.slice(0, 200) || 'no body'}`);
    }
    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof AppError) throw error;
    const detail = error instanceof Error ? error.message : 'unknown error';
    throw AppError.internal(`Failed to load compiler languages: ${detail}`);
  } finally {
    clearTimeout(timeout);
  }
}

@injectable()
export class GetCompilerLanguagesUseCase implements IGetCompilerLanguagesUseCase {
  async execute(): Promise<CompilerLanguage[]> {
    const now = Date.now();
    if (cached && now - cachedAt < CACHE_TTL_MS) {
      return cached;
    }

    const raw = await compilerFetch<unknown>('/languages/');
    const languages = normalizeLanguagesPayload(raw);
    if (languages.length === 0) {
      throw AppError.internal('Compiler returned empty or invalid languages payload.');
    }

    cached = languages;
    cachedAt = now;
    return languages;
  }
}
