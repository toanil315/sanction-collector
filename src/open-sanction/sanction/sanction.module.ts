import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SanctionEntity } from './sanction.entity';
import { BullModule } from '@nestjs/bull';
import { SanctionController } from './sanction.controller';
import { SanctionProcessor } from './sanction.processor';
import { SanctionRepository } from './sanction.repository';
import { SanctionEntitySubscriber } from './sanction.entity.subscriber';
import { DatasetModule } from '../dataset/dataset.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SanctionEntity]),
    BullModule.registerQueue({
      name: 'sanction-queue',
    }),
    DatasetModule,
  ],
  controllers: [SanctionController],
  providers: [SanctionProcessor, SanctionRepository, SanctionEntitySubscriber],
})
export class SanctionModule {}
