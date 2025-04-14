"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import {
  ApplicationsPanel,
  DashboardHeader,
} from "@/components/dashboard";
import Pagination from "@/components/Pagination";
import { fetchApplications } from "@/lib/api";
import Account from "@/components/account/Account";
import ScaleLoader from "react-spinners/ScaleLoader";
import { DashboardBreadcrumb } from "@/components/dashboard/DashboardBreadcrumb";
import { env } from "@/config/environment";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const PAGE_SIZE = 10;

/**
 * DashboardPage component
 * Renders the main dashboard page with sidebar, header, and applications panel
 */
export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["applications", searchTerm, activeFilters, currentPage],
    queryFn: () =>
      fetchApplications(searchTerm, activeFilters, currentPage, PAGE_SIZE),
    refetchInterval: 1 * 1000, // Refetch every 1 seconds
  });

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Applications", href: "/dashboard" },
  ];

  const applications = data?.applications || [];
  const totalCount = data?.totalCount || 0;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <DashboardBreadcrumb items={breadcrumbItems} />
        {env.useTestData && (
            <div className="bg-yellow-100 p-2 text-yellow-800">
              Using test data in {env.apiBaseUrl} environment
            </div>
        )}
        <div className="relative ml-auto flex-1 md:grow-0"></div>
        
        <Account />

        <Button variant="outline">
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            <Link
              href="https://airtable.com/appVmASv3V2GIds6v/pagI08VGIVczU97wK/form"
              target="_blank"
            >
              Apply
            </Link>
          </span>
        </Button>
      </header>

      <DashboardHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
      />

      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <ScaleLoader />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-red-500 text-center">
              Error: {error.message}
            </div>
          </div>
        )}
        {!isLoading && !error && (
          <>
            <ApplicationsPanel
              applications={applications}
              totalCount={totalCount}
              currentPage={currentPage}
              pageSize={PAGE_SIZE}
            />
            <Pagination
              currentPage={currentPage}
              totalCount={totalCount}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </main>
    </>
  );
}
