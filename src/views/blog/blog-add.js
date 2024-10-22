import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../redux/slices/menu';
import { fetchBlogs } from '../../redux/slices/blog';
import blogService from '../../services/blog';
import LanguageList from '../../components/language-list';
import { useTranslation } from 'react-i18next';
import BlogForm from './blog-form';

export default function BlogAdd() {
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

  const handleSubmit = (values, image) => {
    const nextUrl = 'blogs';
    const paramsData = { status: 'published', type: 'blog' };
    const body = {
      type: 'blog',
      active: values.active ? 1 : 0,
      images: image.length ? image.map((item) => item.name) : undefined,
      title: getTranslationFields(values),
      description: getTranslationFields(values, 'description'),
      short_desc: getTranslationFields(values, 'short_desc'),
    };

    return blogService.create(body).then(() => {
      toast.success(t('successfully.created'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchBlogs(paramsData));
      });
      navigate(`/${nextUrl}`);
    });
  };

  return (
    <Card title={t('add.blog')} extra={<LanguageList />}>
      <BlogForm form={form} handleSubmit={handleSubmit} />
    </Card>
  );
}
