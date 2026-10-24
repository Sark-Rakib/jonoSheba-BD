import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Badge,
  ReportStatusBadge,
  StatusBadge,
} from "./status-badge";
import { VerificationBadge } from "./verification-badge";

describe("StatusBadge", () => {
  it("renders the Bangla label for each status", () => {
    render(<StatusBadge status="approved" />);
    expect(screen.getByText("প্রকাশিত")).toBeTruthy();

    render(<StatusBadge status="pending" />);
    expect(screen.getByText("অপেক্ষমাণ")).toBeTruthy();

    render(<StatusBadge status="draft" />);
    expect(screen.getByText("খসড়া")).toBeTruthy();
  });
});

describe("VerificationBadge", () => {
  it("distinguishes verified from unverified", () => {
    render(<VerificationBadge verified />);
    expect(screen.getByText("যাচাইকৃত")).toBeTruthy();

    render(<VerificationBadge verified={false} />);
    expect(screen.getByText("যাচাইকৃত নয়")).toBeTruthy();
  });
});

describe("ReportStatusBadge", () => {
  it("renders open reports", () => {
    render(<ReportStatusBadge status="open" />);
    expect(screen.getByText("উন্মুক্ত")).toBeTruthy();
  });
});

describe("Badge", () => {
  it("renders custom children", () => {
    render(<Badge tone="amber">প্রমোশন</Badge>);
    expect(screen.getByText("প্রমোশন")).toBeTruthy();
  });
});
