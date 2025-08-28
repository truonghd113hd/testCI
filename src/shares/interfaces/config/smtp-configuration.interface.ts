export interface ISMTPConfiguration {
  username: string;
  password: string;
  host: string;
  port: number;
  secure: boolean;
  from: string;
}
