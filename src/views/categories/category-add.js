import React, { useState, useEffect } from 'react';
import { Card, Form } from 'antd';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import LanguageList from '../../components/language-list';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../redux/slices/menu';
import categoryService from '../../services/category';
import { fetchCategories } from '../../redux/slices/category';
import { useTranslation } from 'react-i18next';
import CategoryForm from './category-form';

const CategoryAdd = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { state } = useLocation();

  const [form] = Form.useForm();
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (values, image) => {
    const body = {
      ...values,
      type: 'main',
      active: values.active ? 1 : 0,
      keywords: values.keywords.join(','),
      parent_id: state?.parentId || values.parent_id?.value,
      'images[0]': image[0]?.name,
    };
    const nextUrl = state?.parentId
      ? `category/${state.parentUuid}`
      : 'catalog/categories';
    const paramsData = {
      type: 'main',
      parent_id: state?.parentId,
    };

    return categoryService
      .create(body)
      .then(() => {
        toast.success(t('successfully.created'));
        batch(() => {
          dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
          dispatch(fetchCategories(paramsData));
        });
        navigate(`/${nextUrl}`);
      })
      .catch((err) => setError(err.response.data.params));
  };

  return (
    <Card
      title={state?.parentId ? t('add.sub.category') : t('add.category')}
      extra={<LanguageList />}
    >
      <CategoryForm form={form} handleSubmit={handleSubmit} error={error} />
    </Card>
  );
};
export default CategoryAdd;
