import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServices1769415317226 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`services\` (
            \`id\` int NOT NULL AUTO_INCREMENT, 
            \`categoryId\` int NOT NULL, 
            \`name\` varchar(160) NOT NULL, 
            \`description\` text NULL, 
            \`isActive\` tinyint NOT NULL DEFAULT 1, 
            \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), 
            \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) 
            ON UPDATE CURRENT_TIMESTAMP(6), 
            PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`services\``);
  }
}
