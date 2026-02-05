import { FastifyInstance } from 'fastify';
import { Db } from 'mongodb';
import { createRepositories, Repositories } from './repositories.js';
import { createServices, Services } from './services.js';
import { createUseCases, UseCases } from './useCases.js';
import { createControllers, Controllers } from './controllers.js';

export interface Container {
    repositories: Repositories;
    services: Services;
    useCases: UseCases;
    controllers: Controllers;
}

export function createContainer(fastify: FastifyInstance, db: Db): Container {
    const repositories = createRepositories(db);
    const services = createServices(fastify, repositories);
    const useCases = createUseCases(repositories, services);
    const controllers = createControllers(useCases, services, repositories);

    return {
        repositories,
        services,
        useCases,
        controllers,
    };
}
