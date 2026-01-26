import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServicePricing1769415325774 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`service_pricing\` (
            \`id\` int NOT NULL AUTO_INCREMENT, 
            \`serviceTypeId\` int NOT NULL, 
            \`price\` decimal(12,2) NOT NULL, 
            \`currency\` varchar(3) NOT NULL, 
            \`period\` enum ('ONCE', 'MONTH', 'YEAR') NOT NULL, 
            \`periodCount\` int NOT NULL DEFAULT '1', 
            \`isActive\` tinyint NOT NULL DEFAULT 1, 
            \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), 
            \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) 
            ON UPDATE CURRENT_TIMESTAMP(6), 
            PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`service_pricing\``);
  }
}
