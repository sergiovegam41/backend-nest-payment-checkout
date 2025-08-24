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

    if (this.hasCursorConditions(whereClause)) {
      const orConditions = this.buildCursorOrConditions(whereClause.cursorConditions!);
      if (orConditions.length > 0) {
        prismaWhere.OR = orConditions;
      }
    }

    return prismaWhere;
  }

  private hasCursorConditions(whereClause: CursorWhereClause): boolean {
    return !!(whereClause.cursorConditions && whereClause.cursorConditions.length > 0);
  }

  private buildCursorOrConditions(conditions: any[]): Record<string, any>[] {
    const timestampConditions = conditions.filter(c => !c.isOrCondition);
    const idConditions = conditions.filter(c => c.isOrCondition);
    
    if (timestampConditions.length === 0 || idConditions.length === 0) {
      return this.buildFallbackConditions(timestampConditions);
    }

    return this.buildOptimalOrConditions(timestampConditions[0], idConditions[0]);
  }

  private buildOptimalOrConditions(timestampCondition: any, idCondition: any): Record<string, any>[] {
    return [
      this.buildTimestampCondition(timestampCondition),
      this.buildTimestampEqualsWithIdCondition(timestampCondition, idCondition)
    ];
  }

  private buildTimestampCondition(condition: any): Record<string, any> {
    return {
      [condition.field]: {
        [condition.operator]: condition.value
      }
    };
  }

  private buildTimestampEqualsWithIdCondition(timestampCondition: any, idCondition: any): Record<string, any> {
    return {
      AND: [
        {
          [timestampCondition.field]: {
            equals: timestampCondition.value
          }
        },
        {
          [idCondition.field]: {
            [idCondition.operator]: idCondition.value
          }
        }
      ]
    };
  }

  private buildFallbackConditions(conditions: any[]): Record<string, any>[] {
    return conditions.map(condition => ({
      [condition.field]: {
        [condition.operator]: condition.value
      }
    }));
  }
}