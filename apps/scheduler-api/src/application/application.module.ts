import { InfrastructureModule } from "@/infrastructure/infrastructure.module";
import { Module } from "@nestjs/common";

@Module({
    imports:[InfrastructureModule],
    exports:[InfrastructureModule]
})
export class ApplicationModule{}