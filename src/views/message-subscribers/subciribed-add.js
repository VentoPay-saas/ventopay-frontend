import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import messageSubscriberService from '../../services/messageSubscriber';
import { fetchMessageSubscriber } from '../../redux/slices/messegeSubscriber';
import SubscribedForm from './subscribed-form';

const MessageSubciribedAdd = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (values) => {
    const body = {
      ...values,
      type: values.type,
      email_setting_id: values.email_setting_id.value,
      send_to: moment(values.send_to).format('YYYY-MM-DD HH:mm:ss'),
    };
    const nextUrl = 'message/subscriber';

    return messageSubscriberService.create(body).then(() => {
      toast.success(t('successfully.created'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchMessageSubscriber({}));
      });
      navigate(`/${nextUrl}`);
    });
  };

  return (
    <Card title={t('add.subscriber')} className='h-100'>
      <SubscribedForm form={form} handleSubmit={handleSubmit} />
    </Card>
  );
};

export default MessageSubciribedAdd;
