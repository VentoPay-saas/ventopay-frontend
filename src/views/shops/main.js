import React, { useEffect, useState } from 'react';
import { Button, Form, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { replaceMenu, setMenuData } from '../../redux/slices/menu';
import shopService from '../../services/shop';
import { useTranslation } from 'react-i18next';
import getDefaultLocation from '../../helpers/getDefaultLocation';
import ShopFormData from 'components/forms/shop-form';

const ShopMain = ({ next, action_type = '', user }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { uuid } = useParams();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { settings } = useSelector(
    (state) => state.globalSettings,
    shallowEqual,
  );

  const [location, setLocation] = useState(
    activeMenu?.data?.location
      ? {
          lat: parseFloat(activeMenu?.data?.location?.latitude),
          lng: parseFloat(activeMenu?.data?.location?.longitude),
        }
      : getDefaultLocation(settings),
  );

  const [loadingBtn, setLoadingBtn] = useState(false);
  const [logoImage, setLogoImage] = useState(
    activeMenu.data?.logo_img ? [activeMenu.data?.logo_img] : [],
  );
  const [backImage, setBackImage] = useState(
    activeMenu.data?.background_img ? [activeMenu.data?.background_img] : [],
  );

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      data.open_time = JSON.stringify(data?.open_time);
      data.close_time = JSON.stringify(data?.close_time);
      dispatch(
        setMenuData({ activeMenu, data: { ...activeMenu.data, ...data } }),
      );
    };
    // eslint-disable-next-line
  }, []);

  const onFinish = (values) => {
    // return console.log('values', values);
    setLoadingBtn(true);
    const body = {
      ...values,
      'images[0]': logoImage?.[0]?.name,
      'images[1]': backImage?.[0]?.name,
      tags: values?.tags?.map((e) => e.value),
      user_id: values?.user?.value,
      open: values?.open ? 1 : 0,
      'location[latitude]': location?.lat,
      'location[longitude]': location?.lng,
      user: undefined,
      wifi_name: values?.wifi_name || '',
      wifi_password: values?.wifi_password || '',
      order_payment: values?.order_payment?.value || values?.order_payment,
    };
    if (action_type === 'edit') {
      shopUpdate(values, body);
    } else {
      shopCreate(values, body);
    }
  };

  function shopCreate(values, params) {
    shopService
      .create(params)
      .then(({ data }) => {
        dispatch(
          replaceMenu({
            id: `shop-${data.uuid}`,
            url: `shop/${data.uuid}`,
            name: t('add.shop'),
            data: { ...values, id: data?.id, seller: data?.seller },
            refetch: false,
          }),
        );
        navigate(`/shop/${data.uuid}?step=1`);
      })
      .catch((err) => console.error(err.response.data.params))
      .finally(() => setLoadingBtn(false));
  }

  const shopUpdate = (values, params) => {
    shopService
      .update(uuid, params)
      .then(() => {
        dispatch(
          setMenuData({
            activeMenu,
            data: values,
          }),
        );
        next();
      })
      .catch((err) => console.error(err.response.data.params))
      .finally(() => setLoadingBtn(false));
  };

  return (
    <>
      <Form
        form={form}
        name='basic'
        layout='vertical'
        onFinish={onFinish}
        initialValues={{
          status: 'new',
          ...activeMenu.data,
        }}
      >
        <ShopFormData
          form={form}
          user={user}
          backImage={backImage}
          setBackImage={setBackImage}
          logoImage={logoImage}
          setLogoImage={setLogoImage}
          location={location}
          setLocation={setLocation}
        />
        <Space>
          <Button type='primary' htmlType='submit' loading={loadingBtn}>
            {t('next')}
          </Button>
        </Space>
      </Form>
    </>
  );
};
export default ShopMain;
