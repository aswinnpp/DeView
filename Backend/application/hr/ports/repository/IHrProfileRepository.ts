import { HrProfile } from "../../../../domain/entities/HrProfile";

export interface IHrProfileRepository {
  findByUserId(userId: string): Promise<HrProfile | null>;
  save(profile: HrProfile): Promise<void>;
}
