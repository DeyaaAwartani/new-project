import { MigrationInterface, QueryRunner } from 'typeorm';

export class RelationsBetweenCategoriesPricingTypesServices1769416500261 implements MigrationInterface {
  name = 'RelationsBetweenCategoriesPricingTypesServices1769416500261';

  private readonly fkName1 = 'FK_services_categoryId_category_id';
  private readonly fkName2 = 'FK_servicePricing_serviceTypeId_serviceTypes_id';
  private readonly fkName3 = 'FK_serviceTypes_serviceId_services_id';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE \`services\` 
          ADD CONSTRAINT \`${this.fkName1}\` 
          FOREIGN KEY (\`categoryId\`) 
          REFERENCES \`service_categories\`(\`id\`) 
          ON DELETE RESTRICT 
          ON UPDATE NO ACTION
          `);
    await queryRunner.query(
      `ALTER TABLE \`service_types\` 
          ADD CONSTRAINT \`${this.fkName3}\` 
          FOREIGN KEY (\`serviceId\`) 
          REFERENCES \`services\`(\`id\`) 
          ON DELETE CASCADE 
          ON UPDATE NO ACTION
          `,
    );
    await queryRunner.query(`
          ALTER TABLE \`service_pricing\` 
          ADD CONSTRAINT \`${this.fkName2}\` 
          FOREIGN KEY (\`serviceTypeId\`) 
          REFERENCES \`service_types\`(\`id\`) 
          ON DELETE CASCADE 
          ON UPDATE NO ACTION
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE \`service_pricing\` 
          DROP FOREIGN KEY \`${this.fkName2}\`
          `);
    await queryRunner.query(`
          ALTER TABLE \`service_types\` 
          DROP FOREIGN KEY \`${this.fkName3}\`
          `);
    await queryRunner.query(`
          ALTER TABLE \`services\` 
          DROP FOREIGN KEY \`${this.fkName1}\`
          `);
  }
}
