import { Global, Module } from '@nestjs/common';
import { CursorPaginationService } from './services/cursor-pagination.service';

@Global()
@Module({
  providers: [CursorPaginationService],
  exports: [CursorPaginationService],
})
export class CommonModule {}