package com.scheduler.scheduler_engine.scheduling;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.time.ZoneId;
import java.time.ZonedDateTime;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("CronExpression Domain Logic Tests")
class CronExpressionTest {

    @Nested
    @DisplayName("Cron Expression Parsing")
    class CronExpressionParsing {

        @Test
        @DisplayName("Should parse valid cron expression")
        void shouldParseValidCronExpression() {
            String cronExpr = "*/5 * * * * *"; // Every 5 seconds
            
            assertDoesNotThrow(() -> {
                CronExpression cron = CronExpression.parse(cronExpr);
                assertNotNull(cron);
            });
        }

        @Test
        @DisplayName("Should parse cron expression with timezone")
        void shouldParseCronExpressionWithTimezone() {
            String cronExpr = "0 0 12 * * *"; // Daily at noon
            ZoneId timezone = ZoneId.of("America/New_York");
            
            assertDoesNotThrow(() -> {
                CronExpression cron = CronExpression.parse(cronExpr, timezone);
                assertNotNull(cron);
            });
        }

        @ParameterizedTest
        @ValueSource(strings = {
            "*/5 * * * * *",      // Every 5 seconds
            "0 */10 * * * *",     // Every 10 minutes
            "0 0 */2 * * *",      // Every 2 hours
            "0 0 0 * * 1",        // Every Monday at midnight
            "0 30 9 1 * *",       // 9:30 AM on 1st of every month
            "* * * * * *"         // Every second
        })
        @DisplayName("Should parse various valid cron expressions")
        void shouldParseVariousValidCronExpressions(String cronExpr) {
            assertDoesNotThrow(() -> {
                CronExpression cron = CronExpression.parse(cronExpr);
                assertNotNull(cron);
            });
        }

        @Test
        @DisplayName("Should throw exception for null expression")
        void shouldThrowExceptionForNullExpression() {
            assertThrows(NullPointerException.class, () -> {
                CronExpression.parse(null);
            });
        }

        @ParameterizedTest
        @ValueSource(strings = {
            "",                   // Empty string
            "* * * * *",         // Too few fields
            "* * * * * * *",     // Too many fields
            "invalid",           // Invalid format
            "60 * * * * *",      // Invalid second (>59)
            "* 60 * * * *",      // Invalid minute (>59)
            "* * 25 * * *",      // Invalid hour (>23)
            "* * * 32 * *",      // Invalid day of month (>31)
            "* * * * 13 *",      // Invalid month (>12)
            "* * * * * 7"        // Invalid day of week (>6)
        })
        @DisplayName("Should throw exception for invalid cron expressions")
        void shouldThrowExceptionForInvalidCronExpressions(String cronExpr) {
            assertThrows(IllegalArgumentException.class, () -> {
                CronExpression.parse(cronExpr);
            });
        }
    }

    @Nested
    @DisplayName("Cron Expression Matching")
    class CronExpressionMatching {

        @Test
        @DisplayName("Should match every second pattern")
        void shouldMatchEverySecondPattern() {
            CronExpression cron = CronExpression.parse("* * * * * *");
            ZonedDateTime now = ZonedDateTime.now();
            
            assertTrue(cron.matches(now));
            assertTrue(cron.matches(now.plusSeconds(1)));
            assertTrue(cron.matches(now.plusMinutes(1)));
        }

        @Test
        @DisplayName("Should match every 5 seconds pattern")
        void shouldMatchEvery5SecondsPattern() {
            CronExpression cron = CronExpression.parse("*/5 * * * * *");
            
            // Test specific times that should match
            ZonedDateTime time1 = ZonedDateTime.of(2024, 1, 1, 12, 0, 0, 0, ZoneId.systemDefault());
            ZonedDateTime time2 = ZonedDateTime.of(2024, 1, 1, 12, 0, 5, 0, ZoneId.systemDefault());
            ZonedDateTime time3 = ZonedDateTime.of(2024, 1, 1, 12, 0, 10, 0, ZoneId.systemDefault());
            
            assertTrue(cron.matches(time1));
            assertTrue(cron.matches(time2));
            assertTrue(cron.matches(time3));
            
            // Test times that should not match
            ZonedDateTime time4 = ZonedDateTime.of(2024, 1, 1, 12, 0, 1, 0, ZoneId.systemDefault());
            ZonedDateTime time5 = ZonedDateTime.of(2024, 1, 1, 12, 0, 7, 0, ZoneId.systemDefault());
            
            assertFalse(cron.matches(time4));
            assertFalse(cron.matches(time5));
        }

