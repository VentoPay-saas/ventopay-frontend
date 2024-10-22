import React, { useEffect, useMemo, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  Col,
  Form,
  Image,
  Input,
  InputNumber,
  Row,
  Select,
  Spin,
  Switch,
} from 'antd';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import advertService from '../../services/advert';
import { toast } from 'react-toastify';
import getTranslationFields from '../../helpers/getTranslationFields';
import LanguageList from 'components/language-list';
import bannerService from 'services/banner';
import { DebounceSelect } from 'components/search';
import { disableRefetch, setMenuData, removeFromMenu } from 'redux/slices/menu';

const AdvertForm = ({ id }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [banner, setBanner] = useState(null);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual
  );

  const timeOptions = useMemo(
    () => [
      { value: 'minute', label: t('minute') },
      {
        value: 'hour',
        label: t('hour'),
      },
      {
        value: 'day',
        label: t('day'),
      },
      {
        value: 'month',
        label: t('month'),
      },
      {
        value: 'year',
        label: t('year'),
      },
    ],
    []
  );
  const [loading, setLoading] = useState(false);
  const [isFetching, setFetching] = useState(false);

  const onFinish = (values) => {
    const params = {
      ...values,
      title: getTranslationFields(languages, values, 'title'),
      active: Number(values.active),
      time_type: values.time_type.value,
      banner_id: values.banner_id.value,
    };
    if (!id) {
      advertCreate(params);
    } else {
      advertUpdate(params);
    }
  };

  const advertCreate = (params) => {
    setLoading(true);
    const nextUrl = 'catalog/advert';
    advertService
      .create(params)
      .then((res) => {
        navigate(`/${nextUrl}`);
        toast.success(t('successfully.created'));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
      })
      .finally(() => setLoading(false));
  };

  const advertUpdate = (params) => {
    setLoading(true);
    const nextUrl = 'catalog/advert';
    advertService
      .update(id, params)
      .then((res) => {
        navigate('/catalog/advert');
        toast.success(t('successfully.updated'));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
      })
      .finally(() => setLoading(false));
  };

  async function fetchBanners(search) {
    const params = {
      search,
      perPage: 10,
      active: 1,
    };
    return bannerService.getAll(params).then((res) => formatBanner(res.data));
  }

  function formatBanner(data) {
    return data.map((item) => ({
      label: item?.translation.title,
      value: item.id,
      self: item,
    }));
  }

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

  const getAd = (alias) => {
    setFetching(true);
    advertService
      .getById(alias)
      .then((res) => {
        let ad = res.data;

        const data = {
          ...ad,
          time_type: { value: ad.time_type, label: t(ad.time_type) },
          banner_id: {
            value: ad.banner?.id,
            label: ad.banner?.translation?.title,
          },
          ...getLanguageFields(ad),
        };
        setBanner(ad.banner);
        form.setFieldsValue(data);
        dispatch(setMenuData({ activeMenu, data }));
      })
      .finally(() => {
        dispatch(disableRefetch(activeMenu));
        setFetching(false);
      });
  };

  useEffect(() => {
    if (!!id) {
      getAd(id);
    }
  }, [id]);

  if (isFetching) {
    return (
      <Card title={t('edit.ad')}>
        <div className='d-flex justify-content-center align-items-center'>
          <Spin size='large' className='py-5' />
        </div>
      </Card>
    );
  }

  return (
    <Form
      layout='vertical'
      form={form}
      initialValues={{ active: true }}
      onFinish={onFinish}
    >
      <Card title={!!id ? t('edit.ad') : t('add.ad')} extra={<LanguageList />}>
        <Row gutter={12}>
          <Col span={12}>
            {languages.map((item) => (
              <Form.Item
                key={'title' + item.id}
                label={t('name')}
                name={`title[${item.locale}]`}
                rules={[
                  {
                    validator(_, value) {
                      if (!value && item?.locale === defaultLang) {
                        return Promise.reject(new Error(t('required')));
                      } else if (value && value?.trim() === '') {
                        return Promise.reject(new Error(t('no.empty.space')));
                      } else if (value && value?.length < 2) {
                        return Promise.reject(new Error(t('min.2.letters')));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                hidden={item.locale !== defaultLang}
              >
                <Input />
              </Form.Item>
            ))}
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('time.type')}
              name='time_type'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <Select
                labelInValue={true}
                filterOption={false}
                options={timeOptions}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('time')}
              name='time'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
                {
                  type: 'number',
                  min: 0,
                  message: t('must.be.positive'),
                },
                {
                  type: 'number',
                  max: 32000,
                  message: t('must.be.less.than.32000'),
                },
              ]}
            >
              <InputNumber className='w-100' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('price')}
              name='price'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
                {
                  type: 'number',
                  min: 0,
                  message: t('must.be.positive'),
                },
              ]}
            >
              <InputNumber className='w-100' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('banner')}
              name={'banner_id'}
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <DebounceSelect
                fetchOptions={fetchBanners}
                onSelect={(_, value) => setBanner(value.self)}
                debounceTimeout={200}
              />
            </Form.Item>
          </Col>
          {banner && (
            <Col span={12}>
              <Image width={200} src={banner.img} />
            </Col>
          )}
          <Col span={6}>
            <Form.Item
              label={t('active')}
              name='active'
              valuePropName='checked'
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Card>
      <Button type='primary' htmlType='submit' loading={loading}>
        {t('submit')}
      </Button>
    </Form>
  );
};

export default AdvertForm;
