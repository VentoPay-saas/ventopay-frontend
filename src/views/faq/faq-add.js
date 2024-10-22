import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../redux/slices/menu';
import LanguageList from '../../components/language-list';
import getTranslationFields from '../../helpers/getTranslationFields';
import { fetchFaqs } from '../../redux/slices/faq';
import { useTranslation } from 'react-i18next';
import faqService from '../../services/faq';
import FAQForm from './faq-form';

export default function FaqAdd() {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { languages } = useSelector((state) => state.formLang, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (values) => {
    const body = {
      question: getTranslationFields(languages, values, 'question'),
      answer: getTranslationFields(languages, values, 'answer'),
    };
    const nextUrl = 'settings/faqs';

    return faqService.create(body).then(() => {
      toast.success(t('successfully.created'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchFaqs({}));
      });
      navigate(`/${nextUrl}`);
    });
  };

  return (
    <Card title={t('add.faq')} extra={<LanguageList />}>
      <FAQForm form={form} handleSubmit={handleSubmit} />
    </Card>
  );
}
