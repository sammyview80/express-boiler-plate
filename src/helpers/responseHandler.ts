import { CookieOptions, Response } from 'express';
import { IMetaProps } from './BaseClass';
import { CODE } from '../@types/status';
import { TOKEN } from '../constants/general';
import { IToken } from './Token';

export const sendResponse = <T>(args: {
  res: Response;
  data: {
    toast: string;
    description: string;
    results: T;
    meta?: IMetaProps;
  };
  status: CODE;
  contentType?: string | number | readonly string[];
  witCookie?: boolean;
  JWTToken?: IToken;
  cookieOptions?: CookieOptions;
  clearCookie?: boolean;
}) => {
  const {
    data,
    res,
    status,
    contentType,
    cookieOptions,
    witCookie,
    JWTToken,
    clearCookie,
  } = args;
  if (contentType) res.setHeader('Content-Type', contentType);

  if (clearCookie)
    res
      .status(status)
      .json({
        status: 'success',
        cookie: false,
        ...data,
      })
      .clearCookie(TOKEN);

  if (witCookie && JWTToken) {
    return res
      .status(status)
      .cookie(TOKEN, JWTToken, cookieOptions ? cookieOptions : {})
      .json({ ...data, cookies: true });
  }
  return res.status(status).json({
    status: 'success',
    cookie: false,
    ...data,
  });
};
