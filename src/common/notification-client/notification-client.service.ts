import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { SendEmailDto } from './dto/create-email-notification.dto';
import { firstValueFrom } from 'rxjs';
import { SendSmsDto } from './dto/create-sms-notification.dto';

@Injectable()
export class NotificationClientService {
  constructor(private readonly http: HttpService) {}

  async sendEmail(dto: SendEmailDto) {
    const res$ = this.http.post('/notifications/email', dto);
    const res = await firstValueFrom(res$);
    return res.data;
  }

  async sendSms(dto: SendSmsDto) {
    const res$ = this.http.post('/notifications/sms', dto);
    const res = await firstValueFrom(res$);
    return res.data;
  }
}
