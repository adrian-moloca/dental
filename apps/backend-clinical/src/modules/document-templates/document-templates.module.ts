/**
 * Document Templates Module
 *
 * Provides legal document generation services for Romanian dental practices.
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { DocumentTemplatesController } from './document-templates.controller';
import { DocumentTemplatesService } from './document-templates.service';
import { DocumentRendererService } from './document-renderer.service';
import { DataMapperService } from './data-mapper.service';
import { DocumentTemplate, DocumentTemplateSchema } from './entities/document-template.schema';

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    MongooseModule.forFeature([{ name: DocumentTemplate.name, schema: DocumentTemplateSchema }]),
  ],
  controllers: [DocumentTemplatesController],
  providers: [DocumentTemplatesService, DocumentRendererService, DataMapperService],
  exports: [DocumentTemplatesService],
})
export class DocumentTemplatesModule {}
