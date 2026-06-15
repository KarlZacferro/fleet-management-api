import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class InteractionLog extends Document {
  @Prop()
  method!: string; // Adicionado o ! aqui

  @Prop()
  url!: string; // Adicionado o ! aqui

  @Prop({ type: Object })
  body?: any; // Usei ? pois nem toda rota tem body (ex: GET)

  @Prop({ type: Object })
  user?: any; // Usei ? pois o usuário pode não estar logado

  @Prop()
  statusCode!: number; // Adicionado o ! aqui

  @Prop()
  duration!: string; // Adicionado o ! aqui
}

export const InteractionLogSchema = SchemaFactory.createForClass(InteractionLog);
