import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Checkin } from './checkin.entity';
import { Tenant } from '../tenants/tenant.entity';
import { CheckinService } from './checkin.service';
import { CheckinController } from './checkin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Checkin, Tenant])],
  providers: [CheckinService],
  controllers: [CheckinController],
  exports: [CheckinService],
})
export class CheckinModule {}
