"use client";

import { useParams } from "next/navigation";
import { useOne } from "@refinedev/core";
import { Card, Descriptions, Spin, Tag } from "antd";
import { EnquiryCard } from "../../../../components/leads/EnquiryCard";
import { TestDriveCard } from "../../../../components/leads/TestDriveCard";
import { QuotationCard } from "../../../../components/leads/QuotationCard";
import { FinanceCard } from "../../../../components/leads/FinanceCard";
import { BookingCard } from "../../../../components/leads/BookingCard";

export default function LeadShowPage() {
  // In a Client Component, `useParams()` is the simplest way to read the
  // dynamic [id] segment — it gives back a plain object straight away, no
  // async/await needed (unlike Server Components, where `params` is a
  // Promise you have to await; see Next.js's docs on this if curious, it
  // tripped us up once already elsewhere in this app).
  const { id } = useParams();

  // useOne() calls dataProvider.getOne("leads", id) — i.e. GET /leads/:id —
  // and gives us back the lead record. NOTE: this Refine version returns
  // { query, result } rather than the older { data, isLoading } shape, so
  // loading state lives on `query.isLoading`, not on a top-level field.
  const { result: lead, query } = useOne({ resource: "leads", id });

  // Guarding on `!lead` too (not just isLoading) matters: there's a brief
  // window where isLoading has flipped to false but `result` hasn't been
  // populated yet, and rendering `lead.customer_name` in that gap crashes
  // the page.
  if (query.isLoading || !lead) {
    return (
      <div style={{ padding: 24 }}>
        <Spin />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 16 }}>
        <Descriptions title={lead.customer_name} column={2}>
          <Descriptions.Item label="Phone">{lead.phone}</Descriptions.Item>
          <Descriptions.Item label="Source">{lead.source}</Descriptions.Item>
          <Descriptions.Item label="Model Interest">{lead.model_interest || "-"}</Descriptions.Item>
          <Descriptions.Item label="Stage">
            <Tag color="blue">{lead.stage}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Each card independently fetches/saves its own slice of data and
          calls `query.refetch` afterwards so the Stage tag above updates
          immediately once a card advances the pipeline. */}
      <EnquiryCard leadId={id} onSaved={query.refetch} />
      <TestDriveCard leadId={id} onSaved={query.refetch} />
      <QuotationCard leadId={id} onSaved={query.refetch} />
      <FinanceCard leadId={id} onSaved={query.refetch} />
      <BookingCard leadId={id} onSaved={query.refetch} />
    </div>
  );
}
