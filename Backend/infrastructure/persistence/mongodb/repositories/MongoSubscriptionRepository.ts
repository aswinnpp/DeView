import { Collection, ObjectId, type Filter } from "mongodb";
import { BaseMongoRepository } from "./BaseMongoRepository";
import { ISubscription } from "../schemas/subscription";
import { Subscription } from "../../../../domain/admin/entities/Subscription";
import {
  type ISubscriptionListOptions,
  ISubscriptionRepository,
} from "../../../../application/admin/ports/repository/ISubscriptionRepository";

export class MongoSubscriptionRepository
  extends BaseMongoRepository<Subscription, ISubscription>
  implements ISubscriptionRepository {
  constructor(collection: Collection<ISubscription>) {
    super(collection);
  }

  async findAll(
    options?: ISubscriptionListOptions
  ): Promise<{ data: Subscription[]; total: number }> {
    const {
      search,
      status,
      duration,
      sortOrder = "desc",
      page = 1,
      limit,
    } = options ?? {};

    const filter: Filter<ISubscription> = {};

    if (status === "Active") {
      filter.isActive = true;
    }
    if (status === "Inactive") {
      filter.isActive = false;
    }

    if (duration) {
      filter.duration = duration;
    }

    if (search && search.trim()) {
      const f = filter as Filter<ISubscription> & {
        $or?: Array<{ name: { $regex: string; $options: string } }>;
      };
      f.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    const total = await this.collection.countDocuments(filter);
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    const cursor = this.collection
      .find(filter)
      .sort({ createdAt: sortDirection, _id: sortDirection });

    if (limit != null && limit > 0) {
      const safePage = Math.max(1, page);
      const skip = (safePage - 1) * limit;
      cursor.skip(skip).limit(limit);
    }

    const docs = await cursor.toArray();
    return {
      data: docs.map((d) => this.toDomain(d as ISubscription)),
      total,
    };
  }

  protected toDomain(doc: ISubscription): Subscription {
    return new Subscription(
      doc._id?.toString() || null,
      doc.name,
      doc.price,
      doc.duration,
      doc.interviewLimit,
      doc.interviewUnlimited,
      doc.jobPostLimit,
      doc.jobUnlimited,
      doc.hasAI,
      doc.isActive ?? true,
      doc.createdAt,
      doc.updatedAt
    );
  }

  protected toDocument(entity: Subscription): ISubscription {
    return {
      ...(entity.id && { _id: new ObjectId(entity.id) }),
      name: entity.name,
      price: entity.price,
      duration: entity.duration,
      interviewLimit: entity.interviewLimit,
      interviewUnlimited: entity.interviewUnlimited,
      jobPostLimit: entity.jobPostLimit,
      jobUnlimited: entity.jobUnlimited,
      hasAI: entity.hasAI,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
