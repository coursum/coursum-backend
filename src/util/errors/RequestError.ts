class RequestError extends Error {
  statusCode: number;

  constructor(title: string, message: string, statusCode: number) {
    super(`${title}: ${message}`);
    this.name = 'RequestError';
    this.statusCode = statusCode;
  }
}

export default RequestError;
