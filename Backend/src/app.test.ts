import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app";

describe("api app", () => {
  const app = createApp();

  it("returns health status", async () => {
    const response = await request(app).get("/health").expect(200);
    expect(response.body.status).toBe("ok");
  });

  it("accepts a CSV upload and returns import summary", async () => {
    const csv = [
      "Name,Email,Phone,Status",
      "Priya Singh,priya@example.com,+91 9876543213,Sale done"
    ].join("\n");

    const response = await request(app)
      .post("/api/imports/extract")
      .attach("file", Buffer.from(csv), {
        filename: "leads.csv",
        contentType: "text/csv"
      })
      .expect(200);

    expect(response.body.summary.imported).toBe(1);
    expect(response.body.records[0].crm_status).toBe("SALE_DONE");
  });
});
