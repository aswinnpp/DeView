import type { Collection, Filter } from "mongodb";
import { ObjectId } from "mongodb";
import type { INotificationRepository } from "../../../../application/notification/ports/repository/INotificationRepository.js";
import { Notification } from "../../../../domain/notification/entities/Notification.js";
import type { INotificationDocument } from "../schemas/NotificationDocument.js";

function toDomain(doc: INotificationDocument): Notification {
  return new Notification(
    doc._id?.toString() ?? null,
    doc.recipientType,
    doc.recipientId,
    doc.type,
    doc.title,
    doc.message,
    doc.data,
    doc.readAt,
    doc.createdAt,
  );
}

export class MongoNotificationRepository implements INotificationRepository {
  constructor(private readonly _collection: Collection<INotificationDocument>) {}

  async create(input: {
    recipientType: INotificationDocument["recipientType"];
    recipientId: string;
    type: INotificationDocument["type"];
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }): Promise<Notification> {
    const now = new Date();
    const doc: INotificationDocument = {
      recipientType: input.recipientType,
      recipientId: input.recipientId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data,
      createdAt: now,
    };

    const res = await this._collection.insertOne(doc);
    return toDomain({ ...doc, _id: res.insertedId });
  }

  async listByRecipient(input: {
    recipientType: INotificationDocument["recipientType"];
    recipientId: string;
    unreadOnly?: boolean;
    limit?: number;
  }): Promise<Notification[]> {
    const { recipientType, recipientId, unreadOnly = true, limit = 50 } = input;
    const safeLimit = Math.max(1, Math.min(200, limit));

    const filter: Filter<INotificationDocument> = { recipientType, recipientId };
    if (unreadOnly) filter.readAt = { $exists: false };

    const docs = await this._collection
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .toArray();

    return docs.map(toDomain);
  }

  async markRead(input: {
    recipientType: INotificationDocument["recipientType"];
    recipientId: string;
    notificationId: string;
  }): Promise<boolean> {
    let _id: ObjectId;
    try {
      _id = new ObjectId(input.notificationId);
    } catch {
      return false;
    }

    const res = await this._collection.updateOne(
      {
        _id,
        recipientType: input.recipientType,
        recipientId: input.recipientId,
        readAt: { $exists: false },
      },
      { $set: { readAt: new Date() } },
    );

    return res.matchedCount > 0;
  }

  async delete(input: {
    recipientType: INotificationDocument["recipientType"];
    recipientId: string;
    notificationId: string;
  }): Promise<boolean> {
    let _id: ObjectId;
    try {
      _id = new ObjectId(input.notificationId);
    } catch {
      return false;
    }

    const res = await this._collection.deleteOne({
      _id,
      recipientType: input.recipientType,
      recipientId: input.recipientId,
    });
    return res.deletedCount > 0;
  }
}

