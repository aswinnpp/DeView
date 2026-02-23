import { Collection, ObjectId } from "mongodb";


export abstract class BaseMongoRepository<TEntity extends { id?: string | null }> {
  protected constructor(protected collection: Collection<any>) {}

  protected abstract toDomain(doc: any): TEntity;
  protected abstract toDocument(entity: TEntity): any;

  async findById(id: string): Promise<TEntity | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    return doc ? this.toDomain(doc) : null;
  }

  async save(entity: TEntity): Promise<void> {
    const doc = this.toDocument(entity);

    if (!entity.id) {
      await this.collection.insertOne(doc);
      return;
    }

    const { _id, ...update } = doc as any;
    await this.collection.updateOne({ _id }, { $set: update });
  }
}
