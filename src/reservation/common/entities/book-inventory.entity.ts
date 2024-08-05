import { Entity } from '@common/entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BookInventoryDocument = HydratedDocument<BookInventory>;

@Schema()
export class BookInventory extends Entity {
  @Prop({ type: Types.ObjectId, required: true, unique: true })
  bookId: string;

  @Prop()
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
