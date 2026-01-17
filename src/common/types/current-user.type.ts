import { UserRole } from '../../auth/enums/user-role.enum';

export interface CurrentUserType {
  userId: number;
  email: string;
  role: UserRole;
  authenticatedAt: string;
  tokenType: 'access' | 'refresh' | 'system';
}
