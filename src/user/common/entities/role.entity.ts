import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as schema } from 'mongoose';
import { Entity } from '@shared/entity';
import { Permission } from './permission.entity';

export type RoleDocument = HydratedDocument<Role>;

@Schema()
export class Role extends Entity {
  @Prop()
  name: string;

  @Prop({
    type: [{ type: schema.Types.ObjectId, ref: 'Permission', index: true }],
  })
  permissions?: Permission[];

  constructor(role: Role) {
    super(role);
    this.name = role.name;
    this.permissions = role.permissions;
  }
}

export const RoleSchema = SchemaFactory.createForClass(Role);
