import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Entity } from '@common/entity';
import { HydratedDocument, Types } from 'mongoose';
import { Permission } from './permission.entity';

export type RoleDocument = HydratedDocument<Role>;

@Schema()
export class Role extends Entity {
  @Prop()
  name: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Permission' }] })
  permissions?: Permission[];

  constructor(role: Role) {
    super(role);
    this.name = role.name;
    this.permissions = role.permissions;
  }
}

export const RoleSchema = SchemaFactory.createForClass(Role);
