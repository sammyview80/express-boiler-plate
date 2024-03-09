import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

interface ITokenPayload {
  payload: string | object | Buffer;
  options?: SignOptions | undefined;
}

interface IToken {
  accessToken: string;
  refreshToken: string;
}

interface ITokenPayloadFunction<T> {
  (payload: string | object | Buffer, options?: SignOptions | undefined): T;
}

interface JwtPayloadSign extends JwtPayload {
  userId: string;
}

class JWTService {
  private ACCESS_TOKEN_SECRET: string =
    process.env.ACCESS_TOKEN_SECRET || 'sammyview80';
  private REFRESH_TOKEN_SECRET: string =
    process.env.REFRESH_TOKEN_SECRET || 'sammyview80';

  getAccessToken: ITokenPayloadFunction<string> = (payload, options) => {
    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET as Secret, {
      expiresIn: '1h',
      ...options,
    });
  };

  getRefreshToken: ITokenPayloadFunction<string> = (payload, options) => {
    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET as Secret, {
      expiresIn: '1h',
      ...options,
    });
  };
  getToken: ITokenPayloadFunction<IToken> = (payload, options) => {
    const accessToken = this.getAccessToken(payload, options);
    const refreshToken = this.getRefreshToken(payload, options);
    return { accessToken, refreshToken };
  };

  verifyToken(token: string): JwtPayloadSign {
    return jwt.verify(token, this.ACCESS_TOKEN_SECRET, {
      ignoreExpiration: true,
    }) as JwtPayloadSign;
  }
}

export { JWTService, ITokenPayload, JwtPayloadSign, IToken };
