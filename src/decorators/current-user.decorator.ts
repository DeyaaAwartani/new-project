import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUserType } from '../common/types/current-user.type';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): CurrentUserType | null => {
    const request = ctx.switchToHttp().getRequest();
    const user: CurrentUserType = request.user;

    if (!user) {
      return null;
    }

    return data ? user?.[data] : user;
  },
);
