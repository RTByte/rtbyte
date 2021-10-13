// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';

import '#utils/Sanitizer/initClean';
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-editable-commands';
import '@sapphire/plugin-i18next/register';
import '@sapphire/plugin-logger/register';
import { createColors } from 'colorette';
import 'reflect-metadata';
import { inspect } from 'util';

// Set default inspection depth
inspect.defaultOptions.depth = 1;

// Enable colorette
createColors({ useColor: true });
