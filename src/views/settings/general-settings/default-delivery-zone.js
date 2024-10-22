import { Button, Card, Col, Form, Row, Space } from 'antd';
import DrawingManager from 'components/drawing-map';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import useDemo from 'helpers/useDemo';
import settingService from 'services/settings';
import { fetchSettings } from 'redux/slices/globalSettings';
import { useDispatch } from 'react-redux';

const DefaultDeliveryZone = ({ triangleCoords, setTriangleCoords }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { isDemo } = useDemo();

  const [merge, setMerge] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const updateSettings = (data) => {
    setLoadingBtn(true);
    settingService
      .update(data)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(fetchSettings({}));
      })
      .finally(() => setLoadingBtn(false));
  };

  const onFinish = () => {
    if (triangleCoords?.length < 3) {
      toast.warning(t('place.selected.map'));
      return;
    }

    if (!merge) {
      toast.warning(t('place.selected.map'));
      return;
    }

    const body = {
      default_delivery_zone: triangleCoords?.map((item) => [
        item?.lng,
        item?.lat,
      ]),
    };
    updateSettings(body);
  };

  return (
    <Form form={form} layout='vertical' onFinish={onFinish}>
      <Card>
        <Row gutter={12}>
          <Col span={24}>
            <DrawingManager
              triangleCoords={triangleCoords}
              settriangleCoords={setTriangleCoords}
              setMerge={setMerge}
            />
          </Col>
        </Row>
        <Space className='mt-3'>
          <Button
            type='primary'
            htmlType='submit'
            loading={loadingBtn}
            disabled={isDemo}
          >
            {t('save')}
          </Button>
        </Space>
      </Card>
    </Form>
  );
};

export default DefaultDeliveryZone;
