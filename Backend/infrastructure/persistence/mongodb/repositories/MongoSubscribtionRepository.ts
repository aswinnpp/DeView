import { Collection, ObjectId, type Filter } from "mongodb";
import { BaseMongoRepository } from "./BaseMongoRepository";
import { ISubscribtion } from "../schemas/subscribtion";
import { Subscribtion } from "../../../../domain/admin/entities/Subscribtion";
import {
  type ISubscribtionListOptions,
  ISubscribtionRepository,
} from "../../../../application/admin/ports/repository/ISubscribtionRepository";

export class MongoSubscribtionRepository
  extends BaseMongoRepository<Subscribtion, ISubscribtion>
  implements ISubscribtionRepository {
  constructor(collection: Collection<ISubscribtion>) {
    super(collection);
  }

  async findAll(
    options?: ISubscribtionListOptions
  ): Promise<{ data: Subscribtion[]; total: number }> {
    const {
      search,
      status,
      duration,
      sortOrder = "desc",
      page = 1,
      limit,
    } = options ?? {};

    const filter: Filter<ISubscribtion> = {};

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
      const f = filter as Filter<ISubscribtion> & {
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
      data: docs.map((d) => this.toDomain(d as ISubscribtion)),
      total,
    };
  }

  protected toDomain(doc: ISubscribtion): Subscribtion {
    return new Subscribtion(
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

  protected toDocument(entity: Subscribtion): ISubscribtion {
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

