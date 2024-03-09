import { CODE } from '../@types/status';

export class ApiError {
  public code: CODE;
  public message: string;
  public status: string;

  constructor(code: CODE, message: string) {
    this.code = code;
    this.message = message;
    this.status = 'Failed';
  }

  static badRequest(msg: string) {
    return new ApiError(400, msg);
  }

  static serverError(msg: string) {
    return new ApiError(500, msg);
  }
  static conflict(msg: string) {
    return new ApiError(409, msg);
  }
  static unauthorized(msg: string) {
    return new ApiError(401, msg);
  }
  static forbidden(msg: string) {
    return new ApiError(403, msg);
  }
  static unprocessable(msg: string) {
    return new ApiError(422, msg);
  }
  static notfound(msg: string) {
    return new ApiError(404, msg);
  }
  static duplicateField(msg: string) {
    return new ApiError(400, msg);
  }
  static validationError(msg: string) {
    return new ApiError(400, msg);
  }
}
