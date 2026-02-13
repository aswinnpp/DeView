import { Db } from "mongodb";
import { MongoUserRepository } from "../persistence/mongodb/repositories/MongoUserRepository";
import { MongoCompanyApprovalRepository } from "../persistence/mongodb/repositories/MongoCompanyApprovalRepository";
import { RedisOTPRepository } from "../persistence/redis/RedisOTPRepository";
import { RedisOAuthSessionRepository } from "../persistence/redis/RedisOAuthSessionRepository";
import { redisClient } from "../cache/RedisClient";
import { UserDocument } from "../persistence/mongodb/schemas/UserDocument";
import { CompanyApprovalDocument } from "../persistence/mongodb/schemas/CompanyApprovalDocument";
import { OAuthSessionPort } from "../../application/auth/ports/OAuthSessionPort";

export interface Repositories {
  userRepository: MongoUserRepository;
  otpRepository: RedisOTPRepository;
  companyApprovalRepository: MongoCompanyApprovalRepository;
  oauthSessionRepository: OAuthSessionPort;
}

export function createRepositories(db: Db): Repositories {
  const usersCollection = db.collection<UserDocument>("users");
  const companyApprovalsCollection =
    db.collection<CompanyApprovalDocument>("companyApprovals");

  const oauthSessionRepository = new RedisOAuthSessionRepository(redisClient);

  return {
    userRepository: new MongoUserRepository(usersCollection),
    otpRepository: new RedisOTPRepository(redisClient),
    companyApprovalRepository: new MongoCompanyApprovalRepository(
      companyApprovalsCollection
    ),

    oauthSessionRepository,
  };
}
