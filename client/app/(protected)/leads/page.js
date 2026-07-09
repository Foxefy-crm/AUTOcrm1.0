"use client";

import { List, useTable } from "@refinedev/antd";
import { Table, Tag } from "antd";
import Link from "next/link";

export default function LeadListPage() {
  // useTable() is a Refine+antd hook: it calls dataProvider.getList("leads")
  // under the hood (GET /leads?_start=&_end=&_sort=&_order=), and hands
  // back `tableProps` pre-wired with antd's <Table> pagination/sorting
  // props. We don't write any fetch/pagination logic ourselves here.
  const { tableProps } = useTable({
    resource: "leads",
    sorters: { initial: [{ field: "id", order: "desc" }] },
  });

  return (
    // <List> is Refine's page wrapper for a resource's list view — it adds
    // the title + a "Create" button (linking to the leads' `create` route
    // registered in providers.js) for free.
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="customer_name"
          title="Name"
          render={(value, record) => <Link href={`/leads/${record.id}`}>{value}</Link>}
        />
        <Table.Column dataIndex="phone" title="Phone" />
        <Table.Column dataIndex="source" title="Source" />
        <Table.Column dataIndex="model_interest" title="Model Interest" />
        <Table.Column dataIndex="stage" title="Stage" render={(value) => <Tag>{value}</Tag>} />
      </Table>
    </List>
  );
}
