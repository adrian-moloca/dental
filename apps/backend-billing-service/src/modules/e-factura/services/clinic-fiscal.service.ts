import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout, catchError, throwError } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';

import { EFacturaSellerInfo } from '../interfaces/anaf-config.interface';

/**
 * Response from enterprise service for E-Factura seller info
 */
interface ClinicSellerInfoResponse {
  cui: string;
  legalName: string;
  tradeName?: string;
  regCom?: string;
  iban?: string;
  bankName?: string;
  address: {
    streetName: string;
    additionalStreetName?: string;
    city: string;
    county?: string;
    postalCode?: string;
    countryCode: string;
  };
  contact?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}

/**
 * Clinic Fiscal Service
 *
 * Fetches clinic fiscal settings from enterprise-service for E-Factura generation.
 * This service acts as a bridge between billing-service and enterprise-service.
 */
@Injectable()
export class ClinicFiscalService {
  private readonly logger = new Logger(ClinicFiscalService.name);
  private readonly enterpriseServiceUrl: string;
  private readonly requestTimeoutMs: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    // Get enterprise service URL from config or default to localhost
    this.enterpriseServiceUrl = this.configService.get<string>(
      'services.enterprise.url',
      'http://localhost:3307',
    );
    this.requestTimeoutMs = this.configService.get<number>(
      'services.enterprise.timeoutMs',
      5000,
    );
  }

  /**
   * Get seller information for E-Factura from enterprise service
   *
   * @param clinicId - The clinic ID to fetch fiscal settings for
   * @returns EFacturaSellerInfo formatted for UBL XML generation
   * @throws NotFoundException if clinic not found or fiscal settings incomplete
   */
  async getSellerInfo(clinicId: string): Promise<EFacturaSellerInfo> {
    this.logger.debug(`Fetching seller info for clinic ${clinicId}`);

    try {
      const response: AxiosResponse<ClinicSellerInfoResponse> = await firstValueFrom(
        this.httpService
          .get<ClinicSellerInfoResponse>(
            `${this.enterpriseServiceUrl}/api/v1/enterprise/clinics/${clinicId}/efactura-seller-info`,
          )
          .pipe(
            timeout(this.requestTimeoutMs),
            catchError((error: AxiosError) => {
              if (error.response?.status === 404) {
                return throwError(() => new NotFoundException(
                  `Clinic ${clinicId} not found or fiscal settings not configured`,
                ));
              }
              return throwError(() => error);
            }),
          ),
      );

      const data = response.data;

      // Map to EFacturaSellerInfo format
      const sellerInfo: EFacturaSellerInfo = {
        cui: this.normalizeCui(data.cui),
        legalName: data.legalName,
        tradeName: data.tradeName,
        regCom: data.regCom,
        iban: data.iban,
        bankName: data.bankName,
        address: {
          streetName: data.address.streetName,
          additionalStreetName: data.address.additionalStreetName,
          city: data.address.city,
          county: data.address.county,
          postalCode: data.address.postalCode,
          countryCode: data.address.countryCode || 'RO',
        },
        contact: data.contact
          ? {
              name: data.contact.name,
              phone: data.contact.phone,
              email: data.contact.email,
            }
          : undefined,
      };

      this.logger.debug(`Successfully fetched seller info for clinic ${clinicId}: CUI=${sellerInfo.cui}`);

      return sellerInfo;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Failed to fetch seller info for clinic ${clinicId}: ${error instanceof Error ? error.message : String(error)}`,
      );

      throw new NotFoundException(
        `Unable to fetch fiscal settings for clinic ${clinicId}. Ensure fiscal settings are configured in the enterprise service.`,
      );
    }
  }

  /**
   * Normalize CUI to include RO prefix
   */
  private normalizeCui(cui: string): string {
    if (!cui) return cui;
    return cui.startsWith('RO') ? cui : `RO${cui}`;
  }

  /**
   * Check if a clinic has valid E-Factura configuration
   *
   * @param clinicId - The clinic ID to check
   * @returns true if the clinic is configured for E-Factura
   */
  async isClinicConfiguredForEFactura(clinicId: string): Promise<boolean> {
    try {
      const sellerInfo = await this.getSellerInfo(clinicId);
      return !!(
        sellerInfo.cui &&
        sellerInfo.legalName &&
        sellerInfo.address?.streetName &&
        sellerInfo.address?.city
      );
    } catch {
      return false;
    }
  }
}
