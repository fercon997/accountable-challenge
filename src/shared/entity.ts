export abstract class Entity {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(entity: Entity) {
    this._id = entity._id;
    this.createdAt = entity.createdAt ? new Date(entity.createdAt) : null;
    this.updatedAt = entity.updatedAt ? new Date(entity.updatedAt) : null;
  }
}
