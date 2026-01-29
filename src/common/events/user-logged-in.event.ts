import { UserRole } from 'src/auth/enums/user-role.enum';

export class UserLoggedInEvent {
  constructor(
    public readonly userId: number,
    public readonly role: UserRole,
  ) {}
}
