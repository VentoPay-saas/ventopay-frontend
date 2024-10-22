import React, { useEffect, useState } from 'react';
import { Button, Descriptions, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import Loading from 'components/loading';
import reviewService from 'services/review';
import moment from 'moment';

export default function OrderReviewShowModal({ id, handleCancel }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const comment = data?.comment?.split(',');
  const name = comment?.at(0);
  const phone = comment?.at(1);
  const description = comment?.at(2);

  function fetchReviews(id) {
    setLoading(true);
    reviewService
      .getById(id)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchReviews(id);
  }, [id]);

  return (
    <Modal
      visible={!!id}
      title={t('shop.review')}
      onCancel={handleCancel}
      footer={
        <Button type='default' onClick={handleCancel}>
          {t('cancel')}
        </Button>
      }
    >
      {!loading ? (
        <Descriptions bordered>
          <Descriptions.Item span={3} label={t('id')}>
            {data.id}
          </Descriptions.Item>
          <Descriptions.Item span={3} label={t('user')}>
            {name}
          </Descriptions.Item>
          <Descriptions.Item span={3} label={t('rating')}>
            {data.rating}
          </Descriptions.Item>
          <Descriptions.Item span={3} label={t('phone.number')}>
            {phone}
          </Descriptions.Item>
          <Descriptions.Item span={3} label={t('comment')}>
            {description}
          </Descriptions.Item>
          <Descriptions.Item span={3} label={t('created.at')}>
            {moment(data.created_at).format('DD.MM.YYYY HH:mm')}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Loading />
      )}
    </Modal>
  );
}
