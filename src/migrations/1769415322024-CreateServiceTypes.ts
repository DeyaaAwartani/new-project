import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServiceTypes1769415322024 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`service_types\` (
            \`id\` int NOT NULL AUTO_INCREMENT, 
            \`serviceId\` int NOT NULL, 
            \`name\` varchar(120) NOT NULL, 
            \`code\` varchar(60) NOT NULL, 
            \`isActive\` tinyint NOT NULL DEFAULT 1, 
            \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), 
            \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) 
            ON UPDATE CURRENT_TIMESTAMP(6), 
            PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`service_types\``);
  }
}
