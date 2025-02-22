// pages/api/audits.ts
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
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}