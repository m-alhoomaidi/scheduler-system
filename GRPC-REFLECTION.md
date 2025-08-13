this producer enables the client to know what the grpc server offer even without proto


- it should be disabled in production

grpcurl -plaintext localhost:50051 list
grpc.health.v1.Health
grpc.reflection.v1alpha.ServerReflection
scheduler.TaskEngine
moh-dev@moh-dev:~/Downloads$ grpcurl -plaintext localhost:50051 describe scheduler.TaskEngine
scheduler.TaskEngine is a service:
service TaskEngine {
  rpc DeleteTask ( .scheduler.DeleteTaskRequest ) returns ( .scheduler.DeleteTaskResponse );
  rpc ListTasks ( .scheduler.ListTasksRequest ) returns ( .scheduler.ListTasksResponse );
  rpc Ping ( .scheduler.PingRequest ) returns ( .scheduler.PingResponse );
  rpc RegisterTask ( .scheduler.RegisterTaskRequest ) returns ( .scheduler.RegisterTaskResponse );
}
