import { ZodError, ZodTypeAny } from "zod";

export type ApiValidationError = {
  ok: false;
  code: "VALIDATION_ERROR";
  message: string;
  fieldErrors: Record<string, string>;
};

export type ApiOk<T> = { ok: true; data: T };
export type ApiError = ApiValidationError | { ok: false; code: string; message: string };

export function zodToFieldErrors(err: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export async function parseAndValidate<T extends ZodTypeAny>(
  req: Request,
  schema: T,
  opts?: { message?: string }
): Promise<{ ok: true; value: ReturnType<T["parse"]> } | ApiValidationError> {
  let json: unknown;

  try {
    json = await req.json();
  } catch {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: opts?.message ?? "Invalid JSON body.",
      fieldErrors: { _global: "Invalid JSON body." }
    };
  }

  try {
    const value = schema.parse(json);
    return { ok: true, value };
  } catch (e) {
    if (e instanceof ZodError) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: opts?.message ?? "Please correct the highlighted fields.",
        fieldErrors: zodToFieldErrors(e)
      };
    }
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: opts?.message ?? "Please correct the highlighted fields.",
      fieldErrors: { _global: "Validation failed." }
    };
  }
}

export function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    status: init?.status ?? 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init?.headers ?? {})
    }
  });
}
