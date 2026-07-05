import { describe, it, expect, beforeEach } from "vitest";
import { logger } from "../error-logger";

beforeEach(() => {
  logger.clear();
});

describe("logger", () => {
  it("stores log entries", () => {
    logger.info("test message");
    expect(logger.getEntries()).toHaveLength(1);
    expect(logger.getEntries()[0].message).toBe("test message");
  });

  it("stores different log levels", () => {
    logger.debug("debug msg");
    logger.info("info msg");
    logger.warn("warn msg");
    logger.error("error msg");
    expect(logger.getEntries()).toHaveLength(4);
    expect(logger.getEntries().map((e) => e.level)).toEqual(["debug", "info", "warn", "error"]);
  });

  it("stores context", () => {
    logger.error("failed", { incidentId: "INC-001", code: 500 });
    const entry = logger.getEntries()[0];
    expect(entry.context?.incidentId).toBe("INC-001");
    expect(entry.context?.code).toBe(500);
  });

  it("clears entries", () => {
    logger.info("one");
    logger.info("two");
    logger.clear();
    expect(logger.getEntries()).toHaveLength(0);
  });

  it("limits to MAX_ENTRIES", () => {
    for (let i = 0; i < 150; i++) {
      logger.info(`entry-${i}`);
    }
    expect(logger.getEntries().length).toBeLessThanOrEqual(100);
  });
});
