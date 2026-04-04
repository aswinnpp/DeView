import type { HrProfileStateResponse } from "../../mappers/HrProfileMapper";

export interface IGetHrProfileUseCase {
  execute(userId: string): Promise<HrProfileStateResponse>;
}
