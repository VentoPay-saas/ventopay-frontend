import { Button, Card, Col, Form, Input, Row, Switch } from 'antd';
import LanguageList from 'components/language-list';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import TextArea from 'antd/es/input/TextArea';
import { useEffect, useState } from 'react';
import getTranslationFields from 'helpers/getTranslationFields';
import { disableRefetch, removeFromMenu } from 'redux/slices/menu';
import { useNavigate, useParams } from 'react-router-dom';
import kitchenService from 'services/seller/kitchen';
import getLanguageFields from 'helpers/getLanguageFields';
import useDidUpdate from '../../../../../helpers/useDidUpdate';

const KitchenForm = ({ handleSubmit }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );
  const { myShop } = useSelector((state) => state.myShop, shallowEqual);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);

  useEffect(() => {
    if (id) {
      fetch();
    }
    // eslint-disable-next-line
  }, [id]);

  useDidUpdate(() => {
    if (activeMenu.refetch && id) {
      fetch();
    }
  }, [activeMenu.refetch]);

  const fetchKitchen = (id) => {
    setLoading(true);
    kitchenService
      .getById(id)
      .then(({ data }) => {
        form.setFieldsValue({
          ...getLanguageFields(languages, data, ['title', 'description']),
          active: !!data?.active,
        });
      })
      .finally(() => setLoading(false));
  };

  const fetch = () => {
    if (id) {
      fetchKitchen(id);
      dispatch(disableRefetch(activeMenu));
    }
  };

  const onFinish = (values) => {
    const body = {
      title: getTranslationFields(languages, values),
      description: getTranslationFields(languages, values, 'description'),
      active: !!values?.active,
      shop_id: myShop?.id,
    };
    setLoadingBtn(true);
    handleSubmit(body)
      .then(() => {
        const nextUrl = 'seller/kitchen';
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        navigate(`/${nextUrl}`);
      })
      .finally(() => {
        setLoadingBtn(false);
      });
  };

  return (
    <Form form={form} onFinish={onFinish} layout='vertical'>
      <Card extra={<LanguageList />} loading={loading}>
        <Row gutter={12}>
          <Col span={12}>
            {languages.map((item) => (
              <Form.Item
                label={t('name')}
                name={`title[${item?.locale || 'en'}]`}
                key={item?.locale}
                hidden={item?.locale !== defaultLang}
                rules={[
                  {
                    required: item?.locale === defaultLang,
                    message: t('required'),
                  },
                  {
                    type: 'string',
                    min: 2,
                    max: 200,
                    message: t('min.2.max.200.chars'),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            ))}
          </Col>
          <Col span={12}>
            {languages.map((item) => (
              <Form.Item
                label={t('description')}
                name={`description[${item?.locale || 'en'}]`}
                key={item?.locale}
                hidden={item?.locale !== defaultLang}
                rules={[
                  {
                    required: item?.locale === defaultLang,
                    message: t('required'),
                  },
                  {
                    type: 'string',
                    min: 2,
                    max: 200,
                    message: t('min.2.max.200.chars'),
                  },
                ]}
              >
                <TextArea rows={2} />
              </Form.Item>
            ))}
          </Col>
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
      <Card className='formFooterButtonsContainer'>
        <Button
          type='primary'
          htmlType='submit'
          loading={loadingBtn}
          disabled={loading}
        >
          {t('submit')}
        </Button>
      </Card>
    </Form>
  );
};

export default KitchenForm;
