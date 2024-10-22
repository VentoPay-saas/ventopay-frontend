import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import emailService from '../../services/emailSettings';
import { fetchEmailProvider } from 'redux/slices/emailProvider';
import EmailProviderForm from './email-form';

const EmailProviderAdd = () => {
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
      smtp_auth: values.smtp_auth,
      smtp_debug: values.smtp_debug,
      port: values.port,
      password: values.password,
      from_to: values.from_to,
      host: values.host,
      active: Number(values.active),
      from_site: values.from_site,
    };
    const nextUrl = 'settings/emailProviders';

    return emailService.create(body).then(() => {
      toast.success(t('successfully.created'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchEmailProvider({}));
      });
      navigate(`/${nextUrl}`);
    });
  };

  return (
    <Card title={t('add.email.provider')} className='h-100'>
      <EmailProviderForm form={form} handleSubmit={handleSubmit} />
    </Card>
  );
};

export default EmailProviderAdd;
