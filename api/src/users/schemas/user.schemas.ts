import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class User {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  updatedAt: string;

  @Prop()
  level: string;
}

export const UsersSchema = SchemaFactory.createForClass(User);