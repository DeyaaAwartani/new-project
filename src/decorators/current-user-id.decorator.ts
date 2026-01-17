import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUserType } from '../common/types/current-user.type';

export const CurrentUserId = createParamDecorator(
  (data: any, ctx: ExecutionContext): number | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const user: CurrentUserType = request.user;
    return user?.userId;
  },
);
