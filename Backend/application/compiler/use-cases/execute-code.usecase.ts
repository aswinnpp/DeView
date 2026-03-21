import { injectable } from 'inversify';
import { env } from '../../../infrastructure/config/env.js';
import { AppError } from '../../../shared/errors/AppError.js';
import type { ExecuteCodeResult, IExecuteCodeUseCase } from '../ports/usecase/IExecuteCodeUseCase.js';
import { mapSubmissionToExecuteResult, type CompilerSubmission } from '../mappers/compiler.mapper.js';

const MAX_POLLS = 60;
const POLL_INTERVAL_MS = 500;

async function compilerFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = env.COMPILER_URL.replace(/\/$/, '');
  const url = `${base}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
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
    throw AppError.internal(`Failed to call compiler API: ${detail}`);
  } finally {
    clearTimeout(timeout);
  }
}

@injectable()
export class ExecuteCodeUseCase implements IExecuteCodeUseCase {
  async execute(params: { code: string; languageId: number; stdin?: string }): Promise<ExecuteCodeResult> {
    const { code, languageId, stdin } = params;

    const create = await compilerFetch<{ token?: string }>('/submissions?base64_encoded=false&wait=false', {
      method: 'POST',
      body: JSON.stringify({
        source_code: code,
        language_id: languageId,
        stdin: stdin || undefined,
      }),
    });

    const token = create?.token;
    if (!token) {
      throw AppError.internal('Compiler did not return a submission token.');
    }

    let submission: CompilerSubmission | null = null;
    let statusId: number | undefined;

    for (let i = 0; i < MAX_POLLS; i++) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      submission = await compilerFetch<CompilerSubmission>(
        `/submissions/${token}?base64_encoded=false&fields=stdout,stderr,compile_output,message,status`
      );
      statusId = submission.status?.id;
      if (statusId !== 1 && statusId !== 2) {
        break;
      }
    }

    if (!submission) {
      throw AppError.internal('Compiler did not return a submission result.');
    }

    if (statusId === 1 || statusId === 2) {
      throw AppError.tooManyRequests('Execution timed out. Please try again.');
    }

    if (statusId === 13) {
      const details = [submission.stderr, submission.compile_output, submission.message]
        .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
        .join(' | ');
      throw AppError.internal(`Compiler internal error. ${details || 'No extra details.'}`);
    }

    return mapSubmissionToExecuteResult(submission);
  }
}
