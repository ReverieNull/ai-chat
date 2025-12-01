export interface LoginRes {
  code: number;
  message: string;
  data: {
    user: any;
    accessToken: string;
    refreshToken: string;
  };
}
