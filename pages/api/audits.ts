import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const audits = await query("SELECT * FROM audit_reports");
      console.log("Fetched audits:", audits);
      res.status(200).json(audits);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Database error" });
    }
  } else if (req.method === "POST") {
    try {
      const { contract, findings, severity } = req.body;
      if (!contract || !findings || !severity) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const result = await query(
        "INSERT INTO audit_reports (contract, findings, severity) VALUES ($1, $2, $3) RETURNING *",
        [contract, findings, severity]
      );
      console.log("New audit added:", result);
      res.status(201).json(result[0]);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to add audit" });
    }
  } else if (req.method === "DELETE") {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: "Missing audit ID" });
      }
      const result = await query(
        "DELETE FROM audit_reports WHERE id = $1 RETURNING *",
        [id]
      );
      if (result.length === 0) {
        return res.status(404).json({ error: "Audit not found" });
      }
      console.log("Deleted audit:", result[0]);
      res.status(200).json({ message: "Audit deleted successfully" });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to delete audit" });
    }
  } else if (req.method === "PUT") {
    try {
      const { id, contract, findings, severity } = req.body;
      if (!id || !contract || !findings || !severity) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const result = await query(
        "UPDATE audit_reports SET contract = $1, findings = $2, severity = $3 WHERE id = $4 RETURNING *",
        [contract, findings, severity, id]
      );
      if (result.length === 0) {
        return res.status(404).json({ error: "Audit not found" });
      }
      console.log("Updated audit:", result[0]);
      res.status(200).json(result[0]);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to update audit" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "DELETE", "PUT"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}