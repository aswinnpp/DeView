import { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { HttpStatus } from "../../../shared/http/HttpStatus";
import { CreateCandidateProfileUseCase } from "../../../application/candidate/use-cases/CreateCandidateProfileUseCase";
import { GetCandidateProfileUseCase } from "../../../application/candidate/use-cases/GetCandidateProfileUseCase";
import { UpdateCandidateProfileUseCase } from "../../../application/candidate/use-cases/UpdateCandidateProfileUseCase";

interface ProfileBody {
    fullName: string;
    email?: string;
    phone: string;
    location: string;
    dateOfBirth: string;
    title?: string;
    currentCompany?: string;
    currentSalary?: string;
    experience?: string;
    bio: string;
    expectedSalary: string;
    noticePeriod: string;
    preferredWorkMode: string;
    preferredJobType: string;
    willingToRelocate: boolean;
    skills: string[];
    languages: string[];
    education: string;
    university: string;
    graduationYear: string;
    linkedinUrl?: string;
    githubUrl?: string;
    resumeUrl?: string;
}

export class CandidateProfileController {
    constructor(
        private readonly createProfileUseCase: CreateCandidateProfileUseCase,
        private readonly getProfileUseCase: GetCandidateProfileUseCase,
        private readonly updateProfileUseCase: UpdateCandidateProfileUseCase
    ) { }

    // GET /candidate/profile
    getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.currentUser;


        const profile = await this.getProfileUseCase.execute(user.userId);

        reply.send(success({ profile }));
    };

    createProfile = async (
        request: FastifyRequest<{ Body: ProfileBody }>,
        reply: FastifyReply
    ) => {
        const user = request.currentUser;
        const body = request.body;
      
        const result = await this.createProfileUseCase.execute({
            ...body,
            userId: user.userId,
            email: body.email ?? user.email,
        });

        reply.code(HttpStatus.CREATED).send(success(result));
    };

    // PATCH /candidate/profile
    updateProfile = async (
        request: FastifyRequest<{ Body: Partial<ProfileBody> }>,
        reply: FastifyReply
    ) => {
        const user = request.currentUser;
        const body = request.body;
      
        const result = await this.updateProfileUseCase.execute({
            userId: user.userId,
            ...body,
        });

        reply.send(success(result));
    };
}
