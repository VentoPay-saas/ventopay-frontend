import { Button, Form, Input, Modal, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { SketchPicker } from 'react-color';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ImageUploadSingle from '../../../../components/image-upload-single';
import createImage from '../../../../helpers/createImage';
import { fetchSelletExtraValue } from '../../../../redux/slices/extraValue';
import extraService from '../../../../services/seller/extras';
import { DebounceSelect } from 'components/search';

export default function ExtraValueModal({
  modal,
  handleCancel,
  onSuccess,
  groupId,
}) {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [type, setType] = useState('text');
  const [image, setImage] = useState(null);
  const [color, setColor] = useState('');

  const { extraGroups } = useSelector(
    (state) => state.extraGroup,
    shallowEqual
  );

  useEffect(() => {
    if (modal?._id) {
      setType(modal.group.type);
      const body = {
        ...modal,
        extra_group_id: {
          label: modal?.group?.title,
          value: modal?.group?._id,
        },
        value: modal.value,
      };
      switch (modal.group.type) {
        case 'color':
          setColor(modal.value);
          break;

        case 'image':
          setImage(createImage(modal.value));
          break;

        default:
          break;
      }
      form.setFieldsValue(body);
    }
    if (groupId) {
      form.setFieldsValue({
        extra_group_id: {
          value: groupId,
        },
      });
    }
  }, [modal, groupId]);

  const updateExtra = (id, body) => {
    setLoadingBtn(true);
    extraService
      .updateValue(id, body)
      .then(() => {
        toast.success(t('successfully.updated'));
        handleCancel();
        dispatch(fetchSelletExtraValue());
      })
      .finally(() => setLoadingBtn(false));
  };

  const createExtra = (body) => {
    setLoadingBtn(true);
    extraService
      .createValue(body)
      .then(() => {
        toast.success(t('successfully.created'));
        handleCancel();
        dispatch(fetchSelletExtraValue());
        !!onSuccess && onSuccess();
      })
      .finally(() => setLoadingBtn(false));
  };

  const onFinish = (values) => {
    console.log(values);
    const body = {
      extra_group_id: values?.extra_group_id?.value,
      value: getValue(type, values.value),
    };

    if (modal?._id) {
      updateExtra(modal._id, body);
    } else {
      createExtra(body);
    }
  };

  function getValue(type, value) {
    switch (type) {
      case 'color':
        return value.hex;
      case 'text':
        return value;
      case 'image':
        return value.name;
      default:
        return '';
    }
  }

  const renderExtraValue = (type) => {
    switch (type) {
      case 'color':
        return (
          <SketchPicker
            onChangeComplete={(color) => setColor(color.hex)}
            color={color}
            disableAlpha={true}
          />
        );
      case 'text':
        return <Input placeholder={t('enter.extra.value')} />;

      case 'image':
        return (
          <ImageUploadSingle
            type='extras'
            image={image}
            setImage={setImage}
            form={form}
            name='value'
          />
        );

      default:
        return '';
    }
  };

  async function fetchExtraGroupList(search) {
    const params = { perPage: 10, active: 1, search };
    console.log('search => ', params);
    return extraService.getAllGroups(params).then((res) =>
      res?.data?.map((item) => ({
        value: item?._id,
        label: item?.title,
        key: item?._id,
      }))
    );
  }

  return (
    <Modal
      title={modal?._id ? t('edit.extra') : t('add.extra')}
      visible={!!modal}
      onCancel={handleCancel}
      footer={[
        <Button
          type='primary'
          onClick={() => form.submit()}
          loading={loadingBtn}
        >
          {t('save')}
        </Button>,
        <Button type='default' onClick={handleCancel}>
          {t('cancel')}
        </Button>,
      ]}
    >
      <Form name='extra-form' layout='vertical' form={form} onFinish={onFinish}>
        <Form.Item
          name='extra_group_id'
          label={t('extra.group')}
          hidden={!!groupId}
          rules={[{ required: true, message: '' }]}
        >
          <DebounceSelect fetchOptions={fetchExtraGroupList} />
        </Form.Item>
        <Form.Item
          name='value'
          label={t('value')}
          rules={[{ required: true, message: '' }]}
        >
          {renderExtraValue(type)}
        </Form.Item>
      </Form>
    </Modal>
  );
}
