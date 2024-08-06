import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Entity } from '@shared/entity';
import { PermissionMap } from '@shared/types';

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
