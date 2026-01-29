export type SendNotificationJob = {
  orderId: number;
  userId: number;
  type: 'EMAIL' | 'SMS' | 'ALL';
  payload: any;
};
