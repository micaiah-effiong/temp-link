function makeRequest(url, method, options) {
  return fetch(url, {
    method: method,
    headers: options.headers,
    body: JSON.stringify(options.body),
  }).then((res) => res.json());
}
