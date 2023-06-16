export function combine_attr(data: Array<string | undefined | false>) {
  return data.filter(Boolean).join(' ');
}
