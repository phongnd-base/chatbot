import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { Provider } from '@prisma/client';
import { MODEL_REGISTRY } from './models.constants';

@Controller('ai')
export class AiController {
  @Get('models')
  list(@Query('provider') provider?: string) {
    // Allow case-insensitive provider query; validate against Prisma enum
    if (provider) {
      const normalized = provider.toUpperCase() as Provider;
      if (!Object.values(Provider).includes(normalized)) {
        throw new BadRequestException('Invalid provider');
      }
      const found = MODEL_REGISTRY.find((p) => p.provider === normalized);
      return { provider: normalized, models: found?.models ?? [] };
    }
    // return a flattened list for convenience too
    const models = MODEL_REGISTRY.flatMap((p) => p.models);
    return { modelsByProvider: MODEL_REGISTRY, models };
  }
}
