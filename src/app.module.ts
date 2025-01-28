import { Module } from '@nestjs/common';
import { DatasetModule } from './dataset/dataset.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { SanctionModule } from './sanction/sanction.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      database: 'demo',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      synchronize: true,
      autoLoadEntities: true,
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
        password: 'redis123',
      },
    }),
    DatasetModule,
    SanctionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
