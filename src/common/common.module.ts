import { Global, Module } from '@nestjs/common';
import { 
  CursorPaginationService,
  Base64CursorDecoderStrategy,
  PrismaCursorBuilderStrategy,
  PrismaQueryExecutorStrategy,
  CursorQueryFactory
} from './pagination/cursor';

@Global()
@Module({
  providers: [
    // Implementations
    Base64CursorDecoderStrategy,
    PrismaCursorBuilderStrategy,
    PrismaQueryExecutorStrategy,
    CursorQueryFactory,
    CursorPaginationService,
    
    // DI Abstractions (DIP)
    {
      provide: 'ICursorDecoder',
      useClass: Base64CursorDecoderStrategy,
    },
    {
      provide: 'ICursorBuilder',
      useClass: PrismaCursorBuilderStrategy,
    },
    {
      provide: 'IQueryExecutor',
      useClass: PrismaQueryExecutorStrategy,
    },
  ],
  exports: [
    CursorPaginationService,
    'ICursorDecoder',
    'ICursorBuilder', 
    'IQueryExecutor',
  ],
})
export class CommonModule {}