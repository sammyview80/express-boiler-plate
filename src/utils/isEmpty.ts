export function isEmpty(
  value: string | object | boolean | unknown[] | null,
): boolean {
  if (value === undefined || value === null || typeof value === "undefined") {
    return true;
  }

  if (typeof value === "string" && value.trim() === "") {
    return true;
  }

  if (Array.isArray(value) && value.length === 0) {
    return true;
  }

  if (typeof value === "object" && Object.keys(value).length === 0) {
    return true;
  }

  return !value;
}
