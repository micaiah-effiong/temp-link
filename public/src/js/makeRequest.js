export default async function makeRequest(url, method, options) {
  const extra = {
    method: method,
    headers: options.headers,
    body: JSON.stringify(options.body),
  };
  const res = await fetch(url, extra);
  return await res.json();
}
