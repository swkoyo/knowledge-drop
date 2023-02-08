import {
    INestApplication,
    Injectable,
    Logger,
    OnModuleInit
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    logger: Logger = new Logger(PrismaService.name);

    constructor(private configService: ConfigService) {
        super();
    }

    generatePaginationQuery(limit: number, page: number) {
        return {
            take: limit,
            skip: limit * (page - 1)
        };
    }

    async onModuleInit() {
        await this.$connect();
        this.logger.log('onModuleInit prisma connected');
        this.$use(async (params, next) => {
            if (params.action === 'create' && params.model === 'User') {
                const user = params.args.data;
                const hashedPassword = await bcrypt.hash(
                    user.password,
                    this.configService.get<number>('SALT_ROUNDS')
                );
                user.password = hashedPassword;
                params.args.data = user;
            }
            return next(params);
        });
    }

    async enableShutdownHooks(app: INestApplication) {
        this.$on('beforeExit', async () => {
            this.logger.log('enableShutdownHooks prisma closing');
            await app.close();
        });
    }

    async truncate() {
        const records = await this.$queryRawUnsafe(`
			SELECT tablename
			FROM pg_tables
			WHERE schemaname = 'public'
		`);
        for (const record of records as any) {
            await this.truncateTable(record['tablename']);
        }
    }

    async truncateTable(tablename) {
        if (tablename === undefined || tablename === '_prisma_migrations') {
            return;
        }
        try {
            await this.$executeRawUnsafe(
                `TRUNCATE TABLE "public"."${tablename}" CASCADE;`
            );
        } catch (error) {
            console.log({ error });
        }
    }

    async resetSequences() {
        const results = await this.$queryRawUnsafe(
            `SELECT c.relname
				FROM pg_class AS c
					JOIN pg_namespace AS n ON c.relnamespace = n.oid
				WHERE c.relkind = 'S'
				AND n.nspname = 'public'`
        );
        for (const record of results as any) {
            // eslint-disable-next-line no-await-in-loop
            await this.$executeRawUnsafe(
                `ALTER SEQUENCE "public"."${record['relname']}" RESTART WITH 1;`
            );
        }
    }
}
