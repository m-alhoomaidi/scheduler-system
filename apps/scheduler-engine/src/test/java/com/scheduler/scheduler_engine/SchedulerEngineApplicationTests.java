package com.scheduler.scheduler_engine;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
@SpringBootTest(
    classes = TestConfiguration.class,
    webEnvironment = SpringBootTest.WebEnvironment.NONE,
    properties = {
        "grpc.server.enabled=false",
        "scheduler.enabled=false"
    }
)
@ActiveProfiles("test")
class SchedulerEngineApplicationTests {

	@Test
	void contextLoads() {
	}

}
