import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { MediaService } from '../services/media.service';
import { AppError, ErrorType } from '@/utils/errors';
import { authenticate } from '@/middleware/auth';

// ... rest of file ...
