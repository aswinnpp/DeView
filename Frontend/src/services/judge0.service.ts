import { api } from "../api/axios";
import { API_ROUTES } from "../constants/routes";

export type Judge0Language = {
  id: number;
  name: string;
};

export type ExecuteJudge0Result = {
  output: string;
  statusId?: number;
  statusDescription?: string;
};

// On error we return an empty list so UI does not force a limited fallback.
export const FALLBACK_LANGUAGES: Judge0Language[] = [];

export const judge0Service = {
  getLanguages: () =>
    api
      .get<{ data: Judge0Language[] }>(API_ROUTES.COMPILER.LANGUAGES)
      .then((res) => {
        const list = res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
        return list;
      })
      .catch(() => FALLBACK_LANGUAGES),

  executeCode: (params: { code: string; languageId: number }) =>
    api
      .post<{ data: ExecuteJudge0Result }>(API_ROUTES.COMPILER.EXECUTE, params)
      .then((res) => res.data?.data as ExecuteJudge0Result),
};
