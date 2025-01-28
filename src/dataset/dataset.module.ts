import { Module } from '@nestjs/common';
import { DatasetController } from './dataset.controller';
import { DatasetService } from './dataset.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatasetEntity } from './dataset.entity';
import { BullModule } from '@nestjs/bull';
import { DatasetProcessor } from './dataset.processor';
import { DatasetRepository } from './dataset.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([DatasetEntity]),
    BullModule.registerQueue({
      name: 'dataset-queue',
    }),
  ],
  controllers: [DatasetController],
  providers: [DatasetService, DatasetRepository, DatasetProcessor],
  exports: [DatasetService],
})
export class DatasetModule {}
