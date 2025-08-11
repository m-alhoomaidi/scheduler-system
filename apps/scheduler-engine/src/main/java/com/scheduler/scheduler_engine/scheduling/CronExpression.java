package com.scheduler.scheduler_engine.scheduling;

import java.time.DayOfWeek;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Objects;


public final class CronExpression {
    private final FieldMatcher seconds;
    private final FieldMatcher minutes;
    private final FieldMatcher hours;
    private final FieldMatcher dayOfMonth;
    private final FieldMatcher month;
    private final FieldMatcher dayOfWeek;
    private final ZoneId zoneId;

    private CronExpression(FieldMatcher seconds,
                           FieldMatcher minutes,
                           FieldMatcher hours,
                           FieldMatcher dayOfMonth,
                           FieldMatcher month,
                           FieldMatcher dayOfWeek,
                           ZoneId zoneId) {
        this.seconds = seconds;
        this.minutes = minutes;
        this.hours = hours;
        this.dayOfMonth = dayOfMonth;
        this.month = month;
        this.dayOfWeek = dayOfWeek;
        this.zoneId = zoneId;
    }

    public static CronExpression parse(String expression) {
        return parse(expression, ZoneId.systemDefault());
    }

    public static CronExpression parse(String expression, ZoneId zoneId) {
        Objects.requireNonNull(expression, "expression");
        String[] parts = expression.trim().split("\\s+");
        if (parts.length != 6) {
            throw new IllegalArgumentException("Cron expression must have 6 fields (sec min hour dom month dow)");
        }
        return new CronExpression(
                FieldMatcher.parse(parts[0], 0, 59),
                FieldMatcher.parse(parts[1], 0, 59),
                FieldMatcher.parse(parts[2], 0, 23),
                FieldMatcher.parse(parts[3], 1, 31),
                FieldMatcher.parse(parts[4], 1, 12),
                FieldMatcher.parse(parts[5], 0, 6),
                zoneId
        );
    }

    public boolean matches(ZonedDateTime time) {
        ZonedDateTime t = time.withZoneSameInstant(zoneId);
        int sec = t.getSecond();
        int min = t.getMinute();
        int hr = t.getHour();
        int dom = t.getDayOfMonth();
        int mon = t.getMonthValue();
        int dow = toCronDow(t.getDayOfWeek());

        return seconds.matches(sec)
                && minutes.matches(min)
                && hours.matches(hr)
                && dayOfMonth.matches(dom)
                && month.matches(mon)
                && dayOfWeek.matches(dow);
    }

    public ZonedDateTime nextExecutionAfter(ZonedDateTime after) {
        // Simple approach: step by 1 second until a match is found.
        // This is sufficient for expressions like "*/5 * * * * *" used by this project.
        ZonedDateTime t = after.withZoneSameInstant(zoneId);
        // Start checking from the next second
        t = t.plusSeconds(1).withNano(0);

        // Safety cap: search up to 7 days ahead
        ZonedDateTime limit = t.plusDays(7);
        while (!t.isAfter(limit)) {
            if (matches(t)) {
                return t;
            }
            t = t.plusSeconds(1);
        }
        throw new IllegalStateException("Unable to find next execution time within 7 days for cron: " + toString());
    }

    private static int toCronDow(DayOfWeek dayOfWeek) {
        // Cron DOW: 0=Sunday
        int iso = dayOfWeek.getValue(); // 1=Mon..7=Sun
        return iso % 7; // 0 for Sunday, 1..6 for Mon..Sat
    }

    @Override
    public String toString() {
        return "CronExpression{" +
                "seconds=" + seconds +
                ", minutes=" + minutes +
                ", hours=" + hours +
                ", dayOfMonth=" + dayOfMonth +
                ", month=" + month +
                ", dayOfWeek=" + dayOfWeek +
                ", zoneId=" + zoneId +
                '}';
    }

    // Minimal field matcher
    private static final class FieldMatcher {
        enum Kind { ANY, EVERY, EXACT }
        final Kind kind;
        final int every;
        final int exact;
        final int min;
        final int max;

        private FieldMatcher(Kind kind, int every, int exact, int min, int max) {
            this.kind = kind;
            this.every = every;
            this.exact = exact;
            this.min = min;
            this.max = max;
        }

        static FieldMatcher parse(String token, int min, int max) {
            token = token.trim();
            if ("*".equals(token)) {
                return new FieldMatcher(Kind.ANY, 1, -1, min, max);
            }
            if (token.startsWith("*/")) {
                int step = Integer.parseInt(token.substring(2));
                if (step <= 0) throw new IllegalArgumentException("Invalid step: " + token);
                return new FieldMatcher(Kind.EVERY, step, -1, min, max);
            }
            // exact value
            int value = Integer.parseInt(token);
            if (value < min || value > max) {
                throw new IllegalArgumentException("Value out of range: " + token + " not in [" + min + "," + max + "]");
            }
            return new FieldMatcher(Kind.EXACT, 1, value, min, max);
        }

        boolean matches(int value) {
            if (value < min || value > max) return false;
            switch (kind) {
                case ANY:
                    return true;
                case EVERY:
                    return (value - min) % every == 0;
                case EXACT:
                    return value == exact;
                default:
                    return false;
            }
        }

        @Override
        public String toString() {
            return "FieldMatcher{" +
                    "kind=" + kind +
                    ", every=" + every +
                    ", exact=" + exact +
                    ", range=[" + min + ',' + max +
                    "]}";
        }
    }
}