        @Test
        @DisplayName("Should match specific time pattern")
        void shouldMatchSpecificTimePattern() {
            CronExpression cron = CronExpression.parse("0 30 14 * * *"); // 2:30 PM daily
            
            ZonedDateTime matchingTime = ZonedDateTime.of(2024, 1, 15, 14, 30, 0, 0, ZoneId.systemDefault());
            ZonedDateTime nonMatchingTime = ZonedDateTime.of(2024, 1, 15, 14, 31, 0, 0, ZoneId.systemDefault());
            
            assertTrue(cron.matches(matchingTime));
            assertFalse(cron.matches(nonMatchingTime));
        }

        @Test
        @DisplayName("Should handle timezone conversion in matching")
        void shouldHandleTimezoneConversionInMatching() {
            ZoneId utc = ZoneId.of("UTC");
            ZoneId est = ZoneId.of("America/New_York");
            
            CronExpression cronUtc = CronExpression.parse("0 0 12 * * *", utc); // Noon UTC
            
            // 12:00 UTC = 7:00 EST (winter) or 8:00 EDT (summer)
            ZonedDateTime utcNoon = ZonedDateTime.of(2024, 1, 1, 12, 0, 0, 0, utc);
            ZonedDateTime estEquivalent = utcNoon.withZoneSameInstant(est);
            
            assertTrue(cronUtc.matches(utcNoon));
            assertTrue(cronUtc.matches(estEquivalent)); // Should match because it's converted to UTC internally
        }
    }

    @Nested
    @DisplayName("Next Execution Calculation")
    class NextExecutionCalculation {

        @Test
        @DisplayName("Should calculate next execution for every 5 seconds")
        void shouldCalculateNextExecutionForEvery5Seconds() {
            CronExpression cron = CronExpression.parse("*/5 * * * * *");
            ZonedDateTime now = ZonedDateTime.of(2024, 1, 1, 12, 0, 0, 0, ZoneId.systemDefault());
            
            ZonedDateTime next = cron.nextExecutionAfter(now);
            
            assertNotNull(next);
            assertTrue(next.isAfter(now));
            assertEquals(5, next.getSecond()); // Should be at 5 seconds
        }

        @Test
        @DisplayName("Should calculate next execution for every minute")
        void shouldCalculateNextExecutionForEveryMinute() {
            CronExpression cron = CronExpression.parse("0 * * * * *");
            ZonedDateTime now = ZonedDateTime.of(2024, 1, 1, 12, 0, 30, 0, ZoneId.systemDefault());
            
            ZonedDateTime next = cron.nextExecutionAfter(now);
            
            assertNotNull(next);
            assertTrue(next.isAfter(now));
            assertEquals(1, next.getMinute()); // Should be at minute 1
            assertEquals(0, next.getSecond()); // Should be at 0 seconds
        }

        @Test
        @DisplayName("Should calculate next execution for daily at specific time")
        void shouldCalculateNextExecutionForDailyAtSpecificTime() {
            CronExpression cron = CronExpression.parse("0 0 9 * * *"); // 9 AM daily
            ZonedDateTime now = ZonedDateTime.of(2024, 1, 1, 10, 0, 0, 0, ZoneId.systemDefault());
            
            ZonedDateTime next = cron.nextExecutionAfter(now);
            
            assertNotNull(next);
            assertTrue(next.isAfter(now));
            assertEquals(2, next.getDayOfMonth()); // Should be next day
            assertEquals(9, next.getHour()); // Should be at 9 AM
            assertEquals(0, next.getMinute());
            assertEquals(0, next.getSecond());
        }

        @Test
        @DisplayName("Should handle case when next execution is same day")
        void shouldHandleCaseWhenNextExecutionIsSameDay() {
            CronExpression cron = CronExpression.parse("0 0 15 * * *"); // 3 PM daily
            ZonedDateTime now = ZonedDateTime.of(2024, 1, 1, 10, 0, 0, 0, ZoneId.systemDefault());
            
            ZonedDateTime next = cron.nextExecutionAfter(now);
            
            assertNotNull(next);
            assertTrue(next.isAfter(now));
            assertEquals(1, next.getDayOfMonth()); // Should be same day
            assertEquals(15, next.getHour()); // Should be at 3 PM
        }

        @Test
        @DisplayName("Should throw exception for impossible cron expression")
        void shouldThrowExceptionForImpossibleCronExpression() {
            // This creates a cron that can never match (February 30th)
            // But since our simple implementation doesn't validate dates, 
            // we'll test with a more realistic scenario that our implementation handles
            CronExpression cron = CronExpression.parse("0 0 0 31 2 *"); // Feb 31st (impossible)
            ZonedDateTime now = ZonedDateTime.now();
            
            // Our implementation should throw after searching for 7 days
            assertThrows(IllegalStateException.class, () -> {
                cron.nextExecutionAfter(now);
            });
        }
    }

    @Nested
    @DisplayName("Field Matcher Logic")
    class FieldMatcherLogic {

