import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexesAndUnique1769946651041 implements MigrationInterface {
  name = 'AddIndexesAndUnique1769946651041';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`UQ_wallets_userId\` 
      ON \`wallets\` (\`userId\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_products_label\` 
      ON \`products\` (\`label\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_services_categoryId\` 
      ON \`services\` (\`categoryId\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_service_pricing_serviceTypeId\` 
      ON \`service_pricing\` (\`serviceTypeId\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`UQ_pricing_type_currency_period_count\` 
      ON \`service_pricing\` (\`serviceTypeId\`, \`currency\`, \`period\`, \`periodCount\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_service_types_serviceId\` 
      ON \`service_types\` (\`serviceId\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`UQ_service_types_service_code\` 
      ON \`service_types\` (\`serviceId\`, \`code\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`UQ_service_types_service_code\` 
      ON \`service_types\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_service_types_serviceId\` 
      ON \`service_types\``,
    );
    await queryRunner.query(
      `DROP INDEX \`UQ_pricing_type_currency_period_count\` 
      ON \`service_pricing\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_service_pricing_serviceTypeId\` 
      ON \`service_pricing\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_services_categoryId\` 
      ON \`services\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_products_label\` 
      ON \`products\``,
    );
    await queryRunner.query(`DROP INDEX \`UQ_wallets_userId\`
      ON \`wallets\``);
  }
}
