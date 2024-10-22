import React from 'react';
import {
  DownloadOutlined,
  EyeOutlined,
  UserOutlined,
  DollarOutlined,
  PayCircleOutlined,
  BorderlessTableOutlined,
  DeleteOutlined,
  FieldTimeOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Avatar, Card, List, Skeleton, Space } from 'antd';
import numberToPrice from 'helpers/numberToPrice';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import useDemo from 'helpers/useDemo';

const { Meta } = Card;

const OrderCard = ({
  data: item,
  goToShow,
  loading,
  setId,
  setIsModalVisible,
  setText,
  setDowloadModal,
  setTabType,
  setIsTransactionModalOpen,
}) => {
  const { t } = useTranslation();
  const data = [
    {
      title: t('client'),
      icon: <UserOutlined />,
      data: `${item.user?.firstname || '-'} ${item.user?.lastname || '-'}`,
    },
    {
      title: t('amount'),
      icon: <DollarOutlined />,
      data: numberToPrice(item?.total_price, item.currency?.symbol),
    },
    {
      title: t('payment.type'),
      icon: <PayCircleOutlined />,
      data: t(item?.transaction?.payment_system?.tag || 'N/A'),
    },
    {
      title: t('payment.status'),
      icon: <BorderlessTableOutlined />,
      data: item.transaction?.status ? (
        <div
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            setIsTransactionModalOpen({
              orderId: item?.id,
              status: item.transaction?.status,
              orderStatus: item.status,
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
      title: t('created.at'),
      icon: <FieldTimeOutlined />,
      data: item?.created_at
        ? moment(item?.created_at).format('YYYY-MM-DD')
        : t('N/A'),
    },
  ];
  const { isDemo } = useDemo();
  const actions = [
    <DeleteOutlined
      onClick={(e) => {
        if (isDemo) {
          toast.warning(t('cannot.work.demo'));
          return;
        }
        e.stopPropagation();
        setId([item.id]);
        setIsModalVisible(true);
        setText(true);
        setTabType(item.status);
      }}
    />,
    <DownloadOutlined
      onClick={(e) => {
        e.stopPropagation();
        setDowloadModal(item.id);
      }}
    />,
    <EyeOutlined
      onClick={(e) => {
        e.stopPropagation();
        goToShow(item);
      }}
    />,
  ];

  return (
    <Card actions={actions} className='order-card'>
      <Skeleton loading={loading} avatar active>
        <Meta
          avatar={<Avatar src={item?.shop?.logo_img} />}
          description={`#${item.id}`}
          title={item?.shop?.translation?.title}
        />
        <List
          itemLayout='horizontal'
          dataSource={data}
          renderItem={(item, key) => {
            return (
              <List.Item key={key}>
                <Space>
                  {item?.icon}
                  <span>
                    {`${item?.title}:`}
                    {item?.data}
                  </span>
                </Space>
              </List.Item>
            );
          }}
        />
      </Skeleton>
    </Card>
  );
};

export default OrderCard;
