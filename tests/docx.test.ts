import { describe, expect, it } from "vitest";
import { draftContract } from "@/lib/services";

describe("docx generation smoke", () => {
  it("keeps the service layer exported", () => {
    expect(typeof draftContract).toBe("function");
  });
});
