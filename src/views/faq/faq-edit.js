import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  disableRefetch,
  removeFromMenu,
  setMenuData,
} from '../../redux/slices/menu';
import LanguageList from '../../components/language-list';
import getTranslationFields from '../../helpers/getTranslationFields';
import { fetchFaqs } from '../../redux/slices/faq';
import { useTranslation } from 'react-i18next';
import faqService from '../../services/faq';
import getLanguageFields from '../../helpers/getLanguageFields';
import Loading from '../../components/loading';
import FAQForm from './faq-form';

export default function FaqEdit() {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { languages } = useSelector((state) => state.formLang, shallowEqual);
  const { uuid } = useParams();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function fetchFaq(uuid) {
    setLoading(true);
    faqService
      .getById(uuid)
      .then(({ data }) => {
        const fields = ['answer', 'question'];
        form.setFieldsValue(getLanguageFields(languages, data, fields));
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  }

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchFaq(uuid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  const handleSubmit = (values) => {
    const body = {
      question: getTranslationFields(languages, values, 'question'),
      answer: getTranslationFields(languages, values, 'answer'),
    };
    const nextUrl = 'settings/faqs';

    return faqService.update(uuid, body).then(() => {
      toast.success(t('successfully.updated'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchFaqs({}));
      });
      navigate(`/${nextUrl}`);
    });
  };

  return (
    <Card title={t('edit.faq')} extra={<LanguageList />}>
      {!loading ? (
        <FAQForm form={form} handleSubmit={handleSubmit} />
      ) : (
        <Loading />
      )}
    </Card>
  );
}
