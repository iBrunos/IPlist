import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class User {
  @Prop()
  name: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  updatedAt: string;

  @Prop()
  permission: string;
}

export const UsersSchema = SchemaFactory.createForClass(User);