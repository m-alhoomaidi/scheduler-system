# scheduler-system
A production-ready distributed task scheduler system composed of two microservices. Built using NestJS and Spring Boot.


RUN chmod +x ./node_modules/grpc-tools/bin/protoc && \
    chmod +x ./node_modules/grpc-tools/bin/grpc_node_plugin && \
    mkdir -p ./src/infrastructure/grpc/types && \
    yarn gen:proto && yarn build


docker run --rm -p 3001:3000   --add-host=host.docker.internal:host-gateway   -e MONGO_URI='mongodb://vrtx:vrtx@host.docker.internal:27018/scheduler-api?authSource=admin'   -e REDIS_URL='redis://:vrtx@host.docker.internal:6380'   -e ENGINE_GRPC_URL='host.docker.internal:50051'   -e JWT_SECRET='dev'   -e SWAGGER_USER='admin' -e SWAGGER_PASS='admin'   scheduler-api:local