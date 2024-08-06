import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as schema } from 'mongoose';
import { Entity } from '@shared/entity';

export type BookInventoryDocument = HydratedDocument<BookInventory>;

@Schema({ versionKey: 'version' })
export class BookInventory extends Entity {
  @Prop({ type: schema.Types.String, required: true, unique: true })
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
