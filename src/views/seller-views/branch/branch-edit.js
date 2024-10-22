import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, removeFromMenu, setMenuData } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import LanguageList from 'components/language-list';
import getTranslationFields from 'helpers/getTranslationFields';
import branchService from 'services/seller/branch';
import { fetchBranch } from 'redux/slices/branch';
import BranchForm from './branch-form';

const SellerBranchEdit = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const { languages } = useSelector((state) => state.formLang, shallowEqual);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      data.open_time = JSON.stringify(data?.open_time);
      data.close_time = JSON.stringify(data?.close_time);
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getLanguageFields(data) {
    if (!data) {
      return {};
    }
    const { translations } = data;
    const result = languages.map((item) => ({
      [`title[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale
      )?.title,
    }));
    return Object.assign({}, ...result);
  }

  const getBranch = (id) => {
    setLoading(true);
    branchService
      .getById(id)
      .then((res) => {
        let branch = res.data;
        const data = {
          ...branch,
          mapCoordinates: {
            lat: Number(branch?.location.latitude),
            lng: Number(branch?.location.longitude),
          },
          ...getLanguageFields(branch),
          address: branch.address?.address,
        };
        dispatch(setMenuData({ activeMenu, data }));
        form.setFieldsValue({
          ...data,
        });
      })
      .finally(() => {
        dispatch(disableRefetch(activeMenu));
        setLoading(false);
      });
  };

  const handleSubmit = (values) => {
    const body = {
      title: getTranslationFields(languages, values, 'title'),
    };
    const nextUrl = 'seller/branch';

    return branchService.update(id, body).then(() => {
      toast.success(t('successfully.updated'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchBranch({}));
      });
      navigate(`/${nextUrl}`);
    });
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      getBranch(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  return (
    <Card
      loading={loading}
      title={t('edit.branch')}
      className='h-100'
      extra={<LanguageList />}
    >
      <BranchForm form={form} handleSubmit={handleSubmit} />
    </Card>
  );
};

export default SellerBranchEdit;
