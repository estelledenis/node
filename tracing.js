const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { trace } = require("@opentelemetry/api");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");

module.exports = (serviceName) => {
   // Update the Jaeger exporter configuration with your Jaeger server information
   const jaegerExporter = new JaegerExporter({
       serviceName: serviceName,
       endpoint: 'http://your-jaeger-collector-endpoint:14268/api/traces', // Replace with your Jaeger collector endpoint
   });

   // Create a NodeTracerProvider with Jaeger exporter
   const provider = new NodeTracerProvider({
       resource: new Resource({
           [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
       }),
   });

   // Add the Jaeger exporter to the provider as a span processor
   provider.addSpanProcessor(jaegerExporter);

   // Register the tracer provider
   provider.register();

   // Register instrumentations
   registerInstrumentations({
       instrumentations: [
           new HttpInstrumentation(),
           new ExpressInstrumentation(),
           new MongoDBInstrumentation(),
       ],
       tracerProvider: provider,
   });

   // Return the tracer
   return trace.getTracer(serviceName);
};
