import { Entity } from '@common/entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role } from './role.entity';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User extends Entity {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop({ type: Types.ObjectId, ref: 'Role' })
  role?: Role;

  constructor(user: User) {
    super(user);
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
