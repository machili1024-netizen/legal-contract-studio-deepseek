import { describe, expect, it } from "vitest";
import { draftRequestSchema, reviewRequestSchema } from "@/lib/validation/schemas";

describe("request schemas", () => {
  it("accepts a valid review request", () => {
    const data = reviewRequestSchema.parse({
      jurisdiction: "中华人民共和国法律",
      reviewFocus: "付款节点和违约责任",
      clientNotes: "我方为乙方"
    });

    expect(data.jurisdiction).toBe("中华人民共和国法律");
  });

  it("rejects an incomplete draft request", () => {
    expect(() =>
      draftRequestSchema.parse({
        contractType: "采购合同",
        partyA: "甲公司",
        partyB: "",
        businessContext: "太短",
        keyTerms: "不足",
        specialClauses: ""
      })
    ).toThrow();
  });
});
