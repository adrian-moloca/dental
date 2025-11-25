import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PatientBalance } from './entities/patient-balance.entity';
import { Money } from '../../common/utils/money.utils';

interface TenantContext {
  tenantId: string;
  organizationId: string;
  clinicId: string;
  userId?: string;
}

@Injectable()
export class PatientBalancesService {
  private readonly logger = new Logger(PatientBalancesService.name);

  constructor(
    @InjectModel(PatientBalance.name)
    private patientBalanceModel: Model<PatientBalance>,
  ) {}

  async getOrCreate(patientId: string, context: TenantContext): Promise<PatientBalance> {
    let balance = await this.patientBalanceModel.findOne({
      patientId,
      tenantId: context.tenantId,
      organizationId: context.organizationId,
      clinicId: context.clinicId,
    });

    if (!balance) {
      balance = new this.patientBalanceModel({
        patientId,
        currentBalance: 0,
        totalInvoiced: 0,
        totalPaid: 0,
        overdueAmount: 0,
        currency: 'USD',
        ...context,
      });
      await balance.save();
    }

    return balance;
  }

  async recordInvoice(
    patientId: string,
    invoiceAmount: number,
    context: TenantContext,
  ): Promise<void> {
    const balance = await this.getOrCreate(patientId, context);

    const currentBalance = new Money(balance.currentBalance);
    const totalInvoiced = new Money(balance.totalInvoiced);
    const amount = new Money(invoiceAmount);

    balance.currentBalance = currentBalance.add(amount).toNumber();
    balance.totalInvoiced = totalInvoiced.add(amount).toNumber();

    await balance.save();

    this.logger.log(`Updated balance for patient ${patientId}: +${amount.toFixed()}`);
  }

  async recordPayment(
    patientId: string,
    paymentAmount: number,
    context: TenantContext,
  ): Promise<void> {
    const balance = await this.getOrCreate(patientId, context);

    const currentBalance = new Money(balance.currentBalance);
    const totalPaid = new Money(balance.totalPaid);
    const amount = new Money(paymentAmount);

    balance.currentBalance = currentBalance.subtract(amount).toNumber();
    balance.totalPaid = totalPaid.add(amount).toNumber();
    balance.lastPaymentDate = new Date();

    await balance.save();

    this.logger.log(`Updated balance for patient ${patientId}: -${amount.toFixed()}`);
  }

  async updateOverdueAmount(
    patientId: string,
    overdueAmount: number,
    context: TenantContext,
  ): Promise<void> {
    const balance = await this.getOrCreate(patientId, context);
    balance.overdueAmount = overdueAmount;
    await balance.save();
  }

  async getBalance(patientId: string, context: TenantContext): Promise<PatientBalance> {
    return this.getOrCreate(patientId, context);
  }
}
