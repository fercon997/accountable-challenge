export abstract class Entity {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(entity: Entity) {
    this._id = entity._id ? entity._id.toString() : null;
    this.createdAt = entity.createdAt ? new Date(entity.createdAt) : null;
    this.updatedAt = entity.updatedAt ? new Date(entity.updatedAt) : null;
  }
}
