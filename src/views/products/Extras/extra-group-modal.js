import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import LanguageList from '../../../components/language-list';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import extraService from '../../../services/extra';
import { toast } from 'react-toastify';
import { fetchExtraGroups } from '../../../redux/slices/extraGroup';
import getTranslationFields from '../../../helpers/getTranslationFields';
import Loading from '../../../components/loading';

export default function ExtraGroupModal({ modal, handleCancel, onSuccess }) {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [loading, setLoading] = useState(false);
  const { languages, defaultLang } = useSelector(
    (state) => state.formLang,
    shallowEqual
  );

  function fetchExtraGroup(id) {
    setLoading(true);
    extraService
      .getGroupById(id)
      .then((res) => {
        const data = res.data;
        form.setFieldsValue({ ...data, ...getLanguageFields(data) });
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (modal?._id) {
      fetchExtraGroup(modal._id);
    }
  }, [modal]);

  function createExtraGroup(body) {
    setLoadingBtn(true);
    extraService
      .createGroup(body)
      .then(() => {
        toast.success(t('successfully.created'));
        handleCancel();
        dispatch(fetchExtraGroups());
        !!onSuccess && onSuccess()
      })
      .finally(() => setLoadingBtn(false));
  }

  const onFinish = (values) => {
    const body = {
      title: values.title,
      type: 'text',
    };
    if (modal?._id) {
      updateExtraGroup(modal?._id, body);
    } else {
      createExtraGroup(body);
    }
  };

  function updateExtraGroup(id, body) {
    setLoadingBtn(true);
    extraService
      .updateGroup(id, body)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(fetchExtraGroups());
        handleCancel();
      })
      .finally(() => setLoadingBtn(false));
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

  return (
    <Modal
      title={modal?._id ? t('edit.extra.group') : t('add.extra.group')}
      visible={!!modal}
      onCancel={handleCancel}
      footer={[
        <Button
          key='save-button-group'
          type='primary'
          onClick={() => form.submit()}
          loading={loadingBtn}
        >
          {t('save')}
        </Button>,
        <Button key='cancel-button-group' type='default' onClick={handleCancel}>
          {t('cancel')}
        </Button>,
      ]}
    >
      {!loading ? (
        <>
          <div className='d-flex justify-content-end'>
            <LanguageList />
          </div>
          <Form
            layout='vertical'
            name='extra-group'
            form={form}
            onFinish={onFinish}
          >
            {/* {languages.map((item) => (
              <Form.Item
                key={'title' + item.locale}
                rules={[
                  {
                    required: item.locale === defaultLang,
                    message: t('required'),
                  },
                ]}
                name={`title[${item.locale}]`}
                label={t('title')}
                hidden={item.locale !== defaultLang}
              >
                <Input placeholder={t('title')} />
              </Form.Item>
            ))} */}
            <Form.Item
              key={'title'}
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
              name={`title`}
              label={t('title')}
            >
              <Input placeholder={t('title')} />
            </Form.Item>
          </Form>
        </>
      ) : (
        <Loading />
      )}
    </Modal>
  );
}
