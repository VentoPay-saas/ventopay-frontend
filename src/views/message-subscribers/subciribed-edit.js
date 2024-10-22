import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  disableRefetch,
  removeFromMenu,
  setMenuData,
} from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import messageSubscriberService from '../../services/messageSubscriber';
import Loading from '../../components/loading';
import { fetchMessageSubscriber } from '../../redux/slices/messegeSubscriber';
import SubscribedForm from './subscribed-form';

const MessageSubciribedAdd = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    return () => {
      const values = form.getFieldsValue(true);
      const send_to = JSON.stringify(values.send_to);
      const data = { ...values, send_to };
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSubscriber = (id) => {
    setLoading(true);
    messageSubscriberService
      .getById(id)
      .then((res) => {
        const data = {
          ...res.data,
          send_to: moment(res.data.send_to, 'YYYY-MM-DD HH:mm:ss'),
          has_date: true,
          email_setting_id: {
            label: res?.data?.email_setting?.host,
            value: res?.data?.email_setting?.id,
          },
        };
        form.setFieldsValue(data);
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  };

  const handleSubmit = (values) => {
    const body = {
      ...values,
      send_to: moment(values.send_to).format('YYYY-MM-DD HH:mm:ss'),
      email_setting_id: values.email_setting_id.value,
    };
    const nextUrl = 'message/subscriber';

    return messageSubscriberService.update(id, body).then(() => {
      toast.success(t('successfully.updated'));
      batch(() => {
        dispatch(fetchMessageSubscriber({}));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
      });
      navigate(`/${nextUrl}`);
    });
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchSubscriber(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  return (
    <>
      {!loading ? (
        <Card title={t('edit.subscriber')} className='h-100'>
          <SubscribedForm
            type={'edit'}
            form={form}
            handleSubmit={handleSubmit}
          />
        </Card>
      ) : (
        <Loading />
      )}
    </>
  );
};

export default MessageSubciribedAdd;
