export function extractAxiosFailureReason(err: any): string {

  // If the server responds to us (400/500..)
  const status = err?.response?.status;
  if (status) {

    // get message string or array
    const respMsg = err?.response?.data?.message;
    const msg = Array.isArray(respMsg) ? respMsg.join(', ') : respMsg;

    return `HTTP_${status}: ${msg ?? err?.response?.statusText ?? 'Request failed'}`;
  }

  // if no response (timeout / ECONNREFUSED / network)
  const code = err?.code ? String(err.code) : 'NO_RESPONSE';
  const message = err?.message ? String(err.message) : String(err);

  return `${code}: ${message}`;
}
