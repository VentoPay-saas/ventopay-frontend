import React, { useState, useEffect } from 'react';
import { Button, Col, Form, Input, InputNumber, Row, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import userService from '../../services/user';
import { toast } from 'react-toastify';
import { removeFromMenu } from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import Loading from '../../components/loading';
import ShopUserForm from 'components/forms/shop-user-form';
import { fetchShops } from '../../redux/slices/shop';

export default function UserEdit({ prev }) {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const showUserData = (uuid) => {
    if (uuid) {
      setLoading(true);
      userService
        .getById(uuid)
        .then((res) => {
          const data = res.data;
          form.setFieldsValue({
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email,
            phone: data.phone,
            password_confirmation: data.password_confirmation,
            password: data.password,
          });
        })
        .finally(() => setLoading(false));
    }
  };

  const onFinish = (values) => {
    setLoadingBtn(true);
    const body = {
      firstname: values.firstname,
      lastname: values.lastname,
      email: values.email,
      phone: values.phone,
      password_confirmation: values.password_confirmation,
      password: values.password,
    };
    const nextUrl = 'shops';
    userService
      .update(activeMenu?.data?.seller?._id, body)
      .then(() => {
        toast.success(t('successfully.updated'));
        navigate(`/${nextUrl}`);
        dispatch(fetchShops({ perPage: 10, page: 1 }));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
      })
      .catch((err) => setError(err.response.data.params))
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    showUserData(activeMenu?.data?.seller?._id);

    return () => {
      setLoading(false);
      setLoadingBtn(false);
    }
  }, []);

  return (
    <>
      {!loading ? (
        <Form
          form={form}
          layout='vertical'
          initialValues={{
            ...activeMenu.data,
          }}
          onFinish={onFinish}
          className='py-4'
        >
          <ShopUserForm error={error} loadingBtn={loadingBtn} />
        </Form>
      ) : (
        <Loading />
      )}
    </>
  );
}
