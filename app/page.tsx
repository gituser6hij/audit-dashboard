"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import AuditMetrics from "@/components/audit-metrics";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Sun, Moon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LCDClock from "@/components/LCDClock";
import { ethers } from "ethers";

import jsPDF from 'jspdf';

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
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [severity, setSeverity] = useState<string>("");
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [editAudit, setEditAudit] = useState<Audit | null>(null); // State for editing

  const MY_WALLET_ADDRESS = "0x053b8096a0C61792E936a8eB0958362A3EB4dd0d";


  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0].toLowerCase());
          }
        } catch (err) {
          console.error("Failed to fetch wallet address:", err);
        }
        window.ethereum.on("accountsChanged", (accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0].toLowerCase());
          } else {
            setWalletAddress(null);
          }
        });
      } else {
        console.log("Please install MetaMask or another Ethereum wallet provider.");
      }
    };
    checkWalletConnection();
  }, []);

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const response = await fetch("/api/audits");
        if (!response.ok) throw new Error("Failed to fetch audits");
        const data = await response.json();
        setAudits(data);
      } catch (error) {
        console.error("Error fetching audits:", error);
        setError("Error fetching audit reports");
      } finally {
        setLoading(false);
      }
    };
    fetchAudits();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    setDarkMode(savedTheme === "dark");
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

  const filteredAudits = audits.filter((audit) => {
    const matchesSearch =
      audit.contract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.findings.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === "all" ? true : audit.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const contract = formData.get("contract") as string;
    const findings = formData.get("findings") as string;
    const severity = formData.get("severity") as string;
    if (walletAddress !== MY_WALLET_ADDRESS.toLowerCase()) {
      alert("Only the authorized wallet can add audits.");
      return;
    }
    try {
      const response = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract, findings, severity }),
      });
      if (response.ok) {
        const newAudit = await response.json();
        setAudits([...audits, newAudit]);
        alert("Audit added successfully!");
      } else {
        alert("Failed to add audit.");
      }
    } catch (error) {
      console.error("Error adding audit:", error);
      alert("An error occurred while adding the audit.");
    }
  };

  const handleDelete = async (id: string) => {
    if (walletAddress !== MY_WALLET_ADDRESS.toLowerCase()) {
      alert("Only the authorized wallet can delete audits.");
      return;
    }
    if (!confirm("Are you sure you want to delete this audit?")) return;
    try {
      const response = await fetch("/api/audits", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        setAudits(audits.filter((audit) => audit.id !== id));
        alert("Audit deleted successfully!");
      } else {
        alert("Failed to delete audit.");
      }
    } catch (error) {
      console.error("Error deleting audit:", error);
      alert("An error occurred while deleting the audit.");
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editAudit || walletAddress !== MY_WALLET_ADDRESS.toLowerCase()) {
      alert("Only the authorized wallet can edit audits.");
      return;
    }
    const formData = new FormData(e.currentTarget);
    const contract = formData.get("contract") as string;
    const findings = formData.get("findings") as string;
    const severity = formData.get("severity") as "Low" | "Medium" | "High";
    try {
      const response = await fetch("/api/audits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editAudit.id, contract, findings, severity }),
      });
      if (response.ok) {
        const updatedAudit = await response.json();
        setAudits(audits.map((audit) => (audit.id === updatedAudit.id ? updatedAudit : audit)));
        setEditAudit(null); // Close the dialog
        alert("Audit updated successfully!");
      } else {
        alert("Failed to update audit.");
      }
    } catch (error) {
      console.error("Error updating audit:", error);
      alert("An error occurred while updating the audit.");
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask or another Ethereum wallet provider.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      setWalletAddress(accounts[0].toLowerCase());
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      // Could add more specific error messages based on error type
      alert("Failed to connect wallet. Please try again.");
    }
  };

  const generatePdf = (audit: Audit) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Audit Report: ${audit.contract}`, 10, 20);
    doc.setFontSize(12);

    doc.text(`Contract Address: ${audit.contract}`, 10, 40);
    doc.text(`Findings: ${audit.findings}`, 10, 50);
    doc.text(`Severity: ${audit.severity}`, 10, 60);
    doc.text(`Audit Date: ${audit.created_at}`, 10, 70);

    doc.save(`audit_report_${audit.contract}_${audit.created_at}.pdf`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-8 sm:p-20">

      <main className="w-full max-w-4xl p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg space-y-8">

        <div className="flex items-center justify-between w-full">


          {/* Clock centered */}
          <div className="flex-1 flex justify-left">
            <LCDClock />
          </div>

          {/* Theme button aligned right */}
          <Button variant="outline" size="icon" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>
        <header className="text-center">
          {/* Logo aligned left */}
          <div className="flex justify-center items-center ">
            <img src="/user137.png" alt="user137" className="border border-gray-300 rounded-full h-16 w-16 rounded-full" />
          </div>
          <div className="flex justify-center items-center gap-4">

            <h1 className="text-4xl font-bold mt-4 text-primary">user137 Audit Portfolio</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Smart Contract Security Research</p>
        </header>
        <AuditMetrics audits={audits} />
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
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full dark:bg-gray-700" />
            <Skeleton className="h-20 w-full dark:bg-gray-700" />
            <Skeleton className="h-20 w-full dark:bg-gray-700" />
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-6">
          <h2 className="font-semibold text-xl mb-4">Audit Reports</h2>
          {filteredAudits.length === 0 && !loading && !error ? (
            <Alert>
              <AlertDescription>No audit reports found.</AlertDescription>
            </Alert>
          ) : (
            <ul className="space-y-4">
              {filteredAudits.map((audit) => (
                <Card key={audit.id} className="space-y-2 dark:bg-gray-700 dark:border-gray-600">
                  <CardHeader>
                    <h3 className="text-lg font-semibold dark:text-gray-100">Contract: {audit.contract}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="dark:text-gray-300"><strong>Findings:</strong> {audit.findings}</p>
                    <p className="dark:text-gray-300"><strong>Severity:</strong> {audit.severity}</p>
                    <p className="dark:text-gray-300"><strong>Created At:</strong> {audit.created_at}</p>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500"
                      onClick={() => setSelectedAudit(audit)}
                    >
                      Details
                    </Button>
                    {walletAddress === MY_WALLET_ADDRESS.toLowerCase() && (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500"
                          onClick={() => setEditAudit(audit)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleDelete(audit.id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </ul>
          )}
          {selectedAudit && (
            <Dialog open={!!selectedAudit} onOpenChange={() => setSelectedAudit(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedAudit.contract}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p><strong>Findings:</strong> {selectedAudit.findings}</p>
                  <p><strong>Severity:</strong> {selectedAudit.severity}</p>
                  <p><strong>Date:</strong> {selectedAudit.created_at}</p>
                  <Button
                    onClick={() => generatePdf(selectedAudit)}
                    className="w-full mt-4"
                  >
                    Download PDF Report
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {editAudit && (
            <Dialog open={!!editAudit} onOpenChange={() => setEditAudit(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Audit</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEdit} className="space-y-4">
                  <Input
                    name="contract"
                    placeholder="Contract Name"
                    defaultValue={editAudit.contract}
                    required
                  />
                  <Input
                    name="findings"
                    placeholder="Findings"
                    defaultValue={editAudit.findings}
                    required
                  />
                  <Select
                    name="severity"
                    value={editAudit.severity}
                    onValueChange={(value) =>
                      setEditAudit({ ...editAudit, severity: value as "Low" | "Medium" | "High" })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit" className="w-full">
                    Save Changes
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        {walletAddress === MY_WALLET_ADDRESS.toLowerCase() && (
  <Card className="dark:bg-gray-700 dark:border-gray-600">
    <CardHeader>
      <h2 className="text-xl font-semibold dark:text-gray-100">Add New Audit</h2>
    </CardHeader>
    <CardContent>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          name="contract" 
          placeholder="Contract Name" 
          required 
          className="dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100"
        />
        <Input 
          name="findings" 
          placeholder="Findings" 
          required 
          className="dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100"
        />
        <Select 
          name="severity" 
          value={severity} 
          onValueChange={setSeverity}
        >
          <SelectTrigger className="dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100">
            <SelectValue placeholder="Select Severity" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-600 dark:border-gray-500">
            <SelectItem value="Low" className="dark:hover:bg-gray-500">Low</SelectItem>
            <SelectItem value="Medium" className="dark:hover:bg-gray-500">Medium</SelectItem>
            <SelectItem value="High" className="dark:hover:bg-gray-500">High</SelectItem>
          </SelectContent>
        </Select>
        <CardFooter className="px-0 pb-0">
          <Button 
            type="submit" 
            className="w-full dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500"
          >
            Add Audit
          </Button>
        </CardFooter>
      </form>
    </CardContent>
  </Card>
)}
      </main>

      <footer className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
        <Button variant="outline" onClick={connectWallet}>
          {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect Wallet"}
        </Button>
        <p className="mt-4">© {new Date().getFullYear()} Audit Dashboard</p>

      </footer>
    </div>
  );
}