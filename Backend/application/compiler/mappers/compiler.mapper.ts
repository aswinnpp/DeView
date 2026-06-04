import type { CompilerLanguage, IExecuteCodeOutputDTO } from '../dtos/CompilerDTO.js';

export type CompilerSubmission = {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  status?: { id?: number; description?: string };
};

export function normalizeLanguagesPayload(raw: unknown): CompilerLanguage[] {
  if (Array.isArray(raw)) {
    return raw.filter(
      (x): x is CompilerLanguage =>
        x !== null &&
        typeof x === 'object' &&
        typeof (x as CompilerLanguage).id === 'number' &&
        typeof (x as CompilerLanguage).name === 'string'
    );
  }

  if (raw && typeof raw === 'object' && 'languages' in raw) {
    const inner = (raw as { languages?: unknown }).languages;
    return Array.isArray(inner) ? normalizeLanguagesPayload(inner) : [];
  }

  return [];
}

export function mapSubmissionToExecuteResult(submission: CompilerSubmission): IExecuteCodeOutputDTO {
  const statusId = submission.status?.id;
  const statusDescription = submission.status?.description;

  const stdout = typeof submission.stdout === 'string' ? submission.stdout : '';
  const stderr = typeof submission.stderr === 'string' ? submission.stderr : '';
  const compileOutput = typeof submission.compile_output === 'string' ? submission.compile_output : '';
  const message = typeof submission.message === 'string' ? submission.message : '';

  const outputParts = [stdout, stderr, compileOutput, message]
    .map((s) => s.trimEnd())
    .filter((s) => s.trim().length > 0);

  const output =
    outputParts.length > 0
      ? outputParts.join('\n')
      : statusDescription
        ? `No output. Status: ${statusDescription}`
        : 'No output.';

  return {
    output,
    statusId,
    statusDescription,
  };
}
