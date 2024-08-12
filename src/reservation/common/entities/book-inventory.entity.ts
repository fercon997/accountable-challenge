import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as schema } from 'mongoose';
import { Entity } from '@shared/entity';
import { Query } from '@nestjs/common';

export type BookInventoryDocument = HydratedDocument<BookInventory>;

@Schema({ versionKey: 'version' })
export class BookInventory extends Entity {
  @Prop({ type: schema.Types.String, required: true, unique: true })
  bookId: string;

  @Prop({
    required: true,
    /* istanbul ignore next */
    validate(value: number): boolean {
      if (this instanceof Query) {
        return this.get('totalReserved') <= value;
      }
      return true;
    },
  })
  totalInventory: number;

  @Prop({ default: 0 })
  totalReserved: number;

  constructor(bookInventory: BookInventory) {
    super(bookInventory);
    this.bookId = bookInventory.bookId;
    this.totalInventory = bookInventory.totalInventory;
    this.totalReserved = bookInventory.totalReserved;
  }
}

export const BookInventorySchema = SchemaFactory.createForClass(BookInventory);
/* istanbul ignore next */
BookInventorySchema.pre('findOneAndUpdate', function (next) {
  this.setOptions({ runValidators: true });
  next();
});
