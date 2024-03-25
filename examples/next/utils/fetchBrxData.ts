export const fetchBrxData = async (url: string) => {
  const res = await fetch(url);
  return await res.json();
}
