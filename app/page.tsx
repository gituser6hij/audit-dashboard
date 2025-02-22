"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";  // Chad UI Button
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";  // Chad UI Alert
import { Input } from "@/components/ui/input";  // Chad UI Input for search
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";  // Chad UI Select for severity filter
import { Skeleton } from "@/components/ui/skeleton";  // Chad UI Skeleton for loading state
import { Sun, Moon } from "lucide-react";  // Icons for light/dark mode

export default function Home() {
  interface Audit {
    id: string;
    contract: string;
    findings: string;
    severity: "Low" | "Medium" | "High";
    created_at: string;
  }
  
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");  // Default to "all"
  const [darkMode, setDarkMode] = useState<boolean>(false);  // Dark mode state

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Fetch audit reports when the component mounts
  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const response = await fetch("/api/audits"); // API route
        if (!response.ok) {
          throw new Error("Failed to fetch audits");
        }
        const data = await response.json();
        console.log("Fetched data:", data);  // Log the fetched data
        setAudits(data);
      } catch (error) {
        console.error("Error fetching audits:", error);  // Log the error
        setError("Error fetching audit reports");
      } finally {
        setLoading(false);
      }
    };

    fetchAudits();
  }, []);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Filter audits based on search query and severity
  const filteredAudits = audits.filter((audit) => {
    const matchesSearch = audit.contract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.findings.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === "all" ? true : audit.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-8 sm:p-20">
      <main className="w-full max-w-4xl p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg space-y-8">
        {/* Dark Mode Toggle Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>

        <header className="text-center">
          <h1 className="text-3xl font-bold mt-4">Audit Dashboard</h1>
        </header>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by contract or findings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[180px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
              <SelectItem value="all" className="dark:hover:bg-gray-600">All</SelectItem>
              <SelectItem value="Low" className="dark:hover:bg-gray-600">Low</SelectItem>
              <SelectItem value="Medium" className="dark:hover:bg-gray-600">Medium</SelectItem>
              <SelectItem value="High" className="dark:hover:bg-gray-600">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Display loading or error */}
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full dark:bg-gray-700" />
            <Skeleton className="h-20 w-full dark:bg-gray-700" />
            <Skeleton className="h-20 w-full dark:bg-gray-700" />
          </div>
        )}
        {error && <Alert variant="destructive" className="text-center text-lg">{error}</Alert>}

        {/* Display the fetched audits */}
        <div className="space-y-6">
          <h2 className="font-semibold text-xl mb-4">Audit Reports</h2>
          {filteredAudits.length === 0 && !loading && !error ? (
            <Alert className="text-center text-lg">No audit reports found.</Alert>
          ) : (
            <ul className="space-y-4">
              {filteredAudits.map((audit: any) => (
                <Card key={audit.id} className="space-y-2 dark:bg-gray-700 dark:border-gray-600">
                  <CardHeader>
                    <h3 className="text-lg font-semibold dark:text-gray-100">Contract: {audit.contract}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="dark:text-gray-300"><strong>Findings:</strong> {audit.findings}</p>
                    <p className="dark:text-gray-300"><strong>Severity:</strong> {audit.severity}</p>
                    <p className="dark:text-gray-300"><strong>Created At:</strong> {audit.created_at}</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </ul>
          )}
        </div>
      </main>

      <footer className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
        <p>&copy; {new Date().getFullYear()} Audit Dashboard</p>
      </footer>
    </div>
  );
}