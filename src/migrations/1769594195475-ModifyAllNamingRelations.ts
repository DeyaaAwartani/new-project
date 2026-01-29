import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyAllNamingRelations1769594195475 implements MigrationInterface {
  name = 'ModifyAllNamingRelations1769594195475';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`wallets\` 
      DROP FOREIGN KEY \`FK_2ecdb33f23e9a6fc392025c0b97\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` 
      DROP FOREIGN KEY \`FK_151b79a83ba240b0cb31b2302d1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` 
      DROP FOREIGN KEY \`FK_8624dad595ae567818ad9983b33\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users_settings\` 
      DROP FOREIGN KEY \`FK_2c45eb892f9027c250b9a4c2811\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`services\` 
      DROP FOREIGN KEY \`FK_services_categoryId_category_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`service_types\` 
      DROP FOREIGN KEY \`FK_serviceTypes_serviceId_services_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`service_pricing\` 
      DROP FOREIGN KEY \`FK_servicePricing_serviceTypeId_serviceTypes_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`wallets\` 
      ADD CONSTRAINT \`FK_wallets_userId__users_id\` 
      FOREIGN KEY (\`userId\`) 
      REFERENCES \`users\`(\`id\`) 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` 
      ADD CONSTRAINT \`FK_orders_userId__users_id\` 
      FOREIGN KEY (\`userId\`) 
      REFERENCES \`users\`(\`id\`) 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` 
      ADD CONSTRAINT \`FK_orders_productId__products_id\` 
      FOREIGN KEY (\`productId\`) 
      REFERENCES \`products\`(\`id\`) 
      ON DELETE RESTRICT 
      ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users_settings\` 
      ADD CONSTRAINT \`FK_users_settings_userId__users_id\` 
      FOREIGN KEY (\`userId\`) 
      REFERENCES \`users\`(\`id\`) 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`services\` 
      ADD CONSTRAINT \`FK_services_categoryId__service_categories_id\` 
      FOREIGN KEY (\`categoryId\`) 
      REFERENCES \`service_categories\`(\`id\`)
      ON DELETE RESTRICT 
      ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`service_types\` 
      ADD CONSTRAINT \`FK_service_types_serviceId__services_id\` 
      FOREIGN KEY (\`serviceId\`) 
      REFERENCES \`services\`(\`id\`) 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`service_pricing\` 
      ADD CONSTRAINT \`FK_service_pricing_serviceTypeId__service_types_id\` 
      FOREIGN KEY (\`serviceTypeId\`) 
      REFERENCES \`service_types\`(\`id\`) 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`service_pricing\` 
      DROP FOREIGN KEY \`FK_service_pricing_serviceTypeId__service_types_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`service_types\` 
      DROP FOREIGN KEY \`FK_service_types_serviceId__services_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`services\` 
      DROP FOREIGN KEY \`FK_services_categoryId__service_categories_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users_settings\` 
      DROP FOREIGN KEY \`FK_users_settings_userId__users_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` 
      DROP FOREIGN KEY \`FK_orders_productId__products_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` 
      DROP FOREIGN KEY \`FK_orders_userId__users_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`wallets\` 
      DROP FOREIGN KEY \`FK_wallets_userId__users_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`service_pricing\` 
      ADD CONSTRAINT \`FK_servicePricing_serviceTypeId_serviceTypes_id\` 
      FOREIGN KEY (\`serviceTypeId\`) 
      REFERENCES \`service_types\`(\`id\`) 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`service_types\` 
      ADD CONSTRAINT \`FK_serviceTypes_serviceId_services_id\` 
      FOREIGN KEY (\`serviceId\`) 
      REFERENCES \`services\`(\`id\`) 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`services\` 
      ADD CONSTRAINT \`FK_services_categoryId_category_id\` 
      FOREIGN KEY (\`categoryId\`) 
      REFERENCES \`service_categories\`(\`id\`) 
      ON DELETE RESTRICT 
      ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users_settings\` 
      ADD CONSTRAINT \`FK_2c45eb892f9027c250b9a4c2811\` 
      FOREIGN KEY (\`userId\`) 
      REFERENCES \`users\`(\`id\`) 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` 
      ADD CONSTRAINT \`FK_8624dad595ae567818ad9983b33\` 
      FOREIGN KEY (\`productId\`) 
      REFERENCES \`products\`(\`id\`) 
      ON DELETE RESTRICT 
      ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` 
      ADD CONSTRAINT \`FK_151b79a83ba240b0cb31b2302d1\` 
      FOREIGN KEY (\`userId\`) 
      REFERENCES \`users\`(\`id\`) 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`wallets\` 
      ADD CONSTRAINT \`FK_2ecdb33f23e9a6fc392025c0b97\` 
      FOREIGN KEY (\`userId\`) 
      REFERENCES \`users\`(\`id\`) 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION`,
    );
  }
}