        @Test
        @DisplayName("Should handle wildcard field matching")
        void shouldHandleWildcardFieldMatching() {
            CronExpression cron = CronExpression.parse("* 30 * * * *");
            
            // Should match any second at 30 minutes past any hour
            ZonedDateTime time1 = ZonedDateTime.of(2024, 1, 1, 10, 30, 15, 0, ZoneId.systemDefault());
            ZonedDateTime time2 = ZonedDateTime.of(2024, 1, 1, 14, 30, 45, 0, ZoneId.systemDefault());
            ZonedDateTime time3 = ZonedDateTime.of(2024, 1, 1, 10, 31, 15, 0, ZoneId.systemDefault());
            
            assertTrue(cron.matches(time1));
            assertTrue(cron.matches(time2));
            assertFalse(cron.matches(time3)); // Wrong minute
        }

        @Test
        @DisplayName("Should handle exact value field matching")
        void shouldHandleExactValueFieldMatching() {
            CronExpression cron = CronExpression.parse("15 30 14 * * *"); // 2:30:15 PM
            
            ZonedDateTime exactTime = ZonedDateTime.of(2024, 1, 1, 14, 30, 15, 0, ZoneId.systemDefault());
            ZonedDateTime wrongSecond = ZonedDateTime.of(2024, 1, 1, 14, 30, 16, 0, ZoneId.systemDefault());
            ZonedDateTime wrongMinute = ZonedDateTime.of(2024, 1, 1, 14, 31, 15, 0, ZoneId.systemDefault());
            
            assertTrue(cron.matches(exactTime));
            assertFalse(cron.matches(wrongSecond));
            assertFalse(cron.matches(wrongMinute));
        }

        @Test
        @DisplayName("Should handle step value field matching")
        void shouldHandleStepValueFieldMatching() {
            CronExpression cron = CronExpression.parse("*/10 */15 * * * *"); // Every 10 seconds, every 15 minutes
            
            ZonedDateTime match1 = ZonedDateTime.of(2024, 1, 1, 10, 0, 0, 0, ZoneId.systemDefault());
            ZonedDateTime match2 = ZonedDateTime.of(2024, 1, 1, 10, 15, 10, 0, ZoneId.systemDefault());
            ZonedDateTime match3 = ZonedDateTime.of(2024, 1, 1, 10, 30, 20, 0, ZoneId.systemDefault());
            
            ZonedDateTime noMatch1 = ZonedDateTime.of(2024, 1, 1, 10, 1, 0, 0, ZoneId.systemDefault()); // Wrong minute
            ZonedDateTime noMatch2 = ZonedDateTime.of(2024, 1, 1, 10, 15, 5, 0, ZoneId.systemDefault()); // Wrong second
            
            assertTrue(cron.matches(match1));
            assertTrue(cron.matches(match2));
            assertTrue(cron.matches(match3));
            assertFalse(cron.matches(noMatch1));
            assertFalse(cron.matches(noMatch2));
        }
    }

    @Nested
    @DisplayName("Day of Week Conversion")
    class DayOfWeekConversion {

        @Test
        @DisplayName("Should handle Sunday as day 0")
        void shouldHandleSundayAsDay0() {
            CronExpression cron = CronExpression.parse("0 0 0 * * 0"); // Sunday at midnight
            
            // Create a Sunday
            ZonedDateTime sunday = ZonedDateTime.of(2024, 1, 7, 0, 0, 0, 0, ZoneId.systemDefault()); // Jan 7, 2024 is a Sunday
            ZonedDateTime monday = ZonedDateTime.of(2024, 1, 8, 0, 0, 0, 0, ZoneId.systemDefault()); // Jan 8, 2024 is a Monday
            
            assertTrue(cron.matches(sunday));
            assertFalse(cron.matches(monday));
        }

        @Test
        @DisplayName("Should handle Monday as day 1")
        void shouldHandleMondayAsDay1() {
            CronExpression cron = CronExpression.parse("0 0 0 * * 1"); // Monday at midnight
            
            ZonedDateTime sunday = ZonedDateTime.of(2024, 1, 7, 0, 0, 0, 0, ZoneId.systemDefault());
            ZonedDateTime monday = ZonedDateTime.of(2024, 1, 8, 0, 0, 0, 0, ZoneId.systemDefault());
            
            assertFalse(cron.matches(sunday));
            assertTrue(cron.matches(monday));
        }
    }

    @Nested
    @DisplayName("ToString Method")
    class ToStringMethod {

        @Test
        @DisplayName("Should return meaningful string representation")
        void shouldReturnMeaningfulStringRepresentation() {
            CronExpression cron = CronExpression.parse("*/5 * * * * *");
            
            String result = cron.toString();
            
            assertNotNull(result);
            assertTrue(result.contains("CronExpression"));
            assertTrue(result.contains("seconds"));
            assertTrue(result.contains("minutes"));
            assertTrue(result.contains("hours"));
        }
    }
}
