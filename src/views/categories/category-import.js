import React from 'react';
import { Button, Card } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Dragger from 'antd/lib/upload/Dragger';
import { InboxOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { setMenuData } from '../../redux/slices/menu';
import categoryService from '../../services/category';
import { example } from 'configs/app-global';

export default function CategoryImport() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const createFile = (file) => {
    return {
      uid: file.name,
      name: file.name,
      status: 'done',
      url: file.name,
      created: true,
    };
  };

  const handleUpload = ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append('file', file);
    categoryService
      .import(formData)
      .then((data) => {
        toast.success(t('successfully.import'));
        dispatch(setMenuData({ activeMenu, data: createFile(file) }));
        onSuccess('ok');
      })
      .catch((err) => {
        onError(err.message);
      });
  };

  const downloadFile = () => {
    const body = example + 'import-example/categories.xlsx';
    window.location.href = body;
  };

  return (
    <Card title={t('import')}>
      <Button type='primary' className='mb-4' onClick={downloadFile}>
        {t('download.csv')}
      </Button>
      <Dragger
        name='file'
        multiple={false}
        maxCount={1}
        customRequest={handleUpload}
        defaultFileList={activeMenu?.data ? [activeMenu?.data] : null}
        accept='.csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      >
        <p className='ant-upload-drag-icon'>
          <InboxOutlined />
        </p>
        <p className='ant-upload-text'>
          Click or drag file to this area to upload
        </p>
        <p className='ant-upload-hint'>
          Import Categories from file to this area
        </p>
      </Dragger>
    </Card>
  );
}
