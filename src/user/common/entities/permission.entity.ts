import { Entity } from '@common/entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PermissionDocument = HydratedDocument<Permission>;

@Schema({ timestamps: true })
export class Permission extends Entity {
  @Prop()
  name: string;

  constructor(permission: Permission) {
    super(permission);
    this.name = permission.name;
  }
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
