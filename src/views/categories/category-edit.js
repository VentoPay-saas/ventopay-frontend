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
import { IMG_URL } from '../../configs/app-global';
import { useTranslation } from 'react-i18next';
import { fetchCategories } from '../../redux/slices/category';
import CategoryList from './category-list';
import CategoryForm from './category-form';

const CategoryEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [categoryId, setCategoryId] = useState(null);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { state } = useLocation();

  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [error, setError] = useState(null);
  const { uuid } = useParams();
  const { params } = useSelector((state) => state.category, shallowEqual);
  const { languages } = useSelector((state) => state.formLang, shallowEqual);
  const paramsData = {
    ...params,
    type: state?.parentId ? 'sub_main' : 'main',
    parent_id: state?.parentId,
  };

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      batch(() => {
        dispatch(setMenuData({ activeMenu, data }));
        dispatch(fetchCategories(paramsData));
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createImage = (name) => {
    return {
      name,
      url: IMG_URL + name,
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
          keywords: category?.keywords?.split(','),
          parent_id: {
            label: category.parent?.translation?.title,
            value: category.parent_id,
            key: category.parent_id,
          },
        };
        setCategoryId(category.id);
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
      parent_id: state?.parentId || values.parent_id?.value,
      'images[0]': image[0]?.name,
    };
    const nextUrl = state?.parentId
      ? `category/${state?.parentUuid}`
      : 'catalog/categories';

    return categoryService
      .update(uuid, body)
      .then(() => {
        toast.success(t('successfully.updated'));
        batch(() => {
          dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
          dispatch(fetchCategories(paramsData));
        });

        navigate(`/${nextUrl}`);
      })
      .catch((err) => setError(err.response.data.params));
  };

  useEffect(() => {
    getCategory(uuid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch, uuid, state?.parentId]);

  return (
    <>
      <Card
        title={state?.parentId ? t('edit.sub.category') : t('edit.category')}
        extra={<LanguageList />}
      >
        {!loading ? (
          <CategoryForm form={form} handleSubmit={handleSubmit} error={error} />
        ) : (
          <div className='d-flex justify-content-center align-items-center py-5'>
            <Spin size='large' className='mt-5 pt-5' />
          </div>
        )}
      </Card>
      {!!categoryId && !state?.parentId && (
        <CategoryList type='sub_main' parentId={categoryId} />
      )}
    </>
  );
};
export default CategoryEdit;
