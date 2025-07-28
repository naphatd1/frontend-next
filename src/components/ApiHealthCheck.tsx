"use client";

import React, { useEffect, useState } from "react";
import { healthAPI } from "@/lib/api";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";

const ApiHealthCheck: React.FC = () => {
  const [status, setStatus] = useState<"loading" | "connected" | "error">(
    "loading"
  );
  const [error, setError] = useState<string>("");

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      setStatus("loading");

      // Use simple fetch for health check to avoid security header issues
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
        }/health`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("API Health Check:", data);
      setStatus("connected");
      setError("");
    } catch (err: any) {
      console.error("API Health Check Failed:", err);
      setStatus("error");
      setError(err.message || "Failed to connect to API");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 px-3 py-2 rounded-md">
        <Loader className="h-4 w-4 animate-spin" />
        <span className="text-sm">Checking API connection...</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center justify-between bg-red-50 px-3 py-2 rounded-md">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">API connection failed: {error}</span>
        </div>
        <button
          onClick={checkApiHealth}
          className="text-xs text-red-600 hover:text-red-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-2 rounded-md">
      <CheckCircle className="h-4 w-4" />
      <span className="text-sm">API connected</span>
    </div>
  );
};

export default ApiHealthCheck;
