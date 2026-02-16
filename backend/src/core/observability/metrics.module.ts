import { Module } from '@nestjs/common';
import { PrometheusModule, makeCounterProvider } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [
    makeCounterProvider({
      name: 'ai_token_cost_cumulative',
      help: 'Cumulative cost of AI tokens in USD',
      labelNames: ['model', 'user_id'],
    }),
    makeCounterProvider({
        name: 'user_churn_risk',
        help: 'Counter for high-risk churn behaviors',
        labelNames: ['user_id', 'reason'],
    })
  ],
  exports: [PrometheusModule],
})
export class MetricsModule {}
