import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/db"; // Adjust if your db connection path is different

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const audits = await query("SELECT * FROM audit_reports");
      console.log("Fetched audits:", audits); // Log the fetched data
      res.status(200).json(audits);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Database error" });
    }
  } else if (req.method === "POST") {
    try {
      const { contract, findings, severity } = req.body;

      // Validate input
      if (!contract || !findings || !severity) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Insert the new audit into the database
      const result = await query(
        "INSERT INTO audit_reports (contract, findings, severity) VALUES ($1, $2, $3) RETURNING *",
        [contract, findings, severity]
      );

      console.log("New audit added:", result); // Log the inserted data
      res.status(201).json(result[0]); // Return the newly created audit
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to add audit" });
    }
  } else if (req.method === "DELETE") {
    try {
      const { id } = req.body;

      // Validate input
      if (!id) {
        return res.status(400).json({ error: "Missing audit ID" });
      }

      // Delete the audit from the database
      const result = await query(
        "DELETE FROM audit_reports WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.length === 0) {
        return res.status(404).json({ error: "Audit not found" });
      }

      console.log("Deleted audit:", result[0]); // Log the deleted data
      res.status(200).json({ message: "Audit deleted successfully" });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to delete audit" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}