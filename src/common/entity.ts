export abstract class Entity {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(entity: Entity) {
    this._id = entity._id;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}
