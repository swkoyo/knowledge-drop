import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

(async () => {
    try {
        console.log('Seeding Admin');

        const email = process.env.ADMIN_EMAIL as string;
        const password = process.env.ADMIN_PASSWORD as string;
        const username = email.split('@')[0];

        await prisma.user.upsert({
            where: {
                email
            },
            update: {},
            create: {
                email,
                username,
                role: 'ADMIN',
                password: bcrypt.hashSync(
                    password,
                    parseInt(process.env.BCRYPT_SALT_ROUNDS as string)
                )
            }
        });

        console.log('Seeding wikis');

        for (let i = 0; i < 30; i++) {
            await prisma.wiki.create({
                data: {
                    title: faker.hacker.noun(),
                    body: faker.lorem.paragraphs(2, '\n'),
                    header_url: faker.image.imageUrl(),
                    profile_url: faker.image.imageUrl(),
                    user: {
                        connect: {
                            id: 1
                        }
                    }
                }
            });
        }
    } catch (err) {
        console.error(err);
    }
})();
