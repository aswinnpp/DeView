import { DomainError } from './DomainError';
export class ConflictError extends DomainError {
    constructor(message: string = 'Resource already exists') {
        super(message);
    }
}
