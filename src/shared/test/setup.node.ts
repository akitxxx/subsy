import { config } from 'dotenv';
import ws from 'ws';
import { configureNeonLocal } from '@/api/shared/lib/db/neonLocal';

config({
  path: '.env.test',
});

configureNeonLocal({ wsConstructor: ws });
