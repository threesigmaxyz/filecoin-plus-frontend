import { Search, ListFilter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MultipleSelector, { Option } from "@/components/ui/multiple-selector";
import { Badge } from "@/components/ui/badge";

const OPTIONS: Option[] = [
  { label: "SUBMISSION", value: "SUBMISSION" },
  { label: "KYC", value: "KYC" },
  { label: "GOVERNANCE_REVIEW", value: "GOVERNANCE_REVIEW" },
  { label: "RKH_APPROVAL", value: "RKH_APPROVAL" },
];

const FILTER_LABELS: Record<string, string> = {
  SUBMISSION_PHASE: "Submission",
  KYC_PHASE: "KYC",
  GOVERNANCE_REVIEW_PHASE: "Governance Review",
  RKH_APPROVAL_PHASE: "RKH Approval",
  META_APPROVAL_PHASE: "Meta Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

interface DashboardHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeFilters: string[];
  setActiveFilters: (filters: string[]) => void;
}

export function DashboardHeader({
  searchTerm,
  setSearchTerm,
  activeFilters,
  setActiveFilters,
}: DashboardHeaderProps) {
  const filters: string[] = [
    "SUBMISSION_PHASE",
    "KYC_PHASE",
    "GOVERNANCE_REVIEW_PHASE",
    "RKH_APPROVAL_PHASE",
    "META_APPROVAL_PHASE",
    "APPROVED",
    "REJECTED",
  ];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 gap-1">
              <ListFilter className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Filters</span>
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[250px]">
            <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {filters.map((filter) => (
              <DropdownMenuCheckboxItem
                key={filter}
                checked={activeFilters.includes(filter)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setActiveFilters([...activeFilters, filter]);
                  } else {
                    setActiveFilters(activeFilters.filter((f) => f !== filter));
                  }
                }}
              >
                {FILTER_LABELS[filter]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
