import { Injectable } from '@nestjs/common';
import { QueryExecutionOptions, CursorWhereClause } from '../interfaces';
import type { IQueryExecutor } from '../interfaces';
import { PrismaDelegate } from '../types';

@Injectable()
export class PrismaQueryExecutorStrategy implements IQueryExecutor {
  async execute<T>(options: QueryExecutionOptions<T>): Promise<T[]> {
    const { model, whereClause, orderBy, take, select, include } = options;
    
    const prismaWhere = this.buildPrismaWhereClause(whereClause);
    
    const findManyArgs: any = {
      where: prismaWhere,
      orderBy,
      take,
    };

    if (select) findManyArgs.select = select;
    if (include) findManyArgs.include = include;

    return await model.findMany(findManyArgs);
  }

  async findByIdForCursor(model: PrismaDelegate, id: string, fields: string[]): Promise<any> {
    try {
      const selectClause = fields.reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {} as Record<string, boolean>);

      return await model.findUnique({
        where: { id },
        select: selectClause
      });
    } catch (error) {
      return null;
    }
  }

  private buildPrismaWhereClause(whereClause: CursorWhereClause): Record<string, any> {
    const prismaWhere = { ...whereClause.baseWhere };

    if (whereClause.excludeId) {
      prismaWhere.id = { not: whereClause.excludeId };
    }

    if (whereClause.cursorConditions && whereClause.cursorConditions.length > 0) {
      whereClause.cursorConditions.forEach(condition => {
        prismaWhere[condition.field] = {
          [condition.operator]: condition.value
        };
      });
    }

    return prismaWhere;
  }
}