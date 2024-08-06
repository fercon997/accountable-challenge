import { Entity } from '@common/entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as schema } from 'mongoose';
import { Role } from './role.entity';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User extends Entity {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: schema.Types.ObjectId, ref: 'Role', index: true })
  role?: Role;

  constructor(user: User) {
    super(user);
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
    this.password = user.password;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
