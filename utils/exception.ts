import { UnsuccessStatusCode } from 'typings/response.types';

/**
 * @description 内置结构化异常，会在响应体中返回错误信息
 */
export class AnyException extends Error {
  #statusCode: UnsuccessStatusCode;

  constructor({
    statusCode,
    message,
  }: {
    statusCode: UnsuccessStatusCode;
    message?: string;
  }) {
    super(message);
    this.#statusCode = statusCode;
  }

  get statusCode() {
    return this.#statusCode;
  }
}
