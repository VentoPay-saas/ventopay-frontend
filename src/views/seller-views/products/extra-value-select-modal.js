import { Button, Checkbox, Empty, List, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import extraService from 'services/seller/extras';
import ExtraValueModal from './Extras/extra-value-modal';
import { PlusOutlined } from '@ant-design/icons';

const ExtraValueSelectModal = ({ extra, onClose, onSelect }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [extraValues, setExtraValues] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleChange = (values) => {
    setSelectedValues(values);
  };

  const handleSelect = () => {
    const list = [];
    extraValues.forEach((extraValue) => {
      selectedValues.forEach((value) => {
        if (extraValue.value === value) {
          list.push(extraValue);
        }
      });
    });
    onSelect(extra?.value, list);
    onClose();
  };

  function fetchExtra(id) {
    setLoading(true);
    extraService
      .getGroupById(id)
      .then((res) =>
        setExtraValues(
          res.data.extra_values.map((item) => ({
            label: item.value,
            value: item.id,
            group: item.group.translation?.title
          }))
        )
      )
      .finally(() => {
        setLoading(false);
      });
  }
  useEffect(() => {
    if (!!extra?.value) {
      fetchExtra(extra.value);
      setSelectedValues(extra?.values?.map((value) => value.value) || []);
    }
  }, [extra?.value]);

  console.log(extra)

  return (
    <>
      <Modal
        visible={!!extra}
        onCancel={onClose}
        footer={[
          <Button onClick={onClose}>{t('cancel')}</Button>,
          !loading && extraValues.length > 0 && (
            <Button onClick={handleSelect} type='primary'>
              {t('save')}
            </Button>
          ),
        ]}
      >
        <Checkbox.Group
          value={selectedValues}
          onChange={handleChange}
          className='w-100'
        >
          {extraValues?.length === 0 && !loading ? (
            <Empty />
          ) : (
            <List
              dataSource={extraValues}
              loading={loading}
              renderItem={(item) => (
                <List.Item>
                  <Checkbox value={item.value}>{item?.label}</Checkbox>
                </List.Item>
              )}
            />
          )}
        </Checkbox.Group>
        {!loading ? (
          <Button
            type='link'
            onClick={() => setIsAddModalOpen(true)}
            style={{ paddingLeft: 0 }}
            icon={<PlusOutlined />}
          >
            {t('add.new.extra')}
          </Button>
        ) : null}
      </Modal>
      {extra && (
        <ExtraValueModal
          modal={isAddModalOpen}
          handleCancel={() => setIsAddModalOpen(false)}
          groupId={extra?.value}
          onSuccess={() => fetchExtra(extra?.value)}
        />
      )}
    </>
  );
};

export default ExtraValueSelectModal;
