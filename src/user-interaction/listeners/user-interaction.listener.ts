import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserInteraction } from '../entities/user-interaction.entity';
import { UserLoggedInEvent } from 'src/common/events/user-logged-in.event';
import { UserOrderCreatedEvent } from 'src/common/events/user-order-created.event';
import { UserPurchaseApprovedEvent } from 'src/common/events/user-purchase-approved.event';
@Injectable()
export class UserInteractionListener {
  constructor(
    @InjectRepository(UserInteraction)
    private readonly repo: Repository<UserInteraction>,
  ) {}

  @OnEvent('user.logged_in')
  async handleUserLoggedIn(event: UserLoggedInEvent) {
    await this.repo.save({
      userId: event.userId,
      interaction: `LOGIN ${event.role}`,
    });
  }

  @OnEvent('user.order_created')
  async handleOrderCreated(event: UserOrderCreatedEvent) {
    await this.repo.save({
      userId: event.userId,
      interaction: 'ORDER_CREATED',
    });
  }

  @OnEvent('user.purchase_approved')
  async handlePurchaseApproved(event: UserPurchaseApprovedEvent) {
    await this.repo.save({
      userId: event.userId,
      interaction: 'PURCHASE_APPROVED',
    });
  }
}
