import { Module } from '@nestjs/common';
import { UserInteractionService } from './user-interaction.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserInteraction } from './entities/user-interaction.entity';
import { UserInteractionListener } from './listeners/user-interaction.listener';

@Module({
  imports: [TypeOrmModule.forFeature([UserInteraction])],
  providers: [UserInteractionService, UserInteractionListener],
})
export class UserInteractionModule {}
