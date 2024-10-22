import React, { useState, useEffect } from 'react';
import { Card, Form, Spin } from 'antd';
import { toast } from 'react-toastify';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import LanguageList from '../../components/language-list';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  disableRefetch,
  removeFromMenu,
  setMenuData,
} from '../../redux/slices/menu';
import categoryService from '../../services/category';
import { fetchCategories } from '../../redux/slices/category';
import { useTranslation } from 'react-i18next';
import CategoryForm from './category-form';

const ShopCategoryClone = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { state } = useLocation();

  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [error, setError] = useState(null);
  const { uuid } = useParams();
  const { languages } = useSelector((state) => state.formLang, shallowEqual);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createImage = (name) => {
    return {
      name,
      url: name,
    };
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
    }));
    return Object.assign({}, ...result);
  }

  const getCategory = (alias) => {
    setLoading(true);
    categoryService
      .getById(alias)
      .then((res) => {
        let category = res.data;

        const body = {
          ...category,
          ...getLanguageFields(category),
          image: [createImage(category.img)],
          keywords: category.keywords.split(','),
          parent_id: {
            label: category.parent?.translation?.title,
            value: category.parent_id,
            key: category.parent_id,
          },
        };

        form.setFieldsValue(body);
        dispatch(setMenuData({ activeMenu, data: body }));
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  };

  const handleSubmit = (values, image) => {
    const body = {
      ...values,
      type: 'main',
      active: values.active ? 1 : 0,
      keywords: values.keywords.join(','),
      parent_id: null,
      'images[0]': image[0]?.name,
    };
    const nextUrl = state?.parentId
      ? `category/${state.parentUuid}`
      : 'catalog/categories';

    return categoryService
      .create(body)
      .then(() => {
        toast.success(t('successfully.updated'));
        batch(() => {
          dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
          dispatch(
            fetchCategories({
              type: state?.parentId ? 'sub_main' : 'main',
              parent_id: state?.parentId,
            }),
          );
        });
        navigate(`/${nextUrl}`);
      })
      .catch((err) => setError(err.response.data.params));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      getCategory(uuid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  return (
    <Card title={t('category.clone')} extra={<LanguageList />}>
      {!loading ? (
        <CategoryForm form={form} handleSubmit={handleSubmit} error={error} />
      ) : (
        <div className='d-flex justify-content-center align-items-center py-5'>
          <Spin size='large' className='mt-5 pt-5' />
        </div>
      )}
    </Card>
  );
};
export default ShopCategoryClone;
