import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserInteraction1769601724672 implements MigrationInterface {
  name = 'CreateUserInteraction1769601724672';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`user_interaction\` (
      \`id\` int NOT NULL AUTO_INCREMENT, 
      \`userId\` int NOT NULL, 
      \`interaction\` varchar(255) NOT NULL, 
      \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, 
      PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB`);

    await queryRunner.query(
      `ALTER TABLE \`user_interaction\` 
      ADD CONSTRAINT \`FK_user_interaction_userId__users_id\` 
      FOREIGN KEY (\`userId\`) 
      REFERENCES \`users\`(\`id\`) 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_interaction\` 
      DROP FOREIGN KEY \`FK_user_interaction_userId__users_id\``,
    );
    await queryRunner.query(`DROP TABLE \`user_interaction\``);
  }
}
