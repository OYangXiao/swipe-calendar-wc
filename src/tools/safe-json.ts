export function JSON_parse_result(
  value: string
): { err: string } | { ok: any } {
  let result;
  try {
    result = JSON.parse(value);
  } catch {
    return { err: 'not valid json string' };
  }
  return { ok: result };
}
