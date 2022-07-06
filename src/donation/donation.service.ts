import { Injectable } from '@nestjs/common';
import { Donation } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { MakeDonation } from './dto';

@Injectable()
export class DonationService {
  constructor(private prisma: PrismaService) {}

  async makeDonation(userId: number, dto: MakeDonation): Promise<Donation> {
    const donation = await this.prisma.donation.create({
      data: { userId, ...dto },
    });

    return donation;
  }

  async getUserDonations(userId: number) {
    const donations = await this.prisma.donation.findMany({
      where: { userId },
    });

    const totalDonationByAllocation = await this.prisma.donation.groupBy({
      by: ['allocation'],
      _sum: {
        amount: true,
      },
      where: {
        userId,
      },
    });

    return { donations, totalDonationByAllocation };
  }
}
