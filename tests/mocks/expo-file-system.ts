export const cacheDirectory = "file:///mock-cache/";
export const documentDirectory = "file:///mock-documents/";
export const getInfoAsync = async (uri: string) => ({ exists: false, size: 0 });
export const copyAsync = async () => {};
export const deleteAsync = async () => {};
export const readDirectoryAsync = async () => [];
export const makeDirectoryAsync = async () => {};
export default {
  cacheDirectory,
  documentDirectory,
  getInfoAsync,
  copyAsync,
  deleteAsync,
  readDirectoryAsync,
  makeDirectoryAsync,
};
