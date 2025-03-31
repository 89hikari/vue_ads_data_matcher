export const getFile = (file: File | File[]) =>
  Array.isArray(file) ? file[0] : file;

export const getStrFromArrByKey = <T>(
  array: unknown[],
  key: keyof T
): string[] => [
  ...new Set((<T[]>array).map((el) => el[key]?.toString() || "")),
];

export const getWorker = () =>
  new Worker(new URL("../utils/worker?worker", import.meta.url), {
    type: "module",
  });
