import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateServicesTables1769348785389 implements MigrationInterface {
    name = 'CreateServicesTables1769348785389'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`service_categories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(120) NOT NULL, \`description\` text NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`services\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(160) NOT NULL, \`description\` text NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`categoryId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`service_pricing\` (\`id\` int NOT NULL AUTO_INCREMENT, \`price\` decimal(12,2) NOT NULL, \`currency\` varchar(3) NOT NULL, \`period\` enum ('ONCE', 'MONTH', 'YEAR') NOT NULL, \`periodCount\` int NOT NULL DEFAULT '1', \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`serviceTypeId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`service_types\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(120) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`serviceId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`services\` ADD CONSTRAINT \`FK_034b52310c2d211bc979c3cc4e8\` FOREIGN KEY (\`categoryId\`) REFERENCES \`service_categories\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`service_pricing\` ADD CONSTRAINT \`FK_97283f4a9efb317f4b66a72c229\` FOREIGN KEY (\`serviceTypeId\`) REFERENCES \`service_types\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`service_types\` ADD CONSTRAINT \`FK_e7ec99fa3cea257470ca8c3357e\` FOREIGN KEY (\`serviceId\`) REFERENCES \`services\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`service_types\` DROP FOREIGN KEY \`FK_e7ec99fa3cea257470ca8c3357e\``);
        await queryRunner.query(`ALTER TABLE \`service_pricing\` DROP FOREIGN KEY \`FK_97283f4a9efb317f4b66a72c229\``);
        await queryRunner.query(`ALTER TABLE \`services\` DROP FOREIGN KEY \`FK_034b52310c2d211bc979c3cc4e8\``);
        await queryRunner.query(`DROP TABLE \`service_types\``);
        await queryRunner.query(`DROP TABLE \`service_pricing\``);
        await queryRunner.query(`DROP TABLE \`services\``);
        await queryRunner.query(`DROP TABLE \`service_categories\``);
    }

}
