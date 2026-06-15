import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ collection: 'audit_logs', timestamps: false })
export class AuditLog {
  @Prop({ required: true })
  method!: string; // O '!' resolve o erro da imagem

  @Prop({ required: true })
  route!: string;

  @Prop({ required: true })
  resource!: string;

  @Prop({ required: true })
  action!: string;

  @Prop({ type: String, default: null })
  userId!: string | null;

  @Prop({ type: String, default: null })
  userEmail!: string | null;

  @Prop({ type: Object, default: {} })
  params!: Record<string, any>;

  @Prop({ type: Object, default: {} })
  requestBody!: Record<string, any>;

  @Prop({ required: true })
  statusCode!: number;

  @Prop({ required: true })
  success!: boolean;

  @Prop({ type: String, default: null })
  errorMessage!: string | null;

  @Prop({ type: String, default: null })
  ipAddress!: string | null;

  @Prop({ type: String, default: null })
  userAgent!: string | null;

  @Prop({ required: true })
  durationMs!: number;

  @Prop({ required: true, default: () => new Date() })
  timestamp!: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
