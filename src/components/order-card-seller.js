import React from 'react';
import {
  DownloadOutlined,
  EyeOutlined,
  UserOutlined,
  ContainerOutlined,
  CarOutlined,
  DollarOutlined,
  PayCircleOutlined,
  BorderlessTableOutlined,
  FieldTimeOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Avatar, Card, List, Skeleton, Space } from 'antd';
import { IMG_URL } from 'configs/app-global';
import numberToPrice from 'helpers/numberToPrice';
import moment from 'moment';
import useDemo from 'helpers/useDemo';
import { useTranslation } from 'react-i18next';

const { Meta } = Card;

const OrderCardSeller = ({
  data: item,
  goToShow,
  loading,
  setId,
  setIsModalVisible,
  setText,
  setDowloadModal,
  setType,
  setIsTransactionModalOpen,
}) => {
  const { isDemo, demoFunc } = useDemo();
  const { t } = useTranslation();
  const data = [
    {
      title: t('products.number'),
      icon: <ContainerOutlined />,
      data: item?.order_details_count,
    },
    {
      title: t('table'),
      icon: <CarOutlined />,
      data: `${item?.table?.name || t('N/A')}`,
    },
    {
      title: t('amount'),
      icon: <DollarOutlined />,
      data: numberToPrice(item?.total_price, item.currency?.symbol),
    },
    {
      title: t('payment.type'),
      icon: <BorderlessTableOutlined />,
      data: t(item.transaction?.payment_system?.tag || 'N/A'),
    },
    {
      title: t('payment.status'),
      icon: <PayCircleOutlined />,
      data: item.transaction?.status ? (
        <div
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            setIsTransactionModalOpen({
              orderId: item?.id,
              status: item.transaction?.status,
            });
          }}
        >
          {item.transaction?.status}{' '}
          <EditOutlined disabled={item?.deleted_at} />
        </div>
      ) : (
        t('N/A')
      ),
    },

    {
      title: 'Created at',
      icon: <FieldTimeOutlined />,
      data: moment(item?.created_at).format('YYYY-MM-DD') || '-',
    },
  ];

  return (
    <Card
      actions={[
        <EyeOutlined key='setting' onClick={() => goToShow(item)} />,
        <DeleteOutlined
          onClick={(e) => {
            if (isDemo) {
              demoFunc();
              return;
            }
            e.stopPropagation();
            setId([item.id]);
            setIsModalVisible(true);
            setText(true);
            setType(item.status);
          }}
        />,
        <DownloadOutlined
          key='ellipsis'
          onClick={() => setDowloadModal(item.id)}
        />,
      ]}
      className='order-card'
    >
      <Skeleton loading={loading} avatar active>
        <Meta
          avatar={
            <Avatar src={IMG_URL + item.user?.img} icon={<UserOutlined />} />
          }
          description={`#${item.id}`}
          title={`${item.user?.firstname || '-'} ${item.user?.lastname || '-'}`}
        />
        <List
          itemLayout='horizontal'
          dataSource={data}
          renderItem={(item, key) => (
            <List.Item key={key}>
              <Space>
                {item?.icon}
                <span>
                  {`${item?.title}:`}
                  {item?.data}
                </span>
              </Space>
            </List.Item>
          )}
        />
      </Skeleton>
    </Card>
  );
};

export default OrderCardSeller;
