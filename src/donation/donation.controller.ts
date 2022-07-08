import { Body, Controller, Get, Post } from '@nestjs/common';
import { Donation } from '@prisma/client';
import { GetUserId } from 'src/common/decorators';
import { DonationService } from './donation.service';
import { MakeDonation } from './dto';

@Controller('donations')
export class DonationController {
  constructor(private donationService: DonationService) {}

  @Post()
  async makeDonation(
    @Body() dto: MakeDonation,
    @GetUserId() userId: number,
  ): Promise<Donation> {
    return this.donationService.makeDonation(userId, dto);
  }

  @Get()
  async getUserDonations(@GetUserId() userId: number) {
    return this.donationService.getUserDonations(userId);
  }
}
