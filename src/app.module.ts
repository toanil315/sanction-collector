import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { DatasetModule } from './open-sanction/dataset/dataset.module';
import { SanctionModule } from './open-sanction/sanction/sanction.module';
import { EuSanctionModule } from './eu-sanction-tracker/eu-sanction.module';

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
    EuSanctionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
