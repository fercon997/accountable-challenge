import { Entity } from '@common/entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PermissionMap } from '@common/types';

export type PermissionDocument = HydratedDocument<Permission>;

@Schema({ timestamps: true })
export class Permission extends Entity {
  @Prop({ enum: PermissionMap })
  name: string;

  constructor(permission: Permission) {
    super(permission);
    this.name = permission.name;
  }
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
