import { describe, it } from 'vite-plus/test';
import { OpenAIService } from './openai.service';

describe('OpenAIService', () => {
  it.skip('test', async () => {
    const apiKey = '';
    const openaiService = OpenAIService.new({ apiKey });

    const result = await openaiService.parseSubscriptionIntent({
      userMessage: 'chatgpt 1000円',
      subscriptions: [
        {
          id: '1',
          name: 'test1',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          userId: '1',
          price: '1000',
          currency: 'Jpy',
          cycle: 'OneMonth',
          startedAt: new Date(),
          cancelledAt: null,
          expiredAt: null,
          description: null,
        },
        {
          id: '2',
          name: 'test2',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          userId: '1',
          price: '2000',
          currency: 'Jpy',
          cycle: 'OneMonth',
          startedAt: new Date(),
          cancelledAt: null,
          expiredAt: null,
          description: null,
        },
      ],
    });

    console.dir(result, { depth: null });
  });
});
