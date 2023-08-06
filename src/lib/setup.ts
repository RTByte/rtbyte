// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';

import '#utils/Sanitizer/initClean';
import { PrismaClient } from '@prisma/client';
import { container } from '@sapphire/framework';
import '@sapphire/plugin-logger/register';
import { createColors } from 'colorette';
import { inspect } from 'util';

const prisma = new PrismaClient();

inspect.defaultOptions.depth = 1;
createColors({ useColor: true });
container.prisma = prisma;

declare module '@sapphire/pieces' {
	interface Container {
		prisma: typeof prisma;
	}
}