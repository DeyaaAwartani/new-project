import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';
import { snakeCase, camelCase } from 'typeorm/util/StringUtils';

export class CustomNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  foreignKeyName(
    tableOrName: string,
    columnNames: string[],
    referencedTablePath?: string,
    referencedColumnNames?: string[],
  ): string {
    const table = snakeCase(tableOrName);
    const cols = columnNames.map((col) => camelCase(col)).join();
    const refTable = referencedTablePath
      ? snakeCase(referencedTablePath)
      : 'ref';
    const refCols = referencedColumnNames?.map(snakeCase).join('_') || 'id';

    return `FK_${table}_${cols}__${refTable}_${refCols}`;
  }
}
