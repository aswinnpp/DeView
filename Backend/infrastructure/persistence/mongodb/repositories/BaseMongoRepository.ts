import type { Collection, Document, Filter, OptionalUnlessRequiredId } from "mongodb";
import { ObjectId } from "mongodb";

export abstract class BaseMongoRepository<
  TEntity extends { id?: string | null },
  TDoc extends Document
> {
  protected constructor(protected collection: Collection<TDoc>) {}

  protected abstract toDomain(doc: TDoc): TEntity;
  protected abstract toDocument(entity: TEntity): TDoc;

  async findById(id: string): Promise<TEntity | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) } as Filter<TDoc>);
    return doc ? this.toDomain(doc as TDoc) : null;
  }

  async save(entity: TEntity): Promise<void> {
    const doc = this.toDocument(entity);

    if (!entity.id) {
      await this.collection.insertOne(doc as OptionalUnlessRequiredId<TDoc>);
      return;
    }

    const { _id, ...update } = doc as TDoc & { _id?: ObjectId };
    await this.collection.updateOne(
      { _id } as Filter<TDoc>,
      { $set: update as Partial<TDoc> }
    );
  }
}
