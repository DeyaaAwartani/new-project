export class SendEmailDto {
  toEmail: string;
  title: string;
  message: string;
  ccList?: string[];
  bccList?: string[];
}
