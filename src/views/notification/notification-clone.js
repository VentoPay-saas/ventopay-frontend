import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form, Spin } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  disableRefetch,
  removeFromMenu,
  setMenuData,
} from '../../redux/slices/menu';
import { fetchNotifications } from '../../redux/slices/notification';
import blogService from '../../services/blog';
import LanguageList from '../../components/language-list';
import getTranslationFields from '../../helpers/getTranslationFields';
import { useTranslation } from 'react-i18next';
import NotificationForm from './notification-form';

export default function NotificationClone() {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { languages } = useSelector((state) => state.formLang, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { uuid } = useParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (values) => {
    const body = {
      type: 'notification',
      title: getTranslationFields(languages, values),
      description: getTranslationFields(languages, values, 'description'),
      short_desc: getTranslationFields(languages, values, 'short_desc'),
    };
    const nextUrl = 'notifications';

    return blogService.create(body).then(() => {
      toast.success(t('successfully.updated'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchNotifications({}));
      });
      navigate(`/${nextUrl}`);
    });
  };

  function getLanguageFields(data) {
    if (!data) {
      return {};
    }
    const { translations } = data;
    const result = languages.map((item) => ({
      [`title[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale,
      )?.title,
      [`description[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale,
      )?.description,
      [`short_desc[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale,
      )?.short_desc,
    }));
    return Object.assign({}, ...result);
  }

  const fetchNotification = (uuid) => {
    setLoading(true);
    blogService
      .getById(uuid)
      .then((res) => {
        let blog = res.data;
        form.setFieldsValue({
          ...blog,
          ...getLanguageFields(blog),
        });
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchNotification(uuid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  return (
    <Card title={t('clone.notification')} extra={<LanguageList />}>
      {!loading ? (
        <NotificationForm form={form} handleSubmit={handleSubmit} />
      ) : (
        <div className='d-flex justify-content-center align-items-center'>
          <Spin size='large' className='py-5' />
        </div>
      )}
    </Card>
  );
}
