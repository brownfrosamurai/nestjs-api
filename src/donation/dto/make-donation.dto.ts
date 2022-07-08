import { Allocation } from '@prisma/client';

export class MakeDonation {
  amount: number;
  allocation?: Allocation;
}
