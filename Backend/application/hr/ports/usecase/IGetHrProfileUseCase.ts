import type { HrProfile } from "../../../../domain/entities/HrProfile";

export interface IGetHrProfileUseCase {
  execute(userId: string): Promise<HrProfile | null>;
}
