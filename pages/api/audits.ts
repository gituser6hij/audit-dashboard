import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/db";  // Adjust if your db connection path is different

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const audits = await query("SELECT * FROM audit_reports");
      console.log("Fetched audits:", audits);  // Log the fetched data
      res.status(200).json(audits);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Database error" });
    }
  } else if (req.method === "POST") {
    // Handle POST request to add a new audit
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

      console.log("New audit added:", result);  // Log the inserted data
      res.status(201).json(result[0]);  // Return the newly created audit
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to add audit" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  
  
}
