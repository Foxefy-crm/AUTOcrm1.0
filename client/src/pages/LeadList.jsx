import { List, useTable } from '@refinedev/antd';
import { Table, Tag } from 'antd';
import { Link } from 'react-router-dom';

export const LeadList = () => {
  const { tableProps } = useTable({
    resource: 'leads',
    sorters: { initial: [{ field: 'id', order: 'desc' }] },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="customer_name"
          title="Name"
          render={(value, record) => <Link to={`/leads/${record.id}`}>{value}</Link>}
        />
        <Table.Column dataIndex="phone" title="Phone" />
        <Table.Column dataIndex="source" title="Source" />
        <Table.Column dataIndex="model_interest" title="Model Interest" />
        <Table.Column dataIndex="stage" title="Stage" render={(value) => <Tag>{value}</Tag>} />
      </Table>
    </List>
  );
};
