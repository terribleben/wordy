
async function getWebsiteAsync(url) {
  const response = await fetch(url, {
    method: 'get',
  });
  if (response.status >= 400 && response.status < 600) {
    throw new Error(`Received bad status code when fetching ${url}: ${response.status}`);
  }

  let text;
  let contentType = response.headers.get('Content-Type');
  if (contentType && contentType.indexOf('text') !== -1) {
    text = await response.text();
  } else {
    throw new Error(`Expected text but got Content-Type: ${contentType}`);
  }

  return text;
}

export {
  getWebsiteAsync,
}
