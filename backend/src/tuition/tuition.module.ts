import { Module } from '@nestjs/common';

import { TuitionController } from './tuition.controller';
import { TuitionService } from './tuition.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [TuitionController],
  providers: [TuitionService],
})
export class TuitionModule {}
