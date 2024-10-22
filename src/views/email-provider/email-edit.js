import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form } from 'antd';
import { shallowEqual, useDispatch, useSelector, batch } from 'react-redux';
import {
  disableRefetch,
  removeFromMenu,
  setMenuData,
} from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import emailService from '../../services/emailSettings';
import Loading from '../../components/loading';
import { fetchEmailProvider } from 'redux/slices/emailProvider';
import EmailProviderForm from './email-form';

const EmailProviderEdit = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEmailProvider = (alias) => {
    setLoading(true);
    emailService
      .getById(alias)
      .then((res) => {
        let emailProvider = res.data;

        const data = {
          ...emailProvider,
        };
        form.setFieldsValue(data);
        dispatch(setMenuData({ activeMenu, data }));
      })
      .finally(() => {
        dispatch(disableRefetch(activeMenu));
        setLoading(false);
      });
  };

  const handleSubmit = (values) => {
    const body = {
      smtp_auth: values.smtp_auth,
      smtp_debug: values.smtp_debug,
      port: values.port,
      password: values.password,
      from_to: values.from_to,
      host: values.host,
      active: values.active,
      from_site: values.from_site,
    };
    const nextUrl = 'settings/emailProviders';

    return emailService.update(id, body).then(() => {
      toast.success(t('successfully.updated'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchEmailProvider({}));
      });
      navigate(`/${nextUrl}`);
    });
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      getEmailProvider(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  return (
    <Card title={t('edit.email.provider')} className='h-100'>
      {loading ? (
        <Loading />
      ) : (
        <EmailProviderForm form={form} handleSubmit={handleSubmit} />
      )}
    </Card>
  );
};

export default EmailProviderEdit;
