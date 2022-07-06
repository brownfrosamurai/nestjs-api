import { Module } from '@nestjs/common';
import { DonationService } from './donation.service';
import { DonationController } from './donation.controller';

@Module({
  providers: [DonationService],
  controllers: [DonationController],
})
export class DonationModule {}
