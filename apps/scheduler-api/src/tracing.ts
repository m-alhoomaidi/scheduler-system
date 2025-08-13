import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const otlpHttpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4318';

console.log('🔍 Initializing OpenTelemetry with endpoint:', `${otlpHttpEndpoint}/v1/traces`);

const sdk = new NodeSDK({
  serviceName: process.env.OTEL_SERVICE_NAME || 'scheduler-api',
  traceExporter: new OTLPTraceExporter({
    url: `${otlpHttpEndpoint}/v1/traces`,
  }),
  instrumentations: [getNodeAutoInstrumentations({
    '@opentelemetry/instrumentation-fs': {
      enabled: false,
    },
  })],
});

sdk.start();
console.log('✅ OpenTelemetry SDK started');


