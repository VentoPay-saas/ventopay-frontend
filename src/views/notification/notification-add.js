import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../redux/slices/menu';
import { fetchNotifications } from '../../redux/slices/notification';
import blogService from '../../services/blog';
import LanguageList from '../../components/language-list';
import { useTranslation } from 'react-i18next';
import NotificationForm from './notification-form';

export default function NotificationAdd() {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { languages } = useSelector((state) => state.formLang, shallowEqual);
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

  function getTranslationFields(values, field = 'title') {
    const list = languages.map((item) => ({
      [item.locale]: values[`${field}[${item.locale}]`],
    }));
    return Object.assign({}, ...list);
  }

  const handleSubmit = (values) => {
    const body = {
      type: 'notification',
      title: getTranslationFields(values),
      description: getTranslationFields(values, 'description'),
      short_desc: getTranslationFields(values, 'short_desc'),
    };
    const nextUrl = 'notifications';

    return blogService.create(body).then(() => {
      toast.success(t('successfully.created'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchNotifications({}));
      });
      navigate(`/${nextUrl}`);
    });
  };

  return (
    <Card title={t('add.notification')} extra={<LanguageList />}>
      <NotificationForm form={form} handleSubmit={handleSubmit} />
    </Card>
  );
}
